import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, User, Settings, LogOut, ChevronDown, ChevronRight, Sparkles, Menu } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOrg } from "@/hooks/useOrg";
import { useUnreadCount } from "@/hooks/useNotifications";
import { extractRelativePath } from "@/config/roleAccess";

const breadcrumbLabels: Record<string, string> = {
  "dashboard": "Dashboard",
  "patients": "Patients",
  "appointments": "Appointments",
  "dental-charts": "Dental Charts",
  "treatments": "Treatments",
  "prescriptions": "Prescriptions",
  "billing": "Billing",
  "reports": "Reports",
  "lab-work": "Lab Work",
  "staff": "Staff",
  "inventory": "Inventory",
  "notifications": "Notifications",
  "tutorials": "Tutorials",
  "settings": "Settings",
  "profile": "My Profile",
  "lab": "Lab Dashboard",
  "lab/cases": "Lab Cases",
  "lab/technicians": "Technicians",
  "lab/billing": "Lab Billing",
  "lab/settings": "Lab Settings",
  "messages": "Messages",
  "reviews": "Reviews",
  "expenses": "Expenses",
  "audit-log": "Audit Log",
  "consent-forms": "Consent Forms",
  "documents": "Documents",
  "revenue-allocation": "Revenue Allocation",
};

interface DashboardHeaderProps {
  onToggleAI?: () => void;
  aiOpen?: boolean;
}

export function DashboardHeader({ onToggleAI, aiOpen }: DashboardHeaderProps = {}) {
  const { profile, user, signOut } = useAuth();
  const { basePath, currentOrg } = useOrg();
  const { toggleSidebar } = useSidebar();
  const { data: unreadCount = 0 } = useUnreadCount();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Staff";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const relativePath = extractRelativePath(location.pathname);
  const currentPage = breadcrumbLabels[relativePath] || "Dashboard";
  const isHome = currentPage === "Dashboard";

  return (
    <header className="relative sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">

      {/* Desktop: icon-only */}
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hidden md:flex" />

      {/* Mobile: prominent button with "Menu" label */}
      <button
        className="flex md:hidden items-center gap-1.5 -ml-1 px-2.5 py-1.5 rounded-lg bg-muted/70 hover:bg-muted border border-border/50 text-foreground transition-colors"
        onClick={toggleSidebar}
      >
        <Menu className="h-4 w-4" />
        <span className="text-xs font-semibold">Menu</span>
      </button>

      {/* Breadcrumb */}
      <nav className="hidden md:flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-muted-foreground/70 font-medium truncate max-w-[120px]">
          {currentOrg?.org_name || "Dashboard"}
        </span>
        {!isHome && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            <span className="font-semibold text-foreground truncate">{currentPage}</span>
          </>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        {/* AI Toggle - hidden on mobile since mobile has bottom bar */}
        {onToggleAI && (
          <Button
            variant={aiOpen ? "default" : "ghost"}
            size="icon"
            className={aiOpen ? "hidden h-8 w-8 md:flex" : "hidden h-8 w-8 text-muted-foreground md:flex"}
            onClick={onToggleAI}
            title="Open assistant"
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        )}

        {/* Notification Bell */}
        <Button variant="ghost" size="icon" className="relative h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50" asChild>
          <Link to={`${basePath}/notifications`}>
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-semibold text-destructive-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 px-2 h-8 hover:bg-muted/50 rounded-lg"
            >
              <Avatar className="h-6 w-6 ring-2 ring-border">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium text-foreground">
                {displayName.split(" ")[0]}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 shadow-lg border-border/60">
            <DropdownMenuItem onClick={() => navigate(`${basePath}/profile`)} className="cursor-pointer">
              <User className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`${basePath}/settings`)} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
