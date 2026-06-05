"use client";

import { Users, Store, MessageSquare, MessagesSquare, Lightbulb } from "lucide-react";

const features = [
  { icon: Store, title: "Restaurant Profiles" },
  { icon: MessageSquare, title: "Discussion Boards" },
  { icon: MessagesSquare, title: "Direct Messaging" },
  { icon: Users, title: "Group Conversations" },
  { icon: Lightbulb, title: "Knowledge Sharing" },
];

export function CommunitySection() {
  return (
    <section className="w-full py-24 md:py-32 bg-base border-y border-border" id="community">
      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-xs font-mono text-text-secondary uppercase tracking-widest px-3 py-1 bg-surface border border-border rounded-full opacity-60">
              In Development
            </span>
            <span className="text-xs font-mono text-accent uppercase tracking-widest px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
              Coming Soon
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-serif text-text-primary tracking-tight mb-6 opacity-80">
            OrbitDine Community
          </h2>
          
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-12 opacity-80">
            A dedicated network for restaurant owners and managers to connect, share insights, and discuss operational strategies.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {features.map((feat, i) => (
              <div key={i} className="flex flex-col items-center p-6 bg-surface/50 border border-border/50 rounded-2xl grayscale opacity-70">
                <feat.icon className="w-8 h-8 text-text-secondary mb-4" />
                <h3 className="text-sm font-medium text-text-primary text-center">
                  {feat.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
