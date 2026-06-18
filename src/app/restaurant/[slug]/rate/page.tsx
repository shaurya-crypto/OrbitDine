"use client";

import { useState, useEffect, use } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Star, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RateRestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch restaurantId from slug
    fetch(`/api/search?q=${resolvedParams.slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.results?.restaurants?.[0]) {
          setRestaurantId(data.results.restaurants[0]._id);
        }
      });
  }, [resolvedParams.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !restaurantId) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/restaurant/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          rating,
          feedback
        })
      });
      
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <GlassPanel premium className="max-w-md w-full p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-serif text-text-primary mb-3">Thank You!</h1>
          <p className="text-text-secondary mb-8">Your feedback helps us improve your next dining experience.</p>
          <button 
            onClick={() => router.push("/dashboard/customer")}
            className="w-full py-4 bg-accent text-white rounded-xl font-medium shadow-lg hover:bg-accent/90 transition-colors"
          >
            Return to Dashboard
          </button>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-text-primary mb-2">How was your meal?</h1>
          <p className="text-text-secondary">Please rate your dining experience.</p>
        </div>

        <GlassPanel className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`w-12 h-12 transition-colors ${
                      star <= (hoveredRating || rating) 
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" 
                        : "text-border fill-transparent"
                    }`} 
                  />
                </button>
              ))}
            </div>

            <div className="w-full mb-8">
              <label className="block text-sm font-medium text-text-secondary mb-2 text-left">
                Any additional feedback? (Optional)
              </label>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you loved or what we can improve..."
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-primary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all resize-none h-32"
              />
            </div>

            <button 
              type="submit"
              disabled={rating === 0 || submitting || !restaurantId}
              className={`w-full py-4 rounded-xl font-medium shadow-lg transition-all ${
                rating > 0 && restaurantId
                  ? "bg-accent text-white hover:bg-accent/90" 
                  : "bg-border text-text-secondary cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting..." : "Submit Rating"}
            </button>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}
