"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { Loader } from "@/components/ui/Loader";
import axios from "axios";
import { Users, AlertTriangle } from "lucide-react";

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-base" />}>
      <InviteContent />
    </Suspense>
  );
}

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const restaurantId = searchParams.get("restaurantId");
  const role = searchParams.get("role");
  
  const { roles, restaurantId: currentRestaurantId, userId } = useAuthStore();
  const isAuthenticated = !!userId;

  const [loading, setLoading] = useState(true);
  const [targetRestaurant, setTargetRestaurant] = useState<any>(null);
  const [currentRestaurant, setCurrentRestaurant] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    // If not authenticated, redirect to signup/login with the invite params
    if (!isAuthenticated) {
      router.replace(`/signup?restaurantId=${restaurantId}&role=${role}`);
      return;
    }

    if (!restaurantId || !role) {
      setError("Invalid invite link.");
      setLoading(false);
      return;
    }

    async function fetchDetails() {
      try {
        // Fetch target restaurant basic details
        const targetRes = await axios.get(`/api/restaurant/public?restaurantId=${restaurantId}`);
        setTargetRestaurant(targetRes.data.restaurant);

        // Fetch current restaurant details if they belong to one
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
          const currentRes = await axios.get(`/api/restaurant/public?restaurantId=${currentRestaurantId}`);
          setCurrentRestaurant(currentRes.data.restaurant);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch restaurant details.");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [isAuthenticated, router, restaurantId, role, currentRestaurantId]);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const res = await axios.post("/api/restaurant/staff/join", {
        restaurantId,
        role
      });
      if (res.data.success) {
        // Force reload to get fresh store state from cookie
        window.location.href = res.data.redirectUrl;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to join restaurant");
      setIsJoining(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-base">
        <Loader type="spinner" className="w-8 h-8 text-accent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-6 bg-base">
      <GlassPanel premium className="w-full max-w-lg p-8 shadow-2xl relative overflow-hidden">
        
        {/* Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-soft/20 blur-3xl rounded-full" />
        
        <div className="relative z-10 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-accent/20 text-accent flex items-center justify-center rounded-2xl mb-6 shadow-inner">
            <Users size={32} />
          </div>

          <h1 className="text-3xl font-serif text-text-primary mb-2 tracking-tight">You've been invited!</h1>
          
          {error ? (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl w-full">
              {error}
            </div>
          ) : (
            <div className="w-full">
              <p className="text-text-secondary text-base mb-6">
                You are invited to join <strong className="text-text-primary">{targetRestaurant?.name || "this restaurant"}</strong> as a <strong className="text-accent capitalize">{role}</strong>.
              </p>

              {currentRestaurantId === restaurantId ? (
                <div className="p-4 bg-surface-elevated border border-border rounded-xl text-text-secondary mb-6">
                  You are already a member of this restaurant's team.
                </div>
              ) : currentRestaurant ? (
                <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-xl mb-6 text-left flex gap-4 items-start">
                  <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-orange-600 font-medium mb-1">Transfer Warning</h4>
                    <p className="text-orange-600/80 text-sm leading-relaxed">
                      You are currently staff at <strong>{currentRestaurant.name}</strong>. 
                      Accepting this invitation will automatically remove you from their staff list and transfer your account to <strong>{targetRestaurant?.name}</strong>. The old restaurant owner will be notified.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-4 w-full mt-8">
                <button
                  onClick={() => router.push("/")}
                  disabled={isJoining}
                  className="flex-1 py-3 text-text-secondary hover:text-text-primary hover:bg-surface rounded-xl transition-colors font-medium border border-transparent hover:border-border disabled:opacity-50"
                >
                  Decline
                </button>
                <MagneticButton
                  onClick={handleJoin}
                  disabled={isJoining || currentRestaurantId === restaurantId}
                  className="flex-1 py-3 font-medium"
                >
                  {isJoining ? <Loader type="spinner" className="w-5 h-5 mx-auto" /> : (currentRestaurant ? "Confirm Transfer" : "Accept Invite")}
                </MagneticButton>
              </div>
            </div>
          )}
        </div>
      </GlassPanel>
    </main>
  );
}
