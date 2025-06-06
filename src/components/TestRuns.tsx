
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Bug,
  Edit
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAllTestRuns, selectAllUsers, selectAllTestPlans } from "@/store/selectors";
import { startTestRun, pauseTestRun, completeTestRun } from "@/store/slices/testRunSlice";
import { TestRunForm } from "./TestRunForm";
import { TestRunEditForm } from "./TestRunEditForm";
import { TestRunExecution } from "./TestRunExecution";

export const TestRuns = () => {
  const dispatch = useAppDispatch();
  const testRuns = useAppSelector(selectAllTestRuns);
  const users = useAppSelector(selectAllUsers);
  const testPlans = useAppSelector(selectAllTestPlans);
  
  const [activeTab, setActiveTab] = useState("active");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
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

  const handleEditRun = (runId: string) => {
    setSelectedTestRun(runId);
    setIsEditDialogOpen(true);
  };

  const selectedTestRunData = selectedTestRun ? testRuns.find(run => run.id === selectedTestRun) : null;

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

      {/* Test Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Test Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Test Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{run.name}</div>
                      <div className="text-sm text-gray-500">{run.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTestPlanName(run.testPlanId)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(run.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(run.status)}
                        <span>{run.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getPriorityColor(run.priority)}>
                      {run.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{getUserName(run.assignedTo)}</TableCell>
                  <TableCell>
                    <div className="w-full">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{run.progress}%</span>
                        <span>{run.executedTestCases}/{run.totalTestCases}</span>
                      </div>
                      <Progress value={run.progress} className="h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2 text-xs">
                      <span className="text-green-600">{run.passedTestCases}P</span>
                      <span className="text-red-600">{run.failedTestCases}F</span>
                      <span className="text-yellow-600">{run.blockedTestCases}B</span>
                      <span className="text-gray-600">{run.skippedTestCases}S</span>
                    </div>
                  </TableCell>
                  <TableCell>{run.endDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleExecuteRun(run.id)}
                      >
                        Execute
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditRun(run.id)}
                      >
                        <Edit className="h-4 w-4" />
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
                      ) : run.status === "Not Started" || run.status === "On Hold" ? (
                        <Button 
                          size="sm"
                          onClick={() => handleStartRun(run.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Test Run Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Test Run</DialogTitle>
            <DialogDescription>
              Modify test run details, test suites, and assignee.
            </DialogDescription>
          </DialogHeader>
          {selectedTestRunData && (
            <TestRunEditForm 
              testRun={selectedTestRunData}
              onClose={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

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
