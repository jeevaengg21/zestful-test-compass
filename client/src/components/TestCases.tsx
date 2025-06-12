import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Plus, Edit, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";
import { TestDataMapper } from "./TestDataMapper";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TestCase, InsertTestCase } from "@shared/schema";

export const TestCases = () => {
  const { toast } = useToast();
  
  // Get products and modules from Redux store
  const products = useAppSelector(state => state.products.products);
  const allModules = useAppSelector(state => state.modules.modules);

  // Filter and pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  // Local test cases state for immediate UI updates
  const [localTestCases, setLocalTestCases] = useState<TestCase[]>([]);

  // Form and dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as "High" | "Medium" | "Low" | "Critical",
    productId: "",
    moduleId: "",
    steps: "",
    expectedResult: "",
    estimatedTime: 5
  });

  // Fetch test cases with pagination and filters
  const { data: testCasesData, isLoading } = useQuery({
    queryKey: ['/api/test-cases', { 
      page: currentPage, 
      search, 
      productId: productFilter, 
      moduleId: moduleFilter,
      priority: priorityFilter,
      status: statusFilter
    }],
    queryFn: () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50'
      });
      if (search) params.append('search', search);
      if (productFilter && productFilter !== 'all') params.append('productId', productFilter);
      if (moduleFilter && moduleFilter !== 'all') params.append('moduleId', moduleFilter);
      if (priorityFilter && priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      
      return fetch(`/api/test-cases?${params}`).then(res => res.json());
    }
  });

  // Sync local state when API data changes
  useEffect(() => {
    if (testCasesData?.testCases) {
      setLocalTestCases(testCasesData.testCases);
    }
  }, [testCasesData]);

  const testCases = localTestCases;
  const totalPages = testCasesData?.totalPages || 1;

  // Create test case mutation
  const createTestCaseMutation = useMutation({
    mutationFn: (testCase: any) => 
      apiRequest('/api/test-cases', {
        method: 'POST',
        body: JSON.stringify(testCase)
      }),
    onSuccess: (newTestCase) => {
      // Add new test case to local state for immediate UI update
      setLocalTestCases(prevTestCases => [newTestCase, ...prevTestCases]);
      
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Test case created",
        description: "The test case has been successfully created.",
      });
    }
  });

  // Update test case mutation
  const updateTestCaseMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      apiRequest(`/api/test-cases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
    onSuccess: (updatedTestCase) => {
      // Update local state immediately for instant UI update
      setLocalTestCases(prevTestCases => 
        prevTestCases.map(tc => 
          tc.id === updatedTestCase.id ? updatedTestCase : tc
        )
      );
      
      setEditingTestCase(null);
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: "Test case updated",
        description: "The test case has been successfully updated.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Passed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Failed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Blocked": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Not Run": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default: return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "High": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      productId: "",
      moduleId: "",
      steps: "",
      expectedResult: "",
      estimatedTime: 5
    });
  };

  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setIsEditDialogOpen(true);
    setFormData({
      title: testCase.title,
      description: testCase.description,
      priority: testCase.priority as "High" | "Medium" | "Low" | "Critical",
      productId: testCase.productId,
      moduleId: testCase.moduleId,
      steps: Array.isArray(testCase.steps) 
        ? testCase.steps.map((step: any) => typeof step === 'object' ? step.action || step.step || JSON.stringify(step) : step).join('\n') 
        : (testCase.steps || ''),
      expectedResult: testCase.expectedResult,
      estimatedTime: testCase.estimatedTime || 5
    });
  };

  const handleSubmit = () => {
    if (editingTestCase) {
      updateTestCaseMutation.mutate({
        id: editingTestCase.id,
        updates: {
          ...formData,
          steps: formData.steps.split('\n').filter(step => step.trim()),
        }
      });
    } else {
      createTestCaseMutation.mutate({
        ...formData,
        steps: formData.steps.split('\n').filter(step => step.trim()),
      });
    }
  };

  // Filter modules based on selected product
  const filteredModules = allModules.filter(module => 
    !formData.productId || module.productId === formData.productId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Test Cases</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Test Case
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Test Case</DialogTitle>
              <DialogDescription>Add a new test case to your test suite</DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Test Case Details</TabsTrigger>
                <TabsTrigger value="testdata">Test Data</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter test case title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter test case description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 5 }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="product">Product</Label>
                    <Select value={formData.productId} onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value, moduleId: "" }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="module">Module</Label>
                    <Select value={formData.moduleId} onValueChange={(value) => setFormData(prev => ({ ...prev, moduleId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredModules.map((module) => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="steps">Test Steps</Label>
                  <Textarea
                    id="steps"
                    value={formData.steps}
                    onChange={(e) => setFormData(prev => ({ ...prev, steps: e.target.value }))}
                    placeholder="Enter test steps (one per line)"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedResult">Expected Result</Label>
                  <Textarea
                    id="expectedResult"
                    value={formData.expectedResult}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedResult: e.target.value }))}
                    placeholder="Enter expected result"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={createTestCaseMutation.isPending}
                  >
                    {createTestCaseMutation.isPending ? "Creating..." : "Create Test Case"}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="testdata">
                <div className="text-center py-8 text-gray-500">
                  Test data mapping will be available after creating the test case.
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search test cases..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="product-filter">Product</Label>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="module-filter">Module</Label>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All modules</SelectItem>
                  {allModules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Deprecated">Deprecated</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Cases Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading test cases...
                  </TableCell>
                </TableRow>
              ) : testCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No test cases found. Create your first test case to get started.
                  </TableCell>
                </TableRow>
              ) : (
                testCases.map((testCase: TestCase) => {
                  const product = products.find(p => p.id === testCase.productId);
                  const module = allModules.find(m => m.id === testCase.moduleId);
                  
                  return (
                    <TableRow key={testCase.id}>
                      <TableCell className="font-mono text-sm">{testCase.id}</TableCell>
                      <TableCell className="font-medium">{testCase.title}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(testCase.priority)}>
                          {testCase.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(testCase.status || "Active")}>
                          {testCase.status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{product?.name || "N/A"}</TableCell>
                      <TableCell>{module?.name || "N/A"}</TableCell>
                      <TableCell>{testCase.assignee || "Unassigned"}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditTestCase(testCase)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Test Case</DialogTitle>
            <DialogDescription>Update the test case details and settings</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Test Case Details</TabsTrigger>
              <TabsTrigger value="testdata">Test Data</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-estimatedTime">Estimated Time (minutes)</Label>
                  <Input
                    id="edit-estimatedTime"
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) || 5 }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-product">Product</Label>
                  <Select value={formData.productId} onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value, moduleId: "" }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-module">Module</Label>
                  <Select value={formData.moduleId} onValueChange={(value) => setFormData(prev => ({ ...prev, moduleId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredModules.map((module) => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-steps">Test Steps</Label>
                <Textarea
                  id="edit-steps"
                  value={formData.steps}
                  onChange={(e) => setFormData(prev => ({ ...prev, steps: e.target.value }))}
                  placeholder="Enter test steps (one per line)"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-expectedResult">Expected Result</Label>
                <Textarea
                  id="edit-expectedResult"
                  value={formData.expectedResult}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedResult: e.target.value }))}
                  placeholder="Enter expected result"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={updateTestCaseMutation.isPending}
                >
                  {updateTestCaseMutation.isPending ? "Updating..." : "Update Test Case"}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="testdata">
              <TestDataMapper 
                testCaseId={editingTestCase?.id || ""}
                testCaseTitle={editingTestCase?.title || ""}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum <= totalPages) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};