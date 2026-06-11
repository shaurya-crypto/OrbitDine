"use client";

import { useState } from "react";
import { Copy, Check, X, ShieldAlert, Users, ChefHat } from "lucide-react";

interface InviteLinkModalProps {
  isOpen: boolean;
  restaurantId: string;
  onClose: () => void;
}

export function InviteLinkModal({ isOpen, restaurantId, onClose }: InviteLinkModalProps) {
  if (!isOpen) return null;
  const [selectedRole, setSelectedRole] = useState<"manager" | "staff" | "kitchen">("staff");
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/invite?restaurantId=${restaurantId}&role=${selectedRole}`;

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteLink);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
      } catch (err) {
        console.error("Fallback copy failed", err);
      }
      document.body.removeChild(textArea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-serif text-neutral-900 mb-1">Generate Invite Link</h2>
              <p className="text-neutral-500 text-sm">Select the role you wish to invite to your restaurant team.</p>
            </div>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-900 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-3 mb-8">
            <button
              onClick={() => setSelectedRole("manager")}
              className={`w-full p-4 rounded-xl border flex items-start gap-4 transition-all ${
                selectedRole === "manager" ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900" : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
            >
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-neutral-900">Manager</h3>
                <p className="text-xs text-neutral-500 mt-1">Full operational control. Can manage staff, edit menu, and view basic analytics.</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole("staff")}
              className={`w-full p-4 rounded-xl border flex items-start gap-4 transition-all ${
                selectedRole === "staff" ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900" : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
            >
              <div className="p-2 bg-green-100 text-green-600 rounded-lg shrink-0">
                <Users size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-neutral-900">Wait Staff</h3>
                <p className="text-xs text-neutral-500 mt-1">Handles live orders, table management, and customer requests.</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole("kitchen")}
              className={`w-full p-4 rounded-xl border flex items-start gap-4 transition-all ${
                selectedRole === "kitchen" ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900" : "border-neutral-200 hover:border-neutral-300 bg-white"
              }`}
            >
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0">
                <ChefHat size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-neutral-900">Kitchen Staff</h3>
                <p className="text-xs text-neutral-500 mt-1">Access to the Kitchen Display System (KDS) to prepare and fulfill orders.</p>
              </div>
            </button>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-6 flex items-center justify-between gap-4">
            <code className="text-xs text-neutral-600 truncate flex-1 font-mono">{inviteLink}</code>
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                copied ? "bg-green-100 text-green-600" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
