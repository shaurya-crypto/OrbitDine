import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useSyncStore, SyncActionType } from "@/stores/syncStore";
import { useAuthStore } from "@/stores/authStore";

export const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to determine what type of sync action this is
const getSyncActionType = (url: string): SyncActionType | null => {
  if (url.includes('/orders/create')) return 'ORDER';
  if (url.includes('/orders/request-bill')) return 'BILL_REQUEST';
  if (url.includes('/restaurant/rate')) return 'FEEDBACK';
  if (url.includes('/orders/status')) return 'KITCHEN_STATUS';
  if (url.includes('/tables')) return 'TABLE_STATUS';
  return null;
};

// Generate UUID for idempotency
function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: any) =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

// Request Interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Exactly-Once Idempotency: Attach UUID to all mutating requests
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      const idempotencyKey = uuidv4();
      config.headers['X-Idempotency-Key'] = idempotencyKey;
      
      // Store the key on the config so we can access it in the error interceptor if we go offline
      (config as any)._idempotencyKey = idempotencyKey;
    }

    // 2. Offline Interception
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const actionType = getSyncActionType(config.url || '');
      
      if (actionType && config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
        // Enqueue the action
        useSyncStore.getState().enqueueAction({
          id: (config as any)._idempotencyKey,
          type: actionType,
          endpoint: `${config.baseURL || ''}${config.url}`,
          method: config.method.toUpperCase() as any,
          payload: config.data
        });

        // Resolve early with a 202-like mocked response so UI thinks it succeeded
        return Promise.reject({
          isOfflineQueued: true,
          actionType,
          response: {
            data: { success: true, queued: true, message: "Action saved offline. Will sync when connection restores." },
            status: 202
          }
        });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Auto-Retries on 5xx errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError | any) => {
    
    // If we deliberately rejected it because we queued it offline, resolve it gracefully back to the UI!
    if (error.isOfflineQueued) {
      return Promise.resolve(error.response);
    }

    const config = error.config;
    
    // Auto logout on 401 (if not trying to refresh token)
    if (error.response && error.response.status === 401 && !config.url?.includes("/auth/refresh")) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.href = "/login?session_expired=true";
      }
      return Promise.reject(error);
    }
    
    // Auto Retry logic for 500, 502, 503, 504 errors
    if (config && error.response && error.response.status >= 500) {
      config._retryCount = config._retryCount || 0;
      
      if (config._retryCount < 3) {
        config._retryCount += 1;
        
        // Exponential backoff: 1s, 2s, 4s
        const backoff = Math.pow(2, config._retryCount - 1) * 1000;
        await new Promise(resolve => setTimeout(resolve, backoff));
        
        return apiClient.request(config);
      }
    }

    return Promise.reject(error);
  }
);
