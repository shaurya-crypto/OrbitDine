"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Loader } from "@/components/ui/Loader";
import { Users, ShieldAlert, MoreVertical, Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";

interface StaffMember {
  _id: string;
  fullName: string;
  email: string;
  roles: string[];
  lastLogin?: string;
  createdAt: string;
}

export default function StaffManagementPage() {
  const { restaurantId, roles: userRoles } = useAuthStore();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const router = useRouter();
  const toast = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    if (!userRoles.includes("owner")) {
      router.replace("/");
      return;
    }
    
    if (restaurantId) {
      fetchStaff();
    }
  }, [restaurantId, userRoles, router]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/restaurant/staff?restaurantId=${restaurantId}`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data.staff);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoles = async (userId: string) => {
    if (editRoles.length === 0) {
      toast.warning("User must have at least one role.");
      return;
    }

    try {
      const res = await fetch(`/api/restaurant/staff`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roles: editRoles, action: "update" })
      });
      if (res.ok) {
        setStaff(staff.map(s => s._id === userId ? { ...s, roles: editRoles } : s));
        setEditingStaffId(null);
        toast.success("Roles updated successfully.");
      } else {
        toast.error("Failed to update roles.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update roles.");
    }
  };

  const handleRemoveStaff = async (userId: string) => {
    const ok = await confirm({ title: "Remove Staff", message: "Are you sure you want to remove this staff member from your restaurant?", isDanger: true });
    if (!ok) return;

    try {
      const res = await fetch(`/api/restaurant/staff`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "remove" })
      });
      if (res.ok) {
        setStaff(staff.filter(s => s._id !== userId));
        toast.success("Staff member removed.");
      } else {
        toast.error("Failed to remove staff member.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to remove staff member.");
    }
  };

  const toggleRole = (role: string) => {
    if (editRoles.includes(role)) {
      setEditRoles(editRoles.filter(r => r !== role));
    } else {
      setEditRoles([...editRoles, role]);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900 mb-1">Staff Management</h1>
          <p className="text-neutral-500">Manage roles and permissions for your team.</p>
        </div>
      </div>

      <GlassPanel className="p-0 overflow-hidden border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-200 text-sm font-medium text-neutral-500 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Roles</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                    No staff members found. Send an invite link from the dashboard!
                  </td>
                </tr>
              ) : staff.map((member) => (
                <tr key={member._id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-900">{member.fullName}</td>
                  <td className="px-6 py-4 text-neutral-500">{member.email}</td>
                  <td className="px-6 py-4">
                    {editingStaffId === member._id ? (
                      <div className="flex gap-2 flex-wrap max-w-xs">
                        {["manager", "staff", "kitchen"].map(r => (
                          <label key={r} className="flex items-center gap-1 text-xs cursor-pointer bg-neutral-100 px-2 py-1 rounded">
                            <input 
                              type="checkbox" 
                              checked={editRoles.includes(r)} 
                              onChange={() => toggleRole(r)}
                              className="w-3 h-3 accent-neutral-900"
                            />
                            <span className="capitalize">{r}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex gap-2 flex-wrap">
                        {member.roles.filter(r => r !== "customer").map(r => (
                          <span key={r} className={`px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wider ${
                            r === "manager" ? "bg-blue-100 text-blue-700" :
                            r === "staff" ? "bg-green-100 text-green-700" :
                            r === "kitchen" ? "bg-orange-100 text-orange-700" :
                            "bg-neutral-100 text-neutral-700"
                          }`}>
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingStaffId === member._id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingStaffId(null)} className="text-xs text-neutral-500 hover:text-neutral-900">Cancel</button>
                        <button onClick={() => handleUpdateRoles(member._id)} className="text-xs bg-neutral-900 text-white px-3 py-1.5 rounded-lg hover:bg-neutral-800">Save</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => { setEditingStaffId(member._id); setEditRoles(member.roles); }} className="text-neutral-400 hover:text-blue-600 transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleRemoveStaff(member._id)} className="text-neutral-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassPanel>
    </div>
  );
}
