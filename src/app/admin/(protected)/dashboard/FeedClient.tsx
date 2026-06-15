"use client";

import { useEffect, useState } from "react";
import { Activity, ShieldAlert, Store, Users } from "lucide-react";

interface FeedItem {
  id: string;
  type: "restaurant_signup" | "user_signup" | "critical_alert" | "system";
  message: string;
  timestamp: number;
}

export function FeedClient() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  useEffect(() => {
    let evtSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      setStatus("connecting");
      evtSource = new EventSource("/api/admin/feed");

      evtSource.onmessage = (event) => {
        // Handle generic messages if any
      };

      evtSource.addEventListener("connected", () => {
        setStatus("connected");
      });

      evtSource.addEventListener("restaurant_signup", (e) => {
        const data = JSON.parse(e.data);
        addFeedItem({
          id: Math.random().toString(),
          type: "restaurant_signup",
          message: `New restaurant joined: ${data.name}`,
          timestamp: Date.now()
        });
      });

      evtSource.addEventListener("critical_alert", (e) => {
        const data = JSON.parse(e.data);
        addFeedItem({
          id: Math.random().toString(),
          type: "critical_alert",
          message: data.message,
          timestamp: Date.now()
        });
      });

      evtSource.onerror = () => {
        setStatus("disconnected");
        evtSource?.close();
        // Attempt to reconnect after 5 seconds
        reconnectTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (evtSource) {
        evtSource.close();
      }
    };
  }, []);

  const addFeedItem = (item: FeedItem) => {
    setFeed((prev) => [item, ...prev].slice(0, 50)); // Keep last 50
  };

  return (
    <div className="flex flex-col h-[300px]">
      <div className="flex items-center gap-2 mb-4 text-xs font-medium uppercase tracking-widest text-zinc-500">
        <span className="relative flex h-2.5 w-2.5">
          {status === "connected" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
            status === "connected" ? "bg-emerald-500" : 
            status === "connecting" ? "bg-amber-500" : "bg-red-500"
          }`}></span>
        </span>
        {status}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {feed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600">
            <Activity className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Listening for platform events...</p>
          </div>
        ) : (
          feed.map((item) => (
            <div key={item.id} className="flex gap-3 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="shrink-0 mt-0.5">
                {item.type === "restaurant_signup" && <Store className="w-4 h-4 text-blue-500" />}
                {item.type === "critical_alert" && <ShieldAlert className="w-4 h-4 text-red-500" />}
                {item.type === "user_signup" && <Users className="w-4 h-4 text-purple-500" />}
                {item.type === "system" && <Activity className="w-4 h-4 text-zinc-400" />}
              </div>
              <div className="flex-1">
                <p className="text-zinc-300">{item.message}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {new Date(item.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
