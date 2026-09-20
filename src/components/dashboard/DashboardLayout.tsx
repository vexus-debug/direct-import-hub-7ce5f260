import { ReactNode, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { AICopilotPanel } from "./AICopilotPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [aiOpen, setAiOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full overflow-hidden dashboard-bg">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col h-full overflow-hidden">
          <DashboardHeader onToggleAI={() => setAiOpen(!aiOpen)} aiOpen={aiOpen} />

          {isMobile ? (
            <>
              <AnimatePresence mode="wait">
                {!aiOpen ? (
                  <motion.main
                    key="dashboard"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 overflow-y-auto overscroll-contain p-4 scroll-momentum"
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={location.pathname}
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        className="mx-auto w-full max-w-[1540px]"
                      >
                        {children}
                      </motion.div>
                    </AnimatePresence>
                  </motion.main>
                ) : (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    <AICopilotPanel open={true} onClose={() => setAiOpen(false)} inline />
                  </motion.div>
                )}
              </AnimatePresence>

            </>
          ) : (
            <>
              <main className="flex-1 overflow-y-auto overscroll-contain p-4 lg:p-6 scroll-momentum">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    className="gpu-accelerated mx-auto w-full max-w-[1540px]"
                  >
                    {children}
                  </motion.div>
                </AnimatePresence>
              </main>
              <AICopilotPanel open={aiOpen} onClose={() => setAiOpen(false)} />
            </>
          )}
        </div>
      </div>
    </SidebarProvider>
  );
}
