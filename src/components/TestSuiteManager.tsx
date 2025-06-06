
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
  Archive
} from "lucide-react";
import { cn } from "@/lib/utils";

export const TestSuiteManager = () => {
  const dispatch = useAppDispatch();
  const testSuites = useAppSelector(selectAllTestSuites);
  const testCases = useAppSelector(selectAllTestCases);
  const products = useAppSelector(selectAllProducts);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSuite, setEditingSuite] = useState<TestSuite | null>(null);
  const [isManageTestCasesOpen, setIsManageTestCasesOpen] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  
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

  // Get available test cases for the selected product/module
  const availableTestCases = testCases.filter(tc => 
    formData.productId && tc.productId === formData.productId &&
    (!formData.moduleId || tc.moduleId === formData.moduleId)
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
    setFormData({
      name: suite.name,
      description: suite.description,
      productId: suite.productId,
      moduleId: suite.moduleId,
      owner: suite.owner,
      status: suite.status
    });
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
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Manage Test Cases - {selectedSuite?.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Available Test Cases</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-3">
                  {availableTestCases.map((testCase) => (
                    <div key={testCase.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                      <Checkbox
                        checked={selectedSuite?.testCaseIds.includes(testCase.id) || false}
                        onCheckedChange={(checked) => handleTestCaseToggle(testCase.id, checked as boolean)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{testCase.title}</p>
                        <p className="text-xs text-gray-500">{testCase.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Selected Test Cases ({suiteTestCases.length})</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto border rounded-lg p-3">
                  {suiteTestCases.map((testCase) => (
                    <div key={testCase.id} className="flex items-center space-x-2 p-2 border rounded bg-blue-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{testCase.title}</p>
                        <p className="text-xs text-gray-500">{testCase.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
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

      {/* Test Suites Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTestSuites.map((suite) => (
          <Card key={suite.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <FolderOpen className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{suite.name}</CardTitle>
                </div>
                <Badge className={getStatusColor(suite.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(suite.status)}
                    <span>{suite.status}</span>
                  </div>
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">{suite.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span>{suite.testCaseIds.length} Test Cases</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{suite.owner}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{suite.lastModified}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>Product: {getProductName(suite.productId)}</p>
                <p>Module: {getModuleName(suite.moduleId)}</p>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditTestSuite(suite)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleManageTestCases(suite)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Manage Cases
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTestSuites.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};
