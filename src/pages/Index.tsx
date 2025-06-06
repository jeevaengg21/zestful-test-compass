
import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TestCases } from "@/components/TestCases";
import { TestRuns } from "@/components/TestRuns";
import { Products } from "@/components/Products";
import { Reports } from "@/components/Reports";
import { Users } from "@/components/Users";
import { TestSuiteManager } from "@/components/TestSuiteManager";
import { TestPlanManager } from "@/components/TestPlanManager";
import { TestRunExecution } from "@/components/TestRunExecution";
import { TestDataManager } from "@/components/TestDataManager";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useAppSelector } from "@/store/hooks";
import { selectTestRunById } from "@/store/selectors";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [executingTestRunId, setExecutingTestRunId] = useState<string | null>(null);

  const executingTestRun = useAppSelector(state => 
    executingTestRunId ? selectTestRunById(state, executingTestRunId) : null
  );

  const handleExecuteTestRun = (testRunId: string) => {
    setExecutingTestRunId(testRunId);
    setActiveView("test-run-execution");
  };

  const handleBackToTestRuns = () => {
    setExecutingTestRunId(null);
    setActiveView("test-runs");
  };

  const renderBreadcrumb = () => {
    if (activeView === "test-run-execution" && executingTestRun) {
      return (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                onClick={() => handleBackToTestRuns()}
                className="cursor-pointer"
              >
                Test Runs
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Execute: {executingTestRun.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
    }
    return null;
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "test-cases":
        return <TestCases />;
      case "test-suites":
        return <TestSuiteManager />;
      case "test-plans":
        return <TestPlanManager />;
      case "test-runs":
        return <TestRuns onExecuteTestRun={handleExecuteTestRun} />;
      case "test-run-execution":
        return executingTestRunId ? (
          <TestRunExecution 
            testRunId={executingTestRunId} 
            onClose={handleBackToTestRuns} 
          />
        ) : null;
      case "test-data":
        return <TestDataManager />;
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
          <AppSidebar activeView={activeView === "test-run-execution" ? "test-runs" : activeView} onViewChange={setActiveView} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1 md:hidden" />
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold md:hidden">TestManager</h1>
                {renderBreadcrumb()}
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
