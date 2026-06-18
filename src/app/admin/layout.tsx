import { ReactNode } from "react";

export const metadata = {
  title: "Enterprise Access | OrbitDine",
  robots: "noindex, nofollow", 
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  // Just a pass-through, no sidebar here so the Passphrase Gate looks clean.
  return <div className="dark bg-black min-h-screen text-white">{children}</div>;
}
