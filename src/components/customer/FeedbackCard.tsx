"use client";

import { useState } from "react";
import { Star, MessageSquare, CheckCircle, ChevronRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Loader } from "@/components/ui/Loader";

interface FeedbackCardProps {
  restaurantId: string;
  sessionId: string;
  orderId?: string;
  customerId?: string;
  onSuccess?: () => void;
}

export function FeedbackCard({ restaurantId, sessionId, orderId, customerId, onSuccess }: FeedbackCardProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState<"rating" | "details">("rating");

  const submitFeedback = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/restaurant/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          sessionId,
          orderId,
          customerId,
          rating,
          feedback
        })
      });

      if (res.ok) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <GlassPanel premium className="p-8 text-center animate-fade-in border-accent/20 bg-accent-soft">
        <CheckCircle className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="text-xl font-serif text-text-primary mb-2">Thank you!</h3>
        <p className="text-sm text-text-secondary">Your feedback helps us deliver a better experience.</p>
      </GlassPanel>
    );
  }

  return (
    <GlassPanel premium className="p-6 md:p-8 animate-fade-in">
      <div className="text-center mb-6">
        <h3 className="text-xl md:text-2xl font-serif text-text-primary mb-2">Rate Your Experience</h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto">Your feedback helps the restaurant improve and helps other diners discover great places.</p>
      </div>

      <div className="flex justify-center gap-2 md:gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => {
              setRating(star);
              setStep("details");
            }}
            className="p-2 transition-transform hover:scale-110 active:scale-95"
          >
            <Star 
              className={`w-10 h-10 md:w-12 md:h-12 transition-colors ${
                (hoverRating || rating) >= star 
                  ? "fill-accent text-accent" 
                  : "text-border"
              }`} 
            />
          </button>
        ))}
      </div>

      {step === "details" && (
        <div className="animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Tell us more (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What was the highlight of your experience today?"
              className="w-full bg-base border border-border rounded-xl p-4 text-text-primary placeholder:text-text-secondary/50 focus:border-accent focus:ring-1 focus:ring-accent outline-none min-h-[100px] resize-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {["Food quality", "Service", "Ambience", "Cleanliness", "Value for money"].map(tag => (
              <button
                key={tag}
                onClick={() => setFeedback(prev => prev ? `${prev}, ${tag}` : tag)}
                className="text-xs bg-surface border border-border px-3 py-1.5 rounded-full text-text-secondary hover:text-text-primary hover:border-accent/50 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>

          <button 
            onClick={submitFeedback}
            disabled={loading}
            className="w-full py-4 bg-text-primary text-base rounded-2xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader type="spinner" className="w-5 h-5 border-t-base" /> : (
              <>Submit Feedback <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      )}
    </GlassPanel>
  );
}
