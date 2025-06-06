
import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TestCases } from "@/components/TestCases";
import { TestRuns } from "@/components/TestRuns";
import { Products } from "@/components/Products";
import { Reports } from "@/components/Reports";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
            <main className="flex-1 overflow-auto">
              {renderContent()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Index;
