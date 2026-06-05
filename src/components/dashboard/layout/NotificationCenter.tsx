"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { getPusherClient } from "@/lib/pusher/client";
import { REALTIME_EVENTS } from "@/lib/constants/realtimeEvents";
import { useAuthStore } from "@/stores/authStore";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

export function NotificationCenter() {
  const { restaurantId, role } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!restaurantId || !role) return;

    const channelName = `private-${role}-${restaurantId}`;
    const pusherClient = getPusherClient();
    
    if (!pusherClient) return;

    const channel = pusherClient.subscribe(channelName);

    const playSound = () => {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(() => {}); // Ignore if user hasn't interacted with document
      } catch (e) {}
    };

    const addNotification = (title: string, message: string) => {
      playSound();
      setNotifications(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        time: new Date(),
        read: false
      }, ...prev].slice(0, 50)); // keep last 50
      setUnreadCount(prev => prev + 1);
    };

    // Bind events
    channel.bind(REALTIME_EVENTS.ORDER_CREATED, (data: any) => {
      addNotification("New Order Received", `Order placed for Table ${data.tableId}`);
    });

    channel.bind(REALTIME_EVENTS.BILL_REQUESTED, (data: any) => {
      addNotification("Bill Requested", `Table ${data.tableId} requested their bill.`);
    });

    channel.bind(REALTIME_EVENTS.STAFF_NOTIFICATION, (data: any) => {
      addNotification("Staff Alert", data.message);
    });
    
    channel.bind(REALTIME_EVENTS.MANAGER_NOTIFICATION, (data: any) => {
      addNotification("Manager Alert", data.message);
    });

    return () => {
      channel.unbind_all();
      const client = getPusherClient();
      if (client) client.unsubscribe(channelName);
    };
  }, [restaurantId, role]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-950 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
              <h3 className="font-serif text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} new</span>}
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] uppercase tracking-wider text-zinc-400 hover:text-white">
                    Mark Read
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white"><X size={16} /></button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">No recent notifications</div>
              ) : (
                <div className="divide-y divide-zinc-800/50">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 transition-colors ${!n.read ? 'bg-zinc-800/20' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-medium ${!n.read ? 'text-white' : 'text-zinc-300'}`}>{n.title}</h4>
                        <span className="text-[10px] text-zinc-500">{n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
