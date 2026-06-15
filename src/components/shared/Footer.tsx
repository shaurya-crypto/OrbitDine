import Link from "next/link";
import { Globe, MessageSquare, Mail } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Pricing", "Case Studies", "Changelog"],
  Company: ["About Us", "Careers", "Blog", "Contact"],
  Resources: ["Documentation", "Help Center", "Community", "Partners"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"]
};

export function Footer() {
  return (
    <footer className="w-full bg-base border-t border-border pt-20 pb-10 relative overflow-hidden">
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-glass backdrop-blur-[40px] pointer-events-none z-0" />

      <div className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-20">

          <div className="w-full lg:w-1/3">
            <Link href="/" className="text-3xl font-serif tracking-tight text-text-primary mb-6 block">
              Orbit<span className="text-accent">Dine</span>
            </Link>
            <p className="text-text-secondary max-w-sm mb-8">
              The premium restaurant operating system designed for the future of dining.
            </p>
            <div className="flex gap-4">
              <Link href="/coming-soon" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors">
                <span className="text-xs font-mono">X</span>
              </Link>
              <Link href="/coming-soon" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors">
                <span className="text-xs font-mono">IG</span>
              </Link>
              <Link href="/coming-soon" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors">
                <span className="text-xs font-mono">IN</span>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-sm font-mono text-text-primary uppercase tracking-wider mb-6">{title}</h4>
                <ul className="space-y-4">
                  {links.map((link) => {
                    let href = "/coming-soon";
                    if (link === "Privacy Policy") href = "/privacy";
                    if (link === "Terms of Service") href = "/terms";
                    
                    return (
                      <li key={link}>
                        <Link href={href} className="text-text-secondary hover:text-text-primary transition-colors">
                          {link}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
          <p className="text-text-secondary text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} OrbitDine. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <form className="flex border border-border rounded-full overflow-hidden focus-within:border-accent transition-colors">
              <input
                type="email"
                placeholder="Subscribe to newsletter"
                className="bg-transparent px-4 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none w-48"
              />
              <button type="submit" className="bg-text-primary text-base px-4 py-2 text-sm font-medium hover:bg-text-primary/90 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </footer>
  );
}
