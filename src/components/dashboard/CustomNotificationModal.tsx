import { useState } from "react";
import { X, Send, Megaphone } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/components/ui/ToastProvider";

export function CustomNotificationModal({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { restaurantId, roles } = useAuthStore();
  const toast = useToast();

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);

    const primaryRole = ["owner", "manager", "staff", "kitchen"].find(r => roles.includes(r as any)) || "staff";

    try {
      const res = await fetch("/api/notifications/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, message, senderRole: primaryRole })
      });

      if (!res.ok) throw new Error("Failed to send");
      
      toast.success("Broadcast sent to all staff!");
      onClose();
    } catch (e) {
      toast.error("Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-surface border border-border w-full max-w-md rounded-[2rem] p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center text-accent">
            <Megaphone size={24} />
          </div>
          <div>
            <h2 className="text-xl font-serif text-text-primary">Broadcast Message</h2>
            <p className="text-sm text-text-secondary">Send a custom alert to all staff.</p>
          </div>
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          className="w-full h-32 bg-base border border-border rounded-2xl p-4 text-text-primary resize-none outline-none focus:border-accent mb-6"
        />

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-medium text-text-secondary hover:bg-base transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSend}
            disabled={isSending || !message.trim()}
            className="px-6 py-3 bg-accent text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send size={18} />
            {isSending ? "Sending..." : "Broadcast"}
          </button>
        </div>
      </div>
    </div>
  );
}
