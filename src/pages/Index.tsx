
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { TestCases } from "@/components/TestCases";
import { TestRuns } from "@/components/TestRuns";
import { Projects } from "@/components/Projects";
import { Reports } from "@/components/Reports";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
      case "projects":
        return <Projects />;
      case "reports":
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
