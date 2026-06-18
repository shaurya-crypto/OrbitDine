"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Star, MessageSquare, ThumbsUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function OwnerReviewsPage() {
  const { restaurantId } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      fetch(`/api/reviews?restaurantId=${restaurantId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setReviews(data);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to load reviews");
          setLoading(false);
        });
    }
  }, [restaurantId]);

  const submitReply = async (reviewId: string) => {
    try {
      const token = localStorage.getItem("auth-token") || ""; // We might need to handle token appropriately, but we use cookies mostly
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ reviewId, restaurantReply: replyText })
      });
      if (res.ok) {
        toast.success("Reply posted");
        setReviews(reviews.map(r => r._id === reviewId ? { ...r, restaurantReply: replyText, restaurantRepliedAt: new Date() } : r));
        setActiveReplyId(null);
        setReplyText("");
      } else {
        toast.error("Failed to post reply");
      }
    } catch {
      toast.error("Network error");
    }
  };

  if (loading) return <div className="p-8 text-white">Loading reviews...</div>;

  const averageRating = reviews.length ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1) : "0.0";
  const totalReviews = reviews.length;
  const pendingReplies = reviews.filter(r => !r.restaurantReply).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-24 text-text-primary">
      <div className="mb-6">
        <h1 className="text-3xl font-serif mb-1">Reputation Engine</h1>
        <p className="text-zinc-400">Manage your reviews, analytics, and customer feedback.</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassPanel className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Average Rating</p>
            <div className="text-3xl font-bold flex items-center gap-2">
              {averageRating} <Star className="w-6 h-6 text-yellow-500 fill-current" />
            </div>
          </div>
        </GlassPanel>
        <GlassPanel className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Total Reviews</p>
            <div className="text-3xl font-bold">{totalReviews}</div>
          </div>
          <MessageSquare className="w-8 h-8 text-accent opacity-50" />
        </GlassPanel>
        <GlassPanel className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400 mb-1">Pending Replies</p>
            <div className="text-3xl font-bold text-orange-400">{pendingReplies}</div>
          </div>
          <Clock className="w-8 h-8 text-orange-400 opacity-50" />
        </GlassPanel>
      </div>

      {/* Reviews List */}
      <GlassPanel className="p-8">
        <h2 className="text-xl font-serif mb-6 border-b border-zinc-800 pb-2">Recent Reviews</h2>
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-zinc-500">No reviews yet.</p>
          ) : (
            reviews.map(review => (
              <div key={review._id} className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold">
                      {review.customerId?.fullName?.charAt(0) || "A"}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {review.customerId?.fullName || "Anonymous"}
                        {review.isVerifiedDiner && <CheckCircle className="w-3 h-3 text-green-500" />}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {new Date(review.createdAt).toLocaleDateString()} • {review.reviewSource || "web"}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "opacity-30"}`} />
                    ))}
                  </div>
                </div>

                <p className="text-zinc-300 mb-4">{review.feedback}</p>

                {review.sentimentScore !== undefined && (
                  <div className="flex gap-2 mb-4">
                    <span className={`text-xs px-2 py-1 rounded-md ${review.sentimentScore > 0 ? "bg-green-500/10 text-green-500" : review.sentimentScore < 0 ? "bg-red-500/10 text-red-500" : "bg-zinc-800 text-zinc-400"}`}>
                      AI Sentiment: {review.sentimentScore > 0 ? "Positive" : review.sentimentScore < 0 ? "Negative" : "Neutral"}
                    </span>
                  </div>
                )}

                {/* Owner Reply Section */}
                {review.restaurantReply ? (
                  <div className="mt-4 p-4 bg-accent/10 border border-accent/20 rounded-lg ml-6">
                    <div className="text-xs text-accent font-medium mb-1">Your Reply • {new Date(review.restaurantRepliedAt).toLocaleDateString()}</div>
                    <p className="text-sm text-zinc-300">{review.restaurantReply}</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    {activeReplyId === review._id ? (
                      <div className="space-y-3">
                        <textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm focus:border-accent focus:outline-none"
                          placeholder="Write your professional response..."
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => submitReply(review._id)} className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent/90">Post Reply</button>
                          <button onClick={() => setActiveReplyId(null)} className="px-4 py-2 bg-zinc-800 text-white text-sm rounded-lg hover:bg-zinc-700">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setActiveReplyId(review._id); setReplyText(""); }} className="text-sm text-accent hover:underline flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" /> Reply to customer
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </GlassPanel>
    </div>
  );
}
