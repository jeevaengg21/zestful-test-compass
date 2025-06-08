import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { TestCase, Product, Module } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/store/hooks";
import { selectAllProducts } from "@/store/selectors";
import { selectModulesByProduct } from "@/store/selectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestDataMapper } from "./TestDataMapper";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Database
} from "lucide-react";

export const TestCases = () => {
  const { toast } = useToast();
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: currentPage.toString(),
    limit: pageSize.toString(),
    ...(searchTerm && { search: searchTerm }),
    ...(statusFilter && { status: statusFilter }),
    ...(priorityFilter && { priority: priorityFilter }),
    ...(assigneeFilter && { assignee: assigneeFilter }),
    ...(productFilter && { productId: productFilter }),
    ...(moduleFilter && { moduleId: moduleFilter })
  });

  const { data: testCaseData, isLoading: testCasesLoading } = useQuery<{
    testCases: TestCase[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>({
    queryKey: ['/api/test-cases', queryParams.toString()],
    queryFn: () => apiRequest(`/api/test-cases?${queryParams.toString()}`)
  });

  // Extract test cases from paginated response
  const testCases = testCaseData?.testCases || [];
  const totalPages = testCaseData?.totalPages || 1;
  const totalCount = testCaseData?.total || 0;

  // Use Redux store for products and modules instead of individual API calls
  const products = useAppSelector(selectAllProducts);
  const productsLoading = useAppSelector(state => state.products.loading);

  // Form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
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

  // Get modules based on selected product using Redux selector
  const modules = useAppSelector((state) => selectModulesByProduct(state, formData.productId));

  const createTestCaseMutation = useMutation({
    mutationFn: (testCaseData: any) => apiRequest('/api/test-cases', {
      method: 'POST',
      body: JSON.stringify(testCaseData)
    }),
    onSuccess: () => {
      // Invalidate cache to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/test-cases'] });
      
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Test case created",
        description: "The test case has been successfully created.",
      });
    }
  });

  const updateTestCaseMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      apiRequest(`/api/test-cases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
    onSuccess: () => {
      // Invalidate cache to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/test-cases'] });
      
      // Close dialog and reset form
      setTimeout(() => {
        setEditingTestCase(null);
        resetForm();
      }, 200);
      
      toast({
        title: "Test case updated",
        description: "The test case has been successfully updated.",
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Passed": return "bg-green-100 text-green-800";
      case "Failed": return "bg-red-100 text-red-800";
      case "Blocked": return "bg-yellow-100 text-yellow-800";
      case "Not Run": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
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
    setFormData({
      title: testCase.title,
      description: testCase.description,
      priority: testCase.priority as "High" | "Medium" | "Low" | "Critical",
      productId: testCase.productId,
      moduleId: testCase.moduleId,
      steps: Array.isArray(testCase.steps) ? testCase.steps.join('\n') : (testCase.steps || ''),
      expectedResult: testCase.expectedResult,
      estimatedTime: testCase.estimatedTime || 5
    });
  };

  const handleSubmit = () => {
    if (editingTestCase) {
      updateTestCaseMutation.mutate({
        id: editingTestCase.id,
        updates: {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          steps: formData.steps.split('\n').filter(step => step.trim()),
          expectedResult: formData.expectedResult,
          productId: formData.productId,
          moduleId: formData.moduleId,
          estimatedTime: formData.estimatedTime
        }
      });
    } else {
      createTestCaseMutation.mutate({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        steps: formData.steps.split('\n').filter(step => step.trim()),
        expectedResult: formData.expectedResult,
        productId: formData.productId,
        moduleId: formData.moduleId,
        estimatedTime: formData.estimatedTime
      });
    }
  };

  // Reset to first page when search or filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    const filterValue = value === "all" ? "" : value;
    switch (filterType) {
      case 'status':
        setStatusFilter(filterValue);
        break;
      case 'priority':
        setPriorityFilter(filterValue);
        break;
      case 'assignee':
        setAssigneeFilter(filterValue);
        break;
      case 'product':
        setProductFilter(filterValue);
        setModuleFilter(""); // Reset module when product changes
        break;
      case 'module':
        setModuleFilter(filterValue);
        break;
    }
    setCurrentPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Test Cases</h1>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Test Case
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Test Case</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
                        {modules.map((module) => (
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
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search test cases..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Not Run">Not Run</SelectItem>
            <SelectItem value="Passed">Passed</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(value) => handleFilterChange('priority', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={productFilter} onValueChange={(value) => handleFilterChange('product', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        Showing {testCases.length} of {totalCount} test cases
      </div>

      {/* Test Cases Table */}
      <Card>
        <CardContent className="p-0">
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
              {testCasesLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading test cases...
                  </TableCell>
                </TableRow>
              ) : testCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No test cases found
                  </TableCell>
                </TableRow>
              ) : (
                testCases.map((testCase) => {
                  const product = products.find(p => p.id === testCase.productId);
                  const allModules = useAppSelector((state) => selectModulesByProduct(state, testCase.productId));
                  const module = allModules.find(m => m.id === testCase.moduleId);
                  
                  return (
                    <TableRow key={testCase.id}>
                      <TableCell className="font-mono text-sm">{testCase.id}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={testCase.title}>
                          {testCase.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(testCase.priority)}>
                          {testCase.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(testCase.status || "Not Run")}>
                          {testCase.status || "Not Run"}
                        </Badge>
                      </TableCell>
                      <TableCell>{product?.name || "N/A"}</TableCell>
                      <TableCell>{module?.name || "N/A"}</TableCell>
                      <TableCell>{testCase.assignee || "Unassigned"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditTestCase(testCase)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Edit Test Case</DialogTitle>
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
                                          {modules.map((module) => (
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
                                    <Button variant="outline" onClick={() => setEditingTestCase(null)}>
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
                                  {editingTestCase && (
                                    <TestDataMapper 
                                      testCaseId={editingTestCase.id}
                                      testCaseTitle={editingTestCase.title}
                                    />
                                  )}
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
              
              {/* Show page numbers */}
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