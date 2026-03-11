import { 
  Users, Trophy, Swords, LayoutGrid, Medal, 
  Crown, Monitor, Settings, RotateCcw
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "DASHBOARD", url: "/", icon: LayoutGrid },
  { title: "PLAYERS", url: "/players", icon: Users },
  { title: "TOURNAMENT", url: "/tournament", icon: Settings },
  { title: "ROUNDS", url: "/rounds", icon: RotateCcw },
  { title: "LEADERBOARD", url: "/leaderboard", icon: Medal },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const openProjector = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open('/projector', '_blank', 'noopener,noreferrer');
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <div className={`p-4 ${collapsed ? 'px-2' : ''}`}>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary shrink-0" />
            {!collapsed && (
              <h1 className="text-xl font-display tracking-[0.15em] text-gold-gradient">
                THE BLITZ
              </h1>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="font-display tracking-widest text-muted-foreground text-xs">
            COMMAND CENTER
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-secondary/50 text-muted-foreground font-body font-semibold tracking-wider text-sm"
                      activeClassName="bg-primary/10 text-primary font-bold border-l-2 border-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Projector - opens in new tab */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a
                    href="/projector"
                    onClick={openProjector}
                    className="flex items-center hover:bg-secondary/50 text-muted-foreground font-body font-semibold tracking-wider text-sm cursor-pointer"
                  >
                    <Monitor className="mr-2 h-4 w-4 shrink-0" />
                    {!collapsed && <span>PROJECTOR ↗</span>}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
