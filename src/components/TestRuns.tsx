import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Calendar,
  Settings,
  Bug
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAllTestRuns, selectAllUsers, selectAllTestPlans } from "@/store/selectors";
import { startTestRun, pauseTestRun, completeTestRun } from "@/store/slices/testRunSlice";
import { TestRunForm } from "./TestRunForm";
import { TestRunExecution } from "./TestRunExecution";

export const TestRuns = () => {
  const dispatch = useAppDispatch();
  const testRuns = useAppSelector(selectAllTestRuns);
  const users = useAppSelector(selectAllUsers);
  const testPlans = useAppSelector(selectAllTestPlans);
  
  const [activeTab, setActiveTab] = useState("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isExecutionDialogOpen, setIsExecutionDialogOpen] = useState(false);
  const [selectedTestRun, setSelectedTestRun] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "On Hold": return "bg-yellow-100 text-yellow-800";
      case "Not Started": return "bg-gray-100 text-gray-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "In Progress": return <Play className="h-4 w-4 text-blue-600" />;
      case "On Hold": return <Pause className="h-4 w-4 text-yellow-600" />;
      case "Not Started": return <Clock className="h-4 w-4 text-gray-600" />;
      case "Cancelled": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : "Unknown User";
  };

  const getTestPlanName = (testPlanId: string) => {
    const plan = testPlans.find(p => p.id === testPlanId);
    return plan?.name || "Unknown Plan";
  };

  const filteredRuns = testRuns.filter(run => {
    switch (activeTab) {
      case "active":
        return run.status === "In Progress" || run.status === "On Hold";
      case "completed":
        return run.status === "Completed";
      case "planned":
        return run.status === "Not Started";
      default:
        return true;
    }
  });

  const handleStartRun = (runId: string) => {
    dispatch(startTestRun(runId));
  };

  const handlePauseRun = (runId: string) => {
    dispatch(pauseTestRun(runId));
  };

  const handleCompleteRun = (runId: string) => {
    dispatch(completeTestRun(runId));
  };

  const handleExecuteRun = (runId: string) => {
    setSelectedTestRun(runId);
    setIsExecutionDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Test Runs</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Test Run
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Test Run</DialogTitle>
              <DialogDescription>
                Create a new test run from an existing test plan.
              </DialogDescription>
            </DialogHeader>
            <TestRunForm onClose={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Runs</p>
                <p className="text-3xl font-bold text-blue-600">
                  {testRuns.filter(r => r.status === "In Progress").length}
                </p>
              </div>
              <Play className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {testRuns.filter(r => r.status === "Completed").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">On Hold</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {testRuns.filter(r => r.status === "On Hold").length}
                </p>
              </div>
              <Pause className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planned</p>
                <p className="text-3xl font-bold text-gray-600">
                  {testRuns.filter(r => r.status === "Not Started").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "all", label: "All Runs", count: testRuns.length },
            { id: "active", label: "Active", count: testRuns.filter(r => r.status === "In Progress" || r.status === "On Hold").length },
            { id: "completed", label: "Completed", count: testRuns.filter(r => r.status === "Completed").length },
            { id: "planned", label: "Planned", count: testRuns.filter(r => r.status === "Not Started").length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Test Runs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRuns.map((run) => (
          <Card key={run.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{run.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{getTestPlanName(run.testPlanId)}</p>
                  <p className="text-xs text-gray-500 mt-1">{run.description}</p>
                </div>
                <Badge className={getStatusColor(run.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(run.status)}
                    <span>{run.status}</span>
                  </div>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{run.progress}% ({run.executedTestCases}/{run.totalTestCases})</span>
                </div>
                <Progress value={run.progress} className="h-2" />
              </div>

              {/* Test Results */}
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">{run.passedTestCases}</div>
                  <div className="text-xs text-gray-500">Passed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">{run.failedTestCases}</div>
                  <div className="text-xs text-gray-500">Failed</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-yellow-600">{run.blockedTestCases}</div>
                  <div className="text-xs text-gray-500">Blocked</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-600">{run.skippedTestCases}</div>
                  <div className="text-xs text-gray-500">Skipped</div>
                </div>
              </div>

              {/* Meta Information */}
              <div className="flex justify-between items-center text-sm text-gray-500 pt-3 border-t">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{getUserName(run.assignedTo)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {run.endDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleExecuteRun(run.id)}
                >
                  Execute Tests
                </Button>
                {run.status === "In Progress" ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePauseRun(run.id)}
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCompleteRun(run.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </>
                ) : run.status === "Not Started" ? (
                  <Button 
                    size="sm"
                    onClick={() => handleStartRun(run.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : run.status === "On Hold" ? (
                  <Button 
                    size="sm"
                    onClick={() => handleStartRun(run.id)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Run Execution Dialog */}
      <Dialog open={isExecutionDialogOpen} onOpenChange={setIsExecutionDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedTestRun && (
            <TestRunExecution 
              testRunId={selectedTestRun}
              onClose={() => setIsExecutionDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
