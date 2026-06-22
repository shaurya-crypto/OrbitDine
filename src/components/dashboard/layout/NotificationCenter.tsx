"use client";

import { useEffect, useState, useRef } from "react";
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
  const { restaurantId, roles } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const audioLoopRef = useRef<NodeJS.Timeout | null>(null);
  const alarmStartTimeRef = useRef<number | null>(null);
  const escalatedLevel1Ref = useRef(false);
  const escalatedLevel2Ref = useRef(false);
  const activeAlarmMetaRef = useRef<{ title: string, message: string } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (!restaurantId) return;
    try {
      const stored = localStorage.getItem(`orbitdine_notifications_${restaurantId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        const oneDayAgo = new Date().getTime() - 24 * 60 * 60 * 1000;

        // Filter to last 24 hours and map strings back to Date objects
        const recentNotifications = parsed
          .map((n: any) => ({ ...n, time: new Date(n.time) }))
          .filter((n: Notification) => n.time.getTime() > oneDayAgo);

        setNotifications(recentNotifications);
        setUnreadCount(recentNotifications.filter((n: Notification) => !n.read).length);
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
    }
  }, [restaurantId]);

  // Save to localStorage when notifications change
  useEffect(() => {
    if (!restaurantId || notifications.length === 0) return;
    try {
      localStorage.setItem(`orbitdine_notifications_${restaurantId}`, JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to save notifications", e);
    }
  }, [notifications, restaurantId]);

  useEffect(() => {
    if (!restaurantId || !roles || roles.length === 0) return;

    const primaryRole = (["owner", "manager", "staff", "kitchen", "customer"] as const).find(r => roles.includes(r as any));
    const channelName = `private-${primaryRole}-${restaurantId}`;
    const pusherClient = getPusherClient();

    if (!pusherClient) return;

    const channel = pusherClient.subscribe(channelName);

    const stopLocalSounds = () => {
      if (audioLoopRef.current) clearInterval(audioLoopRef.current);
      audioLoopRef.current = null;
      setIsAlarmPlaying(false);
      alarmStartTimeRef.current = null;
    };

    const startLoopingSound = (type: 'order' | 'ready' | 'bill' | 'emergency' | 'custom', title: string, message: string) => {
      stopLocalSounds(); // clear any existing
      setIsAlarmPlaying(true);
      alarmStartTimeRef.current = Date.now();
      escalatedLevel1Ref.current = false;
      escalatedLevel2Ref.current = false;
      activeAlarmMetaRef.current = { title, message };

      const playTone = (freq: number, waveType: OscillatorType, startTime: number, duration: number, vol: number = 0.1, audioCtx: any) => {
        try {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.type = waveType;
          osc.frequency.setValueAtTime(freq, startTime);

          gainNode.gain.setValueAtTime(0, startTime);
          gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start(startTime);
          osc.stop(startTime + duration);
        } catch (e) { }
      };

      const loop = () => {
        // Escalation Logic
        if (alarmStartTimeRef.current) {
          const elapsed = Date.now() - alarmStartTimeRef.current;
          if (elapsed > 20 * 60 * 1000 && !escalatedLevel1Ref.current) {
            escalatedLevel1Ref.current = true;
            fetch('/api/notifications/escalate', { method: 'POST', body: JSON.stringify({ restaurantId, level: 1, originalTitle: activeAlarmMetaRef.current?.title, originalMessage: activeAlarmMetaRef.current?.message }) });
          }
          if (elapsed > 30 * 60 * 1000 && !escalatedLevel2Ref.current) {
            escalatedLevel2Ref.current = true;
            fetch('/api/notifications/escalate', { method: 'POST', body: JSON.stringify({ restaurantId, level: 2, originalTitle: activeAlarmMetaRef.current?.title, originalMessage: activeAlarmMetaRef.current?.message }) });
          }
        }

        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (audioCtx.state === 'suspended') audioCtx.resume();
          const now = audioCtx.currentTime;

          if (type === 'order') {
            // High attention "new order"
            playTone(1046.5, 'square', now, 0.15, 1.0, audioCtx);
            playTone(1318.5, 'square', now + 0.12, 0.15, 1.0, audioCtx);
            playTone(1567.98, 'square', now + 0.24, 0.35, 1.0, audioCtx);

          } else if (type === 'ready') {
            // Pleasant but noticeable
            playTone(659.25, 'triangle', now, 0.12, 0.95, audioCtx);
            playTone(783.99, 'triangle', now + 0.1, 0.12, 0.95, audioCtx);
            playTone(987.77, 'triangle', now + 0.2, 0.5, 1.0, audioCtx);

          } else if (type === 'bill') {
            // Double confirmation ding
            playTone(1200, 'square', now, 0.12, 1.0, audioCtx);
            playTone(1500, 'square', now + 0.15, 0.12, 1.0, audioCtx);
            playTone(1200, 'square', now + 0.3, 0.2, 1.0, audioCtx);

          } else if (type === 'emergency') {
            // Very aggressive alternating alarm
            for (let i = 0; i < 10; i++) {
              playTone(
                i % 2 === 0 ? 1400 : 700,
                'square',
                now + i * 0.12,
                0.1,
                1.0,
                audioCtx
              );
            }

          } else if (type === 'custom') {
            // Rising notification
            playTone(500, 'sawtooth', now, 0.1, 1.0, audioCtx);
            playTone(750, 'sawtooth', now + 0.1, 0.1, 1.0, audioCtx);
            playTone(1000, 'sawtooth', now + 0.2, 0.3, 1.0, audioCtx);
          }
        } catch (e) {
          console.error("Audio play failed", e);
        }
      };

      loop(); // play immediately
      const intervalTime = type === 'emergency' ? 2000 : 4000;
      audioLoopRef.current = setInterval(loop, intervalTime);
    };

    const addNotification = (title: string, message: string, soundType?: 'order' | 'ready' | 'bill' | 'emergency' | 'custom') => {
      if (soundType) startLoopingSound(soundType, title, message);
      setNotifications(prev => [{
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        time: new Date(),
        read: false
      }, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);
    };

    // Bind events
    channel.bind(REALTIME_EVENTS.ORDER_CREATED, (data: any) => {
      addNotification("New Order Received", `Order placed for Table ${data.tableId}`, 'order');
    });

    channel.bind(REALTIME_EVENTS.ORDER_STATUS_CHANGED, (data: any) => {
      if (data.status === 'ready') {
        addNotification("Order Ready", `Food is ready for Table ${data.tableId} to be served!`, 'ready');
      }
    });

    channel.bind(REALTIME_EVENTS.BILL_REQUESTED, (data: any) => {
      addNotification("Bill Requested", `Table ${data.tableId} requested their bill.`, 'bill');
    });

    channel.bind("TABLE_EMERGENCY", (data: any) => {
      addNotification("🚨 TABLE EMERGENCY 🚨", `Table ${data.tableName || data.tableId} requires IMMEDIATE assistance!`, 'emergency');
    });

    channel.bind(REALTIME_EVENTS.STAFF_NOTIFICATION, (data: any) => {
      addNotification("Staff Alert", data.message, data.isSilent ? undefined : 'custom');
    });

    channel.bind(REALTIME_EVENTS.MANAGER_NOTIFICATION, (data: any) => {
      addNotification("Manager Alert", data.message, data.isSilent ? undefined : 'custom');
    });

    channel.bind("CUSTOM_ALERT", (data: any) => {
      addNotification("Broadcast Message", data.message, 'custom');
    });

    channel.bind("STOP_SOUNDS", () => {
      stopLocalSounds();
    });

    return () => {
      channel.unbind_all();
      const client = getPusherClient();
      if (client) client.unsubscribe(channelName);
    };
  }, [restaurantId, roles]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    if (restaurantId) {
      localStorage.removeItem(`orbitdine_notifications_${restaurantId}`);
    }
  };

  const handleStopAlarm = async () => {
    setIsAlarmPlaying(false);
    if (audioLoopRef.current) clearInterval(audioLoopRef.current);
    audioLoopRef.current = null;
    await fetch("/api/notifications/stop", { method: "POST", body: JSON.stringify({ restaurantId }) });
  };

  return (
    <div className="relative flex items-center gap-1">
      {isAlarmPlaying && (
        <button
          onClick={handleStopAlarm}
          className="animate-pulse bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs flex items-center gap-1 md:gap-2 shadow-lg shadow-red-500/20 mr-1 md:mr-2 whitespace-nowrap transition-transform active:scale-95"
        >
          <X size={14} strokeWidth={3} className="hidden md:block" />
          STOP ALARM
        </button>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-text-secondary hover:text-text-primary hover:bg-base rounded-xl transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-surface animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed top-[60px] left-4 right-4 md:absolute md:top-full md:left-auto md:right-0 md:mt-2 md:w-80 max-w-sm mx-auto bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh] md:max-h-[400px]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-base/50">
              <h3 className="font-serif text-text-primary flex items-center gap-2">
                Notifications
                {unreadCount > 0 && <span className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} new</span>}
              </h3>
              <div className="flex items-center gap-3">
                {notifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] uppercase tracking-wider text-emerald-500 hover:text-emerald-400 transition-colors">
                        Mark Read
                      </button>
                    )}
                    <button onClick={clearAllNotifications} className="text-[10px] uppercase tracking-wider text-red-500 hover:text-red-400 transition-colors">
                      Clear All
                    </button>
                  </div>
                )}
                <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-text-primary transition-colors"><X size={16} /></button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 bg-surface">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-text-secondary text-sm">No recent notifications</div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-4 transition-colors ${!n.read ? 'bg-base/50' : ''}`}>
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <h4 className={`text-sm font-medium ${!n.read ? 'text-text-primary' : 'text-text-secondary'}`}>{n.title}</h4>
                        <span className="text-[10px] text-text-secondary whitespace-nowrap">{n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{n.message}</p>
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
