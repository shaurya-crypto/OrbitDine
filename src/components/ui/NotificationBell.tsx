"use client";

import { useEffect, useState } from "react";
import { Bell, Check, Trash } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";

export function NotificationBell({ audience = "user", restaurantId }: { audience?: string, restaurantId?: string }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { userId } = useAuthStore();

  useEffect(() => {
    if (!userId) return;
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem("auth-token") || "";
        let url = `/api/notifications?audience=${audience}`;
        if (restaurantId) url += `&restaurantId=${restaurantId}`;
        
        const res = await fetch(url, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data);
        }
      } catch (e) {}
    };
    fetchNotifs();
    // In a real app, you would also listen to Pusher here for realtime updates
  }, [userId, audience, restaurantId]);

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("auth-token") || "";
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ notificationId: id, action: "mark_read", restaurantId })
      });
      setNotifications(notifications.map(n => n._id === id || id === "all" ? { ...n, readAt: new Date() } : n));
    } catch (e) {}
  };

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-zinc-800 transition-colors"
      >
        <Bell className="w-5 h-5 text-zinc-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-base"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface border border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="font-medium text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAsRead("all")} className="text-xs text-accent hover:underline">Mark all read</button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">No new notifications</div>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className={`p-4 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${!n.readAt ? "bg-accent/5" : ""}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-medium text-white">{n.title}</h4>
                    {!n.readAt && <span className="w-2 h-2 rounded-full bg-accent mt-1 flex-shrink-0"></span>}
                  </div>
                  <p className="text-xs text-zinc-400 mb-2">{n.message}</p>
                  
                  <div className="flex items-center gap-3">
                    {n.actionLink && (
                      <Link href={n.actionLink} className="text-xs text-accent hover:underline">
                        {n.ctaButton || "View"}
                      </Link>
                    )}
                    {!n.readAt && (
                      <button onClick={() => markAsRead(n._id)} className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                        <Check className="w-3 h-3" /> Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
