import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTestCase, updateTestCase, TestCase } from "@/store/slices/testSlice";
import { selectAllProducts } from "@/store/selectors";
import { selectModulesByProduct } from "@/store/selectors";
import { selectAllTestCases } from "@/store/selectors";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Edit
} from "lucide-react";
import { cn } from "@/lib/utils";

export const TestCases = () => {
  const dispatch = useAppDispatch();
  const testCases = useAppSelector(selectAllTestCases);
  const products = useAppSelector(selectAllProducts);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["login", "checkout"]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium" as TestCase['priority'],
    productId: "",
    moduleId: "",
    assignee: "",
    steps: "",
    expectedResult: "",
    estimatedTime: 5
  });

  // Get modules based on selected product
  const modules = useAppSelector((state) => selectModulesByProduct(state, formData.productId));

  const folders = [
    { id: "all", name: "All Test Cases", count: testCases.length },
    { id: "login", name: "User Authentication", count: testCases.filter(tc => tc.moduleId === "MOD001").length, children: [
      { id: "login-basic", name: "Basic Login", count: 12 },
      { id: "login-social", name: "Social Login", count: 8 },
      { id: "login-security", name: "Security Tests", count: 25 }
    ]},
    { id: "checkout", name: "Checkout Process", count: testCases.filter(tc => tc.moduleId === "MOD002").length, children: [
      { id: "cart", name: "Shopping Cart", count: 23 },
      { id: "payment", name: "Payment Gateway", count: 34 },
      { id: "confirmation", name: "Order Confirmation", count: 10 }
    ]},
    { id: "api", name: "API Testing", count: testCases.filter(tc => tc.moduleId === "MOD003").length },
    { id: "mobile", name: "Mobile App", count: 46 },
  ];

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

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
      assignee: "",
      steps: "",
      expectedResult: "",
      estimatedTime: 5
    });
  };

  const handleCreateTestCase = () => {
    if (formData.title && formData.productId && formData.moduleId) {
      console.log("Creating test case:", formData);
      dispatch(addTestCase({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: "Not Run",
        steps: formData.steps ? formData.steps.split('\n').filter(s => s.trim()) : [],
        expectedResult: formData.expectedResult,
        assignee: formData.assignee,
        productId: formData.productId,
        moduleId: formData.moduleId,
        estimatedTime: formData.estimatedTime
      }));
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setFormData({
      title: testCase.title,
      description: testCase.description,
      priority: testCase.priority,
      productId: testCase.productId,
      moduleId: testCase.moduleId,
      assignee: testCase.assignee,
      steps: testCase.steps.join('\n'),
      expectedResult: testCase.expectedResult,
      estimatedTime: testCase.estimatedTime
    });
  };

  const handleUpdateTestCase = () => {
    if (editingTestCase && formData.title && formData.productId && formData.moduleId) {
      console.log("Updating test case:", formData);
      dispatch(updateTestCase({
        id: editingTestCase.id,
        updates: {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          steps: formData.steps ? formData.steps.split('\n').filter(s => s.trim()) : [],
          expectedResult: formData.expectedResult,
          assignee: formData.assignee,
          productId: formData.productId,
          moduleId: formData.moduleId,
          estimatedTime: formData.estimatedTime
        }
      }));
      setEditingTestCase(null);
      resetForm();
    }
  };

  const filteredTestCases = testCases.filter(testCase => 
    testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testCase.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Test Case</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
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
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="assignee">Assignee</Label>
                    <Input
                      id="assignee"
                      value={formData.assignee}
                      onChange={(e) => handleInputChange("assignee", e.target.value)}
                      placeholder="Enter assignee name"
                    />
                  </div>
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
              </div>
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
      <Dialog open={!!editingTestCase} onOpenChange={() => {
        setEditingTestCase(null);
        resetForm();
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Test Case</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="editAssignee">Assignee</Label>
                <Input
                  id="editAssignee"
                  value={formData.assignee}
                  onChange={(e) => handleInputChange("assignee", e.target.value)}
                  placeholder="Enter assignee name"
                />
              </div>
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
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setEditingTestCase(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTestCase}>
              Update Test Case
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with folders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Test Suites</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {folders.map((folder) => (
                <div key={folder.id}>
                  <button
                    onClick={() => {
                      setSelectedFolder(folder.id);
                      if (folder.children) toggleFolder(folder.id);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors",
                      selectedFolder === folder.id && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      {folder.children && (
                        expandedFolders.includes(folder.id) ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{folder.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {folder.count}
                    </Badge>
                  </button>
                  
                  {folder.children && expandedFolders.includes(folder.id) && (
                    <div className="ml-6 space-y-1">
                      {folder.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedFolder(child.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors",
                            selectedFolder === child.id && "bg-blue-50 text-blue-700"
                          )}
                        >
                          <span className="text-sm">{child.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {child.count}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search test cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test cases table */}
          <Card>
            <CardHeader>
              <CardTitle>Test Cases ({filteredTestCases.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTestCases.map((testCase) => (
                      <tr key={testCase.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {testCase.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {testCase.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getPriorityColor(testCase.priority)}>
                            {testCase.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(testCase.status)}>
                            {testCase.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {testCase.lastRun}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {testCase.assignee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button variant="ghost" size="sm" onClick={() => handleEditTestCase(testCase)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
