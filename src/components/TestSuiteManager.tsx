
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTestSuite, updateTestSuite, TestSuite, addTestCaseToSuite, removeTestCaseFromSuite } from "@/store/slices/testSlice";
import { selectAllProducts, selectAllTestSuites, selectAllTestCases, selectModulesByProduct, selectTestCasesInSuite } from "@/store/selectors";
import { 
  Plus, 
  Search, 
  Filter, 
  FolderOpen, 
  CheckCircle, 
  XCircle, 
  Clock,
  Edit,
  Users,
  Calendar,
  FileText,
  Archive,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

export const TestSuiteManager = () => {
  const dispatch = useAppDispatch();
  const testSuites = useAppSelector(selectAllTestSuites);
  const testCases = useAppSelector(selectAllTestCases);
  const products = useAppSelector(selectAllProducts);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSuite, setEditingSuite] = useState<TestSuite | null>(null);
  const [isManageTestCasesOpen, setIsManageTestCasesOpen] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  
  // Test case management pagination
  const [testCaseSearchTerm, setTestCaseSearchTerm] = useState("");
  const [testCaseCurrentPage, setTestCaseCurrentPage] = useState(1);
  const [testCaseItemsPerPage] = useState(10);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productId: "",
    moduleId: "",
    owner: "",
    status: "Active" as TestSuite['status']
  });

  // Get modules based on selected product
  const modules = useAppSelector((state) => 
    formData.productId ? selectModulesByProduct(state, formData.productId) : []
  );

  // Get test cases for the selected suite
  const suiteTestCases = useAppSelector((state) => 
    selectedSuite ? selectTestCasesInSuite(state, selectedSuite.id) : []
  );

  // Get filtered test cases for the manage dialog
  const getFilteredTestCasesForManagement = () => {
    if (!selectedSuite) return [];
    
    // Get all test cases for the same product as the selected suite
    const productTestCases = testCases.filter(tc => tc.productId === selectedSuite.productId);
    
    // Filter by search term
    const searchFiltered = productTestCases.filter(tc =>
      tc.title.toLowerCase().includes(testCaseSearchTerm.toLowerCase()) ||
      tc.id.toLowerCase().includes(testCaseSearchTerm.toLowerCase()) ||
      tc.description.toLowerCase().includes(testCaseSearchTerm.toLowerCase())
    );
    
    return searchFiltered;
  };

  const filteredTestCasesForManagement = getFilteredTestCasesForManagement();
  
  // Pagination for test case management
  const testCaseTotalItems = filteredTestCasesForManagement.length;
  const testCaseTotalPages = Math.ceil(testCaseTotalItems / testCaseItemsPerPage);
  const testCaseStartIndex = (testCaseCurrentPage - 1) * testCaseItemsPerPage;
  const testCaseEndIndex = testCaseStartIndex + testCaseItemsPerPage;
  const currentTestCasesForManagement = filteredTestCasesForManagement.slice(testCaseStartIndex, testCaseEndIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Inactive": return "bg-yellow-100 text-yellow-800";
      case "Archived": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active": return <CheckCircle className="h-4 w-4" />;
      case "Inactive": return <Clock className="h-4 w-4" />;
      case "Archived": return <Archive className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  const getTestCaseStatusColor = (status: string) => {
    switch (status) {
      case "Passed": return "bg-green-100 text-green-800";
      case "Failed": return "bg-red-100 text-red-800";
      case "Blocked": return "bg-yellow-100 text-yellow-800";
      case "Not Run": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Reset module when product changes
      ...(field === "productId" && { moduleId: "" })
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      productId: "",
      moduleId: "",
      owner: "",
      status: "Active"
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Suite name is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.productId) return "Product selection is required";
    if (!formData.moduleId) return "Module selection is required";
    if (!formData.owner.trim()) return "Owner is required";
    
    // Check for duplicate suite names within the same product/module
    const existingSuite = testSuites.find(suite => 
      suite.name.toLowerCase() === formData.name.toLowerCase() &&
      suite.productId === formData.productId &&
      suite.moduleId === formData.moduleId &&
      (!editingSuite || suite.id !== editingSuite.id)
    );
    
    if (existingSuite) return "A test suite with this name already exists in the selected product/module";
    
    return null;
  };

  const handleCreateTestSuite = () => {
    const error = validateForm();
    if (error) {
      alert(error); // In a real app, use proper toast notifications
      return;
    }

    console.log("Creating test suite:", formData);
    dispatch(addTestSuite({
      name: formData.name,
      description: formData.description,
      productId: formData.productId,
      moduleId: formData.moduleId,
      testCaseIds: [],
      status: formData.status,
      owner: formData.owner
    }));
    
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleEditTestSuite = (suite: TestSuite) => {
    setEditingSuite(suite);
    setFormData({
      name: suite.name,
      description: suite.description,
      productId: suite.productId,
      moduleId: suite.moduleId,
      owner: suite.owner,
      status: suite.status
    });
  };

  const handleUpdateTestSuite = () => {
    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    if (editingSuite) {
      console.log("Updating test suite:", formData);
      dispatch(updateTestSuite({
        id: editingSuite.id,
        updates: {
          name: formData.name,
          description: formData.description,
          productId: formData.productId,
          moduleId: formData.moduleId,
          owner: formData.owner,
          status: formData.status
        }
      }));
      
      setEditingSuite(null);
      resetForm();
    }
  };

  const handleManageTestCases = (suite: TestSuite) => {
    setSelectedSuite(suite);
    setTestCaseSearchTerm("");
    setTestCaseCurrentPage(1);
    setIsManageTestCasesOpen(true);
  };

  const handleTestCaseToggle = (testCaseId: string, isChecked: boolean) => {
    if (!selectedSuite) return;

    if (isChecked) {
      dispatch(addTestCaseToSuite({
        suiteId: selectedSuite.id,
        testCaseId: testCaseId
      }));
    } else {
      dispatch(removeTestCaseFromSuite({
        suiteId: selectedSuite.id,
        testCaseId: testCaseId
      }));
    }
  };

  const filteredTestSuites = testSuites.filter(suite => {
    const matchesSearch = suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suite.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suite.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || suite.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredTestSuites.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTestSuites = filteredTestSuites.slice(startIndex, endIndex);

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || "Unknown Product";
  };

  const getModuleName = (moduleId: string) => {
    const allModules = products.flatMap(p => modules);
    const module = allModules.find(m => m.id === moduleId);
    return module?.name || "Unknown Module";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test Suite Management</h1>
          <p className="text-gray-600 mt-2">Create and manage comprehensive test suites following industry standards</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Test Suite
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px]">
              <DialogHeader>
                <DialogTitle>Create New Test Suite</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="suiteName">Suite Name *</Label>
                  <Input
                    id="suiteName"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter test suite name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="suiteDescription">Description *</Label>
                  <Textarea
                    id="suiteDescription"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe the purpose and scope of this test suite"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="suiteProduct">Product *</Label>
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
                    <Label htmlFor="suiteModule">Module *</Label>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="suiteOwner">Owner *</Label>
                    <Input
                      id="suiteOwner"
                      value={formData.owner}
                      onChange={(e) => handleInputChange("owner", e.target.value)}
                      placeholder="Enter suite owner name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="suiteStatus">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTestSuite}>
                  Create Test Suite
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Test Suite Dialog */}
      <Dialog open={!!editingSuite} onOpenChange={() => {
        setEditingSuite(null);
        resetForm();
      }}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Test Suite</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="editSuiteName">Suite Name *</Label>
              <Input
                id="editSuiteName"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter test suite name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editSuiteDescription">Description *</Label>
              <Textarea
                id="editSuiteDescription"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe the purpose and scope of this test suite"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editSuiteProduct">Product *</Label>
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
                <Label htmlFor="editSuiteModule">Module *</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="editSuiteOwner">Owner *</Label>
                <Input
                  id="editSuiteOwner"
                  value={formData.owner}
                  onChange={(e) => handleInputChange("owner", e.target.value)}
                  placeholder="Enter suite owner name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editSuiteStatus">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setEditingSuite(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTestSuite}>
              Update Test Suite
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Test Cases Dialog */}
      <Dialog open={isManageTestCasesOpen} onOpenChange={setIsManageTestCasesOpen}>
        <DialogContent className="sm:max-w-[1200px]">
          <DialogHeader>
            <DialogTitle>Manage Test Cases - {selectedSuite?.name}</DialogTitle>
            <p className="text-sm text-gray-600">
              Select test cases to include in this test suite. Showing test cases for {selectedSuite && getProductName(selectedSuite.productId)}.
            </p>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Search for test cases */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search test cases..."
                  value={testCaseSearchTerm}
                  onChange={(e) => {
                    setTestCaseSearchTerm(e.target.value);
                    setTestCaseCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              <div className="text-sm text-gray-600">
                {selectedSuite?.testCaseIds.length || 0} test cases selected
              </div>
            </div>

            {/* Test Cases Table */}
            <div className="border rounded-lg max-h-[60vh] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead className="w-[200px]">Description</TableHead>
                    <TableHead className="w-[100px]">Priority</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[120px]">Assignee</TableHead>
                    <TableHead className="w-[100px]">Est. Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentTestCasesForManagement.map((testCase) => (
                    <TableRow key={testCase.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSuite?.testCaseIds.includes(testCase.id) || false}
                          onCheckedChange={(checked) => handleTestCaseToggle(testCase.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{testCase.id}</TableCell>
                      <TableCell className="font-medium">
                        <div className="max-w-[280px] truncate" title={testCase.title}>
                          {testCase.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[180px] truncate text-sm text-gray-600" title={testCase.description}>
                          {testCase.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(testCase.priority)}>
                          {testCase.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTestCaseStatusColor(testCase.status)}>
                          {testCase.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{testCase.assignee}</TableCell>
                      <TableCell className="text-sm">{testCase.estimatedTime}m</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {currentTestCasesForManagement.length === 0 && (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test Cases Found</h3>
                  <p className="text-gray-600">
                    {testCaseSearchTerm 
                      ? "Try adjusting your search criteria." 
                      : "No test cases are available for this product."}
                  </p>
                </div>
              )}
            </div>

            {/* Test Case Pagination */}
            {testCaseTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {testCaseStartIndex + 1} to {Math.min(testCaseEndIndex, testCaseTotalItems)} of {testCaseTotalItems} test cases
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setTestCaseCurrentPage(Math.max(1, testCaseCurrentPage - 1))}
                        className={testCaseCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, testCaseTotalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(testCaseCurrentPage - 2, testCaseTotalPages - 4)) + i;
                      if (page > testCaseTotalPages) return null;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setTestCaseCurrentPage(page)}
                            isActive={testCaseCurrentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setTestCaseCurrentPage(Math.min(testCaseTotalPages, testCaseCurrentPage + 1))}
                        className={testCaseCurrentPage === testCaseTotalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsManageTestCasesOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search test suites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Test Suites Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Suite Name</TableHead>
                <TableHead className="w-[300px]">Description</TableHead>
                <TableHead className="w-[120px]">Product</TableHead>
                <TableHead className="w-[120px]">Module</TableHead>
                <TableHead className="w-[80px]">Test Cases</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[120px]">Owner</TableHead>
                <TableHead className="w-[100px]">Last Modified</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTestSuites.map((suite) => (
                <TableRow key={suite.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                      <span>{suite.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600 truncate max-w-[280px]" title={suite.description}>
                      {suite.description}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">{getProductName(suite.productId)}</TableCell>
                  <TableCell className="text-sm">{getModuleName(suite.moduleId)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{suite.testCaseIds.length}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(suite.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(suite.status)}
                        <span>{suite.status}</span>
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{suite.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{suite.lastModified}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditTestSuite(suite)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleManageTestCases(suite)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {currentTestSuites.length === 0 && (
            <div className="p-8 text-center">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test Suites Found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search criteria or filters." 
                  : "Create your first test suite to get started with organized testing."}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test Suite
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} test suites
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
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
  );
};
