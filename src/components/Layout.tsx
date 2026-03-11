import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Trophy } from "lucide-react";
import { useRealtimeSync } from "@/hooks/use-realtime-sync";

export function Layout({ children }: { children: React.ReactNode }) {
  useRealtimeSync();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border px-4 bg-card/50 backdrop-blur-sm">
            <SidebarTrigger className="mr-4 text-muted-foreground hover:text-primary" />
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-display tracking-[0.15em] text-lg text-gold-gradient">
                THE BLITZ
              </span>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
