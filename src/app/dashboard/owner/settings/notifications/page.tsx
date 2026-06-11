"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Loader } from "@/components/ui/Loader";
import { useToast } from "@/components/ui/ToastProvider";

interface NotificationRouting {
  orderCreated: string[];
  orderStatusChanged: string[];
  billRequested: string[];
  foodReminder: string[];
  serveReminder: string[];
  emergency: string[];
}

interface OwnerSettings {
  globalNotificationsEnabled: boolean;
  kitchenCanCancelOrder: boolean;
  routing: NotificationRouting;
}

const ROLES = ["kitchen", "staff", "manager", "owner"];

const NOTIFICATION_TYPES = [
  { key: "orderCreated", label: "New Orders" },
  { key: "orderStatusChanged", label: "Order Status Updates (Ready)" },
  { key: "billRequested", label: "Bill Requests" },
  { key: "foodReminder", label: "Food Reminders (from Customer)" },
  { key: "serveReminder", label: "Serve Reminders (from Customer)" },
  { key: "emergency", label: "Emergency Alerts" },
] as const;

export default function NotificationSettingsPage() {
  const { restaurantId } = useAuthStore();
  const [settings, setSettings] = useState<OwnerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!restaurantId) return;

    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/owner/settings/notifications?restaurantId=${restaurantId}`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        } else {
          toast.error("Failed to load settings");
        }
      } catch (error) {
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [restaurantId]);

  const handleToggleGlobal = () => {
    if (!settings) return;
    setSettings({ ...settings, globalNotificationsEnabled: !settings.globalNotificationsEnabled });
  };

  const handleToggleKitchenCancel = () => {
    if (!settings) return;
    setSettings({ ...settings, kitchenCanCancelOrder: !settings.kitchenCanCancelOrder });
  };

  const handleToggleRole = (notifKey: keyof NotificationRouting, role: string) => {
    if (!settings) return;
    const currentRoles = [...settings.routing[notifKey]];
    const index = currentRoles.indexOf(role);
    if (index > -1) {
      currentRoles.splice(index, 1);
    } else {
      currentRoles.push(role);
    }

    setSettings({
      ...settings,
      routing: {
        ...settings.routing,
        [notifKey]: currentRoles
      }
    });
  };

  const handleSave = async () => {
    if (!settings || !restaurantId) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/owner/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          globalNotificationsEnabled: settings.globalNotificationsEnabled,
          kitchenCanCancelOrder: settings.kitchenCanCancelOrder,
          routing: settings.routing
        })
      });
      if (res.ok) {
        toast.success("Notification settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader /></div>;
  if (!settings) return <div className="p-8 text-center text-text-secondary">Failed to load settings.</div>;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-text-primary mb-2">Notification Routing</h1>
        <p className="text-text-secondary">Configure exactly who receives which alerts across your restaurant.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Master Switch</h3>
            <p className="text-sm text-text-secondary mt-1">Turn off all notifications globally across the system.</p>
          </div>
          <button 
            onClick={handleToggleGlobal}
            className={`w-14 h-8 rounded-full transition-colors relative ${settings.globalNotificationsEnabled ? 'bg-accent' : 'bg-surface-elevated'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${settings.globalNotificationsEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className={settings.globalNotificationsEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none transition-opacity'}>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Routing Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="p-4 border-b border-border text-text-secondary font-medium text-sm">Event Type</th>
                  {ROLES.map(role => (
                    <th key={role} className="p-4 border-b border-border text-center text-text-secondary font-medium text-sm capitalize">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NOTIFICATION_TYPES.map((type) => (
                  <tr key={type.key} className="hover:bg-base/30 transition-colors">
                    <td className="p-4 border-b border-border text-text-primary font-medium text-sm">
                      {type.label}
                    </td>
                    {ROLES.map(role => {
                      const isChecked = settings.routing[type.key].includes(role);
                      return (
                        <td key={`${type.key}-${role}`} className="p-4 border-b border-border text-center">
                          <label className="flex justify-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => handleToggleRole(type.key, role)}
                              className="w-5 h-5 rounded border-border text-accent focus:ring-accent bg-base"
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Kitchen Permissions</h3>
        
        <div className="flex items-center justify-between py-4 border-b border-border">
          <div>
            <h4 className="font-medium text-text-primary">Allow Kitchen to Cancel Orders</h4>
            <p className="text-sm text-text-secondary mt-1">If enabled, kitchen staff can cancel individual items or entire orders directly from the Kitchen Display System.</p>
          </div>
          <button 
            onClick={handleToggleKitchenCancel}
            className={`w-14 h-8 rounded-full transition-colors relative ${settings.kitchenCanCancelOrder ? 'bg-accent' : 'bg-surface-elevated'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all ${settings.kitchenCanCancelOrder ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
