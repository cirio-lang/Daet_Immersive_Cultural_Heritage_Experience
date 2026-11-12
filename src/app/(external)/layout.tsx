import type { ReactNode } from "react";

import { RealtimeRefresh } from "./_components/realtime-refresh";

export default function ExternalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark min-h-screen bg-[#080d17] text-[#faf7f2]" style={{ colorScheme: "dark" }}>
      <RealtimeRefresh />
      {children}
    </div>
  );
}
