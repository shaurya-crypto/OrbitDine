"use client";

import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";
import { Star, MessageSquare } from "lucide-react";
import { Loader } from "@/components/ui/Loader";

export function FeedbackAnalyticsPanel({ restaurantId }: { restaurantId: string }) {
  const { data: analytics, isLoading } = useRealtimeAnalytics(restaurantId);

  if (isLoading) return <div className="p-8 flex justify-center"><Loader /></div>;
  if (!analytics || !analytics.feedback) return <div className="p-4 text-text-secondary">No feedback data available yet.</div>;

  const { recentReviews, ratingDistribution, totalReviews, averageRating } = analytics.feedback;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <p className="text-text-secondary text-sm mb-1">Average Rating</p>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-serif text-text-primary">{averageRating}</h2>
            <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
          </div>
        </div>
        <div className="text-right">
          <p className="text-text-secondary text-sm mb-1">Total Reviews</p>
          <h2 className="text-2xl font-serif text-text-primary">{totalReviews}</h2>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(stars => {
          const stat = ratingDistribution.find((r: any) => r.stars === stars);
          const count = stat ? stat.count : 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={stars} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-text-secondary flex items-center justify-end gap-1">
                {stars} <Star className="w-3 h-3" />
              </span>
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-text-secondary text-right">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Recent Comments */}
      {recentReviews && recentReviews.length > 0 && (
        <div className="pt-4 mt-6 border-t border-border">
          <h4 className="text-text-primary font-medium mb-4 flex items-center gap-2">
            <MessageSquare size={16} /> Recent Comments
          </h4>
          <div className="space-y-4">
            {recentReviews.slice(0, 3).map((review: any) => (
              <div key={review._id} className="bg-surface p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-border"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-text-secondary">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.feedback ? (
                  <p className="text-sm text-text-primary italic">"{review.feedback}"</p>
                ) : (
                  <p className="text-sm text-text-secondary italic">No comment provided.</p>
                )}
                {review.customerId?.fullName && (
                  <p className="text-xs text-text-secondary mt-2">— {review.customerId.fullName}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
