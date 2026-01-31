import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex border-r border-border" />

      {/* Mobile Sidebar & Header */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center border-b bg-card/50 backdrop-blur px-4 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="-ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0 bg-sidebar text-sidebar-foreground">
              <Sidebar className="w-full h-full border-none" />
            </SheetContent>
          </Sheet>
          <div className="ml-4 font-semibold">Wheel Match Admin</div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto flex flex-col">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl animate-fade-in flex-1">
            {children}
          </div>
          <footer className="border-t border-border/40 py-6 px-6 md:px-8 mt-auto bg-card/30 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] text-muted-foreground gap-2">
              <p>&copy; {new Date().getFullYear()} Neo Wheels. All rights reserved.</p>
              <p>Admin Portal v1.0</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}