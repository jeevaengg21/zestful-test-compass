
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
  
  const { data: initialTestCases = [], isLoading: testCasesLoading } = useQuery<TestCase[]>({
    queryKey: ['/api/test-cases'],
    queryFn: () => apiRequest('/api/test-cases')
  });

  // Local state to manage test cases with immediate updates
  const [testCases, setTestCases] = useState<TestCase[]>([]);

  // Update local state when data is loaded
  useEffect(() => {
    if (initialTestCases.length > 0) {
      setTestCases(initialTestCases);
    }
  }, [initialTestCases.length]);

  // Use Redux store for products and modules instead of individual API calls
  const products = useAppSelector(selectAllProducts);
  const productsLoading = useAppSelector(state => state.products.loading);

  const createTestCaseMutation = useMutation({
    mutationFn: (testCaseData: any) => apiRequest('/api/test-cases', {
      method: 'POST',
      body: JSON.stringify(testCaseData)
    }),
    onSuccess: (newTestCase) => {
      console.log("Create success, new test case:", newTestCase);
      
      // Update local state immediately
      setTestCases(prev => [...prev, newTestCase]);
      
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
    onSuccess: (updatedTestCase) => {
      console.log("Update success, updated test case:", updatedTestCase);
      
      // Update local state immediately
      setTestCases(prev => prev.map(testCase => 
        testCase.id === updatedTestCase.id ? updatedTestCase : testCase
      ));
      
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
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
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
      case "Medium": return "bg-blue-100 text-blue-800";
      case "Low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleCreateTestCase = () => {
    if (formData.title && formData.productId && formData.moduleId) {
      console.log("Creating test case:", formData);
      createTestCaseMutation.mutate({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: "Not Run",
        steps: formData.steps ? formData.steps.split('\n').filter(s => s.trim()) : [],
        expectedResult: formData.expectedResult,
        assignee: "Unassigned", // Default value for backward compatibility
        productId: formData.productId,
        moduleId: formData.moduleId,
        estimatedTime: formData.estimatedTime
      });
    }
  };

  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setFormData({
      title: testCase.title,
      description: testCase.description || "",
      priority: testCase.priority as "High" | "Medium" | "Low" | "Critical",
      productId: testCase.productId,
      moduleId: testCase.moduleId,
      steps: (testCase.steps || []).join('\n'),
      expectedResult: testCase.expectedResult || "",
      estimatedTime: testCase.estimatedTime || 5
    });
  };

  const handleUpdateTestCase = () => {
    if (editingTestCase && formData.title && formData.productId && formData.moduleId) {
      console.log("Updating test case:", formData);
      updateTestCaseMutation.mutate({
        id: editingTestCase.id,
        updates: {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          steps: formData.steps ? formData.steps.split('\n').filter(s => s.trim()) : [],
          expectedResult: formData.expectedResult,
          productId: formData.productId,
          moduleId: formData.moduleId,
          estimatedTime: formData.estimatedTime
        }
      });
    }
  };

  const filteredTestCases = testCases.filter(testCase => 
    testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (testCase.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredTestCases.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTestCases = filteredTestCases.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Create New Test Case</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Test Case Details</TabsTrigger>
                  <TabsTrigger value="testdata" disabled={!formData.title}>
                    <Database className="h-4 w-4 mr-2" />
                    Test Data
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter test case title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter test case description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="product">Product</Label>
                      <Select value={formData.productId} onValueChange={(value) => handleInputChange("productId", value)}>
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
                    <div className="grid gap-2">
                      <Label htmlFor="module">Module</Label>
                      <Select value={formData.moduleId} onValueChange={(value) => handleInputChange("moduleId", value)}>
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
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="steps">Test Steps (one per line)</Label>
                    <Textarea
                      id="steps"
                      value={formData.steps}
                      onChange={(e) => handleInputChange("steps", e.target.value)}
                      placeholder="Enter test steps, one per line"
                      rows={4}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="expectedResult">Expected Result</Label>
                    <Textarea
                      id="expectedResult"
                      value={formData.expectedResult}
                      onChange={(e) => handleInputChange("expectedResult", e.target.value)}
                      placeholder="Enter expected result"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      value={formData.estimatedTime}
                      onChange={(e) => handleInputChange("estimatedTime", parseInt(e.target.value) || 5)}
                      placeholder="Enter estimated time in minutes"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="testdata" className="py-4">
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Test data mapping will be available after creating the test case.</p>
                    <p className="text-sm">You can map test data sets to this test case after saving it.</p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTestCase}>
                  Create Test Case
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Test Case Dialog */}
      <Dialog open={!!editingTestCase} onOpenChange={(open) => {
        if (!open && !updateTestCaseMutation.isPending) {
          setEditingTestCase(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Edit Test Case</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Test Case Details</TabsTrigger>
              <TabsTrigger value="testdata">
                <Database className="h-4 w-4 mr-2" />
                Test Data
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="editTitle">Title</Label>
                <Input
                  id="editTitle"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter test case title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter test case description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editProduct">Product</Label>
                  <Select value={formData.productId} onValueChange={(value) => handleInputChange("productId", value)}>
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
                <div className="grid gap-2">
                  <Label htmlFor="editModule">Module</Label>
                  <Select value={formData.moduleId} onValueChange={(value) => handleInputChange("moduleId", value)}>
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
              <div className="grid gap-2">
                <Label htmlFor="editPriority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editSteps">Test Steps (one per line)</Label>
                <Textarea
                  id="editSteps"
                  value={formData.steps}
                  onChange={(e) => handleInputChange("steps", e.target.value)}
                  placeholder="Enter test steps, one per line"
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editExpectedResult">Expected Result</Label>
                <Textarea
                  id="editExpectedResult"
                  value={formData.expectedResult}
                  onChange={(e) => handleInputChange("expectedResult", e.target.value)}
                  placeholder="Enter expected result"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editEstimatedTime">Estimated Time (minutes)</Label>
                <Input
                  id="editEstimatedTime"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => handleInputChange("estimatedTime", parseInt(e.target.value) || 5)}
                  placeholder="Enter estimated time in minutes"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="testdata" className="py-4">
              {editingTestCase && (
                <TestDataMapper 
                  testCaseId={editingTestCase.id} 
                  testCaseTitle={editingTestCase.title}
                />
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setEditingTestCase(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTestCase}
              disabled={updateTestCaseMutation.isPending}
            >
              {updateTestCaseMutation.isPending ? "Updating..." : "Update Test Case"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Search and filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search test cases..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test cases table */}
        <Card>
          <CardHeader>
            <CardTitle>Test Cases ({totalItems})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTestCases.map((testCase) => (
                  <TableRow key={testCase.id}>
                    <TableCell className="font-medium text-blue-600">
                      {testCase.id}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {testCase.title}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(testCase.priority)}>
                        {testCase.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(testCase.status)}>
                        {testCase.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {testCase.lastRun ? new Date(testCase.lastRun).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEditTestCase(testCase)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {currentTestCases.length === 0 && (
              <div className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test Cases Found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search criteria." : "Create your first test case to get started."}
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} test cases
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                        if (page > totalPages) return null;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
