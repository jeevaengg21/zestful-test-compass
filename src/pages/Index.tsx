
import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TestCases } from "@/components/TestCases";
import { TestRuns } from "@/components/TestRuns";
import { Products } from "@/components/Products";
import { Reports } from "@/components/Reports";
import { Users } from "@/components/Users";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "test-cases":
        return <TestCases />;
      case "test-runs":
        return <TestRuns />;
      case "products":
        return <Products />;
      case "reports":
        return <Reports />;
      case "users":
        return <Users />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar activeView={activeView} onViewChange={setActiveView} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 md:hidden">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold">TestManager</h1>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-4">
              {renderContent()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Index;
