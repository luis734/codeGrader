import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, LogOut, Menu, Shield, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useApp } from "@/lib/app-context";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const studentNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ];

  const adminNavItems = [
    { href: "/admin", icon: Shield, label: "Master Panel" },
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ];

  const navItems = user.role === "admin" ? adminNavItems : studentNavItems;
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Terminal className="h-6 w-6" />
            <span>CodeCheck</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  data-testid={`nav-${item.href.slice(1)}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-muted/50 mb-2" data-testid="user-profile">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate" data-testid="text-username">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate" data-testid="text-useremail">{user.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center justify-between h-14 px-3 border-b bg-background">
          <div className="flex items-center gap-3 min-w-0">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent side="top" className="p-0">
                <nav className="p-4 pt-12 space-y-2">
                  {navItems.map((item) => {
                    const isActive = location.startsWith(item.href);
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          data-testid={`nav-${item.href.slice(1)}`}
                          onClick={() => setMobileNavOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 font-bold text-xl text-primary min-w-0">
              <Terminal className="h-6 w-6" />
              <span className="truncate">CodeCheck</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
              >
                <span className="text-xs font-bold">{initials}</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => logout()}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
