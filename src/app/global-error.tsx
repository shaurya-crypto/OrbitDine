"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0A0B] text-white font-sans antialiased">
        <div className="min-h-screen w-full flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 text-center flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-medium mb-2">Critical System Error</h2>
              <p className="text-white/60 text-sm">
                A critical error occurred that prevented the application from loading.
              </p>
            </div>
            <button
              onClick={() => reset()}
              className="w-full py-3 px-4 bg-[#FF4500] text-white rounded-xl hover:bg-[#FF4500]/90 transition-colors font-medium shadow-lg shadow-[#FF4500]/20"
            >
              Restart Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
