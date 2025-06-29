import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, Users, FileText, AlertTriangle, CheckCircle, Clock, Pause } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TestPlan, createTestPlanAsync, updateTestPlan, deleteTestPlan, fetchTestPlans } from "@/store/slices/testPlanSlice";
import { selectAllProducts, selectAllTestSuites } from "@/store/selectors";
import { TestPlanForm } from "./TestPlanForm";
import { TestPlanDetails } from "./TestPlanDetails";
import { TestSuiteManagementDialog } from "./TestSuiteManagementDialog";
import { TeamManagementDialog } from "./TeamManagementDialog";
import { toast } from "@/components/ui/sonner";

export function TestPlanManager() {
  const dispatch = useAppDispatch();
  const testPlans = useAppSelector(state => state.testPlans.testPlans);
  const loading = useAppSelector(state => state.testPlans.loading);
  const error = useAppSelector(state => state.testPlans.error);
  const products = useAppSelector(selectAllProducts);
  const testSuites = useAppSelector(selectAllTestSuites);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTestPlan, setSelectedTestPlan] = useState<TestPlan | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isTestSuiteDialogOpen, setIsTestSuiteDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);

  // Fetch test plans on component mount
  useEffect(() => {
    dispatch(fetchTestPlans());
  }, [dispatch]);

  // Helper function to format dates for display
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "Not set";
    
    // If it's already a string, return it
    if (typeof dateValue === 'string') {
      // If it's an ISO string, format it
      if (dateValue.includes('T')) {
        const date = new Date(dateValue);
        return date.toLocaleDateString();
      }
      return dateValue;
    }
    
    // If it's a Date object, format it
    if (dateValue instanceof Date) {
      return dateValue.toLocaleDateString();
    }
    
    // Fallback
    return "Invalid date";
  };

  // Add debugging logs for testPlans state
  useEffect(() => {
    console.log("Current test plans state:", testPlans);
  }, [testPlans]);

  const filteredTestPlans = testPlans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || plan.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: TestPlan['status']) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'In Progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'On Hold': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'Cancelled': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: TestPlan['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TestPlan['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || "Unknown Product";
  };

  const handleCreateTestPlan = async (testPlanData: Omit<TestPlan, 'id' | 'createdDate' | 'lastModified' | 'progress'>) => {
    try {
      console.log("Creating test plan with data:", testPlanData);
      
      // Log the date types to debug date issues
      console.log("Start date type:", testPlanData.startDate ? typeof testPlanData.startDate : "undefined", 
                  "Value:", testPlanData.startDate);
      console.log("End date type:", testPlanData.endDate ? typeof testPlanData.endDate : "undefined", 
                  "Value:", testPlanData.endDate);
      
      const result = await dispatch(createTestPlanAsync(testPlanData)).unwrap();
      console.log("Test plan creation successful, received:", result);
      
      // toast({
      //   title: "Success",
      //   description: "Test plan created successfully",
      // });
      setIsCreateDialogOpen(false);
    } catch (err) {
      console.error("Failed to create test plan:", err);
      toast({
        title: "Error",
        description: "Failed to create test plan",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (testPlan: TestPlan) => {
    setSelectedTestPlan(testPlan);
    setIsDetailsDialogOpen(true);
  };

  const handleManageTestSuites = (testPlan: TestPlan) => {
    setSelectedTestPlan(testPlan);
    setIsTestSuiteDialogOpen(true);
  };

  const handleManageTeam = (testPlan: TestPlan) => {
    setSelectedTestPlan(testPlan);
    setIsTeamDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Plan Management</h1>
          <p className="text-muted-foreground">
            Create and manage comprehensive test plans with schedules and team assignments
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Test Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Test Plan</DialogTitle>
              <DialogDescription>
                Create a comprehensive test plan with objectives, schedules, and team assignments.
              </DialogDescription>
            </DialogHeader>
            <TestPlanForm onSubmit={handleCreateTestPlan} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testPlans.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testPlans.filter(p => p.status === 'Active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testPlans.filter(p => p.status === 'In Progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {testPlans.filter(p => p.status === 'Completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Test Plans</CardTitle>
          <CardDescription>Manage and track all test plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search test plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTestPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {plan.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getProductName(plan.productId)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getStatusColor(plan.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(plan.status)}
                        {plan.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getPriorityColor(plan.priority)}>
                      {plan.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${plan.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{plan.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(plan.startDate)}</div>
                      <div className="text-muted-foreground">to {formatDate(plan.endDate)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(plan)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleManageTestSuites(plan)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Test Suites
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleManageTeam(plan)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Team
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Test Plan Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedTestPlan && (
            <TestPlanDetails 
              testPlan={selectedTestPlan} 
              onClose={() => setIsDetailsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Test Suite Management Dialog */}
      {selectedTestPlan && (
        <TestSuiteManagementDialog
          testPlan={selectedTestPlan}
          open={isTestSuiteDialogOpen}
          onOpenChange={setIsTestSuiteDialogOpen}
        />
      )}

      {/* Team Management Dialog */}
      {selectedTestPlan && (
        <TeamManagementDialog
          testPlan={selectedTestPlan}
          open={isTeamDialogOpen}
          onOpenChange={setIsTeamDialogOpen}
        />
      )}
    </div>
  );
}
