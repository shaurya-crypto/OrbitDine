"use client";

import { useState, useEffect, useRef } from "react";
import { Users as UsersIcon, Mail, Phone, Calendar, Loader2, Search, MoreVertical, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { useAuthStore } from "@/stores/authStore";

export function UserTable({ initialData }: { initialData: any[] }) {
  const [users, setUsers] = useState<any[]>(initialData);
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialData.length >= 10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("all");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const confirmProvider = useConfirm();
  const { userId } = useAuthStore();
  const currentUserEmail = users.find((u: any) => u._id.toString() === userId)?.email || "";

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        resetAndFetch(search, role);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch, role]);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    resetAndFetch(debouncedSearch, newRole);
  };

  const resetAndFetch = async (currentSearch: string, currentRole: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/list?page=1&limit=10&search=${currentSearch}&role=${currentRole}`);
      const data = await res.json();
      setUsers(data.users || []);
      setPage(2);
      setHasMore((data.users || []).length >= 10);
    } catch (err) {
      console.error("Failed to filter users", err);
    } finally {
      setLoading(false);
    }
  };

  // Infinite Scroll logic
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasMore, loading, page, debouncedSearch, role]);

  // Click outside to close dropdown
  useEffect(() => {
    if (!openDropdown) return;
    const handleClick = (e: MouseEvent) => {
      setOpenDropdown(null);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openDropdown]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/list?page=${page}&limit=10&search=${debouncedSearch}&role=${role}`);
      const data = await res.json();
      
      if (data.users && data.users.length > 0) {
        setUsers((prev) => [...prev, ...data.users]);
        setPage((p) => p + 1);
        if (data.users.length < 10) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more users", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId: string, userName: string) => {
    const isConfirmed = await confirmProvider.confirm({
      title: "Promote to Superadmin",
      message: `Are you sure you want to promote ${userName || "this user"} to Superadmin? They will have full access to the platform.`,
      confirmText: "Promote",
      isDanger: true
    });

    setOpenDropdown(null);
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/promote`, { method: "POST" });
      if (res.ok) {
        // Update local state instantly
        setUsers(users.map(u => {
          if (u._id === userId && !u.roles?.includes("superadmin")) {
            return { ...u, roles: [...(u.roles || []), "superadmin"] };
          }
          return u;
        }));
      }
    } catch (err) {
      console.error("Failed to promote user", err);
    }
  };

  const handleRevoke = async (userId: string, userName: string) => {
    const isConfirmed = await confirmProvider.confirm({
      title: "Revoke Superadmin Access",
      message: `Are you sure you want to revoke Superadmin privileges from ${userName || "this user"}? They will lose all administrative access.`,
      confirmText: "Revoke Access",
      isDanger: true
    });

    setOpenDropdown(null);
    if (!isConfirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/revoke`, { method: "POST" });
      if (res.ok) {
        setUsers(users.map(u => {
          if (u._id === userId && u.roles?.includes("superadmin")) {
            return { ...u, roles: u.roles.filter((r: string) => r !== "superadmin") };
          }
          return u;
        }));
      }
    } catch (err) {
      console.error("Failed to revoke user", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {(["all", "customer", "owner", "manager", "staff", "kitchen", "superadmin"] as const).map(r => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors border whitespace-nowrap ${
                role === r 
                  ? "bg-text-primary text-base border-text-primary" 
                  : "bg-surface text-text-secondary border-border hover:border-text-secondary/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-full py-2.5 pl-10 pr-4 text-text-primary outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <GlassPanel className="border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-widest text-text-secondary font-medium bg-surface">
                <th className="p-4 pl-6">User</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Roles</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u: any) => (
                <tr key={u._id.toString()} className="hover:bg-text-primary/5 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center shrink-0">
                        <UsersIcon className="w-5 h-5 text-text-secondary" />
                      </div>
                      <div>
                        <Link href={`/admin/users/${u._id}`} className="font-medium text-text-primary hover:text-accent transition-colors">
                          {u.fullName || "Unnamed User"}
                        </Link>
                        <p className="text-xs text-text-secondary">ID: {u._id.toString().slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{u.email}</span>
                      </div>
                      {u.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{u.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {u.roles?.map((r: string) => (
                        <span key={r} className={`px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider ${
                          r === "superadmin" ? "bg-red-500/10 text-red-500" :
                          r === "owner" ? "bg-blue-500/10 text-blue-500" :
                          r === "customer" ? "bg-purple-500/10 text-purple-500" :
                          "bg-border text-text-secondary"
                        }`}>
                          {r}
                        </span>
                      ))}
                      {!u.roles?.length && (
                        <span className="px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider bg-border text-text-secondary">
                          {u.role || "None"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      u.isVerified ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {u.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-text-secondary flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(u.createdAt).toISOString().split('T')[0]}
                  </td>
                  <td className="p-4 pr-6 text-right relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === u._id ? null : u._id); }}
                      className="p-2 rounded-lg hover:bg-border transition-colors text-text-secondary"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openDropdown === u._id && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-6 top-12 z-50 w-48 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95"
                      >
                        <div className="p-1">
                          {u.roles?.includes("superadmin") ? (
                            currentUserEmail === "makeiot7@gmail.com" && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleRevoke(u._id.toString(), u.fullName); }}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left font-medium"
                              >
                                <ShieldAlert className="w-4 h-4" />
                                Revoke Admin
                              </button>
                            )
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handlePromote(u._id.toString(), u.fullName); }}
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-accent hover:bg-accent-soft rounded-lg transition-colors text-left font-medium"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              Promote to Admin
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary">
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(hasMore || loading) && (
          <div ref={loaderRef} className="w-full py-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        )}
      </GlassPanel>
    </div>
  );
}
