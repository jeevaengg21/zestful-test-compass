import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createTestSuiteAsync, updateTestSuiteAsync, deleteTestSuiteAsync, TestSuite } from "@/store/slices/testSlice";
import { selectAllProducts, selectAllTestSuites, selectAllTestCases, selectModulesByProduct, selectAllModules, selectAllUsers } from "@/store/selectors";
import { 
  Plus, 
  Search, 
  Filter, 
  FolderOpen, 
  CheckCircle, 
  Clock,
  Edit,
  Users,
  Calendar,
  FileText,
  Archive,
  ChevronUp,
  ChevronDown,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export const TestSuiteManager = () => {
  const dispatch = useAppDispatch();
  const testSuites = useAppSelector(selectAllTestSuites);
  const testCases = useAppSelector(selectAllTestCases);
  const products = useAppSelector(selectAllProducts);
  const allModules = useAppSelector(selectAllModules);
  const users = useAppSelector(selectAllUsers);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSuite, setEditingSuite] = useState<TestSuite | null>(null);
  const [isManageTestCasesOpen, setIsManageTestCasesOpen] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  
  // Test case management search
  const [testCaseSearchTerm, setTestCaseSearchTerm] = useState("");
  
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

  // Get the current suite data to ensure we have the latest testCaseIds
  const currentSelectedSuite = useAppSelector((state) => 
    selectedSuite ? state.tests.testSuites.find(s => s.id === selectedSuite.id) : null
  );

  // Get mapped test cases using the current state from Redux
  const mappedTestCases = testCases.filter(testCase => 
    currentSelectedSuite?.testCaseIds.includes(testCase.id)
  ).sort((a, b) => {
    const indexA = currentSelectedSuite?.testCaseIds.indexOf(a.id) ?? -1;
    const indexB = currentSelectedSuite?.testCaseIds.indexOf(b.id) ?? -1;
    return indexA - indexB;
  });
  
  // Get available test cases (not mapped and matching search)
  const availableTestCases = testCases.filter(testCase => 
    !currentSelectedSuite?.testCaseIds.includes(testCase.id) &&
    testCase.productId === currentSelectedSuite?.productId &&
    testCase.moduleId === currentSelectedSuite?.moduleId &&
    (testCase.title.toLowerCase().includes(testCaseSearchTerm.toLowerCase()) ||
     testCase.description.toLowerCase().includes(testCaseSearchTerm.toLowerCase()))
  );

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
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestCaseStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-gray-100 text-gray-800';
      case 'not run': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const handleCreateTestSuite = async () => {
    const error = validateForm();
    if (error) {
      alert(error); // In a real app, use proper toast notifications
      return;
    }

    console.log("Creating test suite:", formData);
    try {
      await dispatch(createTestSuiteAsync({
        name: formData.name,
        description: formData.description,
        productId: formData.productId,
        moduleId: formData.moduleId,
        testCaseIds: [],
        status: formData.status,
        owner: formData.owner
      })).unwrap();
      
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create test suite:', error);
      alert('Failed to create test suite. Please try again.');
    }
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
    console.log("Managing test cases for suite:", suite.id, "Current test case IDs:", suite.testCaseIds);
    setSelectedSuite(suite);
    setTestCaseSearchTerm("");
    setIsManageTestCasesOpen(true);
  };

  const handleAddTestCase = async (testCaseId: string) => {
    if (!currentSelectedSuite) return;
    const updatedTestCaseIds = [...currentSelectedSuite.testCaseIds, testCaseId];
    console.log("Adding test case:", testCaseId, "Updated IDs:", updatedTestCaseIds);
    
    try {
      await dispatch(updateTestSuiteAsync({ 
        id: currentSelectedSuite.id, 
        updates: { testCaseIds: updatedTestCaseIds } 
      })).unwrap();
    } catch (error) {
      console.error('Failed to add test case to suite:', error);
    }
  };

  const handleRemoveTestCase = async (testCaseId: string) => {
    if (!currentSelectedSuite) return;
    const updatedTestCaseIds = currentSelectedSuite.testCaseIds.filter(id => id !== testCaseId);
    console.log("Removing test case:", testCaseId, "Updated IDs:", updatedTestCaseIds);
    
    try {
      await dispatch(updateTestSuiteAsync({ 
        id: currentSelectedSuite.id, 
        updates: { testCaseIds: updatedTestCaseIds } 
      })).unwrap();
    } catch (error) {
      console.error('Failed to remove test case from suite:', error);
    }
  };

  const handleMoveUp = async (testCaseId: string) => {
    if (!currentSelectedSuite) return;
    const currentIndex = currentSelectedSuite.testCaseIds.indexOf(testCaseId);
    if (currentIndex > 0) {
      const updatedTestCaseIds = [...currentSelectedSuite.testCaseIds];
      [updatedTestCaseIds[currentIndex - 1], updatedTestCaseIds[currentIndex]] = 
      [updatedTestCaseIds[currentIndex], updatedTestCaseIds[currentIndex - 1]];
      
      try {
        await dispatch(updateTestSuiteAsync({ 
          id: currentSelectedSuite.id, 
          updates: { testCaseIds: updatedTestCaseIds } 
        })).unwrap();
      } catch (error) {
        console.error('Failed to reorder test cases:', error);
      }
    }
  };

  const handleMoveDown = async (testCaseId: string) => {
    if (!currentSelectedSuite) return;
    const currentIndex = currentSelectedSuite.testCaseIds.indexOf(testCaseId);
    if (currentIndex < currentSelectedSuite.testCaseIds.length - 1) {
      const updatedTestCaseIds = [...currentSelectedSuite.testCaseIds];
      [updatedTestCaseIds[currentIndex], updatedTestCaseIds[currentIndex + 1]] = 
      [updatedTestCaseIds[currentIndex + 1], updatedTestCaseIds[currentIndex]];
      
      try {
        await dispatch(updateTestSuiteAsync({ 
          id: currentSelectedSuite.id, 
          updates: { testCaseIds: updatedTestCaseIds } 
        })).unwrap();
      } catch (error) {
        console.error('Failed to reorder test cases:', error);
      }
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
                    <Select value={formData.owner} onValueChange={(value) => handleInputChange("owner", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.fullName || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <Select value={formData.owner} onValueChange={(value) => handleInputChange("owner", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* Updated Manage Test Cases Dialog with Side-by-Side Layout */}
      <Dialog open={isManageTestCasesOpen} onOpenChange={setIsManageTestCasesOpen}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Test Cases - {selectedSuite?.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add or remove test cases for this test suite using the side-by-side interface below.
            </p>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Test Cases - Left Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Available Test Cases</h3>
                <Badge variant="outline">{availableTestCases.length} available</Badge>
              </div>
              
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search available test cases..."
                  value={testCaseSearchTerm}
                  onChange={(e) => setTestCaseSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              <div className="border rounded-lg bg-card">
                {availableTestCases.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Title</TableHead>
                        <TableHead className="w-[80px]">Priority</TableHead>
                        <TableHead className="w-[80px]">Status</TableHead>
                        <TableHead className="w-[80px]">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableTestCases.map((testCase) => (
                        <TableRow key={testCase.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{testCase.title}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {testCase.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getPriorityColor(testCase.priority)}>
                              {testCase.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getTestCaseStatusColor(testCase.status)}>
                              {testCase.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddTestCase(testCase.id)}
                              className="h-8"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {testCaseSearchTerm ? "No test cases found matching your search" : "No additional test cases available"}
                  </div>
                )}
              </div>
            </div>

            {/* Mapped Test Cases - Right Side */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Mapped Test Cases</h3>
                <Badge variant="outline">{mappedTestCases.length} mapped</Badge>
              </div>
              
              <div className="border rounded-lg bg-card">
                {mappedTestCases.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Title</TableHead>
                        <TableHead className="w-[80px]">Priority</TableHead>
                        <TableHead className="w-[80px]">Status</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mappedTestCases.map((testCase, index) => (
                        <TableRow key={testCase.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm">{testCase.title}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[180px]">
                                {testCase.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getPriorityColor(testCase.priority)}>
                              {testCase.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={getTestCaseStatusColor(testCase.status)}>
                              {testCase.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMoveUp(testCase.id)}
                                disabled={index === 0}
                                className="h-8 w-8 p-0"
                                title="Move up"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMoveDown(testCase.id)}
                                disabled={index === mappedTestCases.length - 1}
                                className="h-8 w-8 p-0"
                                title="Move down"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveTestCase(testCase.id)}
                                className="h-8 w-8 p-0"
                                title="Remove"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No test cases mapped to this suite yet. Add some from the available test cases on the left.
                  </div>
                )}
              </div>
            </div>
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
