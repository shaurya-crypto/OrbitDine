"use client";

import { useState } from "react";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";
import { MoreVertical, ShieldAlert, CheckCircle, Trash2 } from "lucide-react";

export function RestaurantActions({ id, currentStatus, name }: { id: string, currentStatus: string, name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { confirm, prompt } = useConfirm();
  const toast = useToast();
  const router = useRouter();

  const handleStatusChange = async (newStatus: "active" | "suspended") => {
    setIsOpen(false);
    
    if (newStatus === "suspended") {
      const ok = await confirm({
        title: "Suspend Restaurant",
        message: `Are you sure you want to suspend ${name}? They will not be able to accept orders.`,
        isDanger: true,
        confirmText: "Suspend",
      });
      if (!ok) return;
    }

    try {
      const res = await fetch("/api/admin/restaurants/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success(`Restaurant ${newStatus} successfully.`);
      router.refresh();
    } catch (e) {
      toast.error("An error occurred.");
    }
  };

  const handleDelete = async () => {
    setIsOpen(false);
    const enteredName = await prompt({
      title: "Permanent Deletion",
      message: `Type "${name}" to confirm permanent deletion. This cannot be undone.`,
      isDanger: true,
      confirmText: "Permanently Delete",
    });

    if (enteredName !== name) {
      if (enteredName !== null) toast.error("Name did not match. Deletion cancelled.");
      return;
    }

    try {
      const res = await fetch("/api/admin/restaurants/status", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      
      toast.success(`Restaurant deleted successfully.`);
      router.refresh();
    } catch (e) {
      toast.error("An error occurred.");
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors focus:outline-none"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {currentStatus !== "active" && (
              <button 
                onClick={() => handleStatusChange("active")}
                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-zinc-800 flex items-center gap-2 transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Activate
              </button>
            )}
            {currentStatus !== "suspended" && (
              <button 
                onClick={() => handleStatusChange("suspended")}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <ShieldAlert className="w-4 h-4" /> Suspend
              </button>
            )}
            <div className="h-px bg-zinc-800 w-full" />
            <button 
              onClick={handleDelete}
              className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" /> Permanent Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
