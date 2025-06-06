
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  FolderOpen, 
  Users, 
  Calendar, 
  BarChart3,
  Settings,
  CheckCircle,
  Clock
} from "lucide-react";

export const Products = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    productOwner: "",
    description: ""
  });

  const products = [
    {
      id: "PROD001",
      name: "E-Commerce Platform",
      description: "Main e-commerce website testing product including web and mobile interfaces",
      status: "Active",
      testCases: 347,
      testRuns: 12,
      teamMembers: 8,
      coverage: 89,
      lastActivity: "2 hours ago",
      createdDate: "2023-10-15",
      owner: "John Doe"
    },
    {
      id: "PROD002", 
      name: "Mobile Application",
      description: "iOS and Android mobile app testing for customer-facing features",
      status: "Active",
      testCases: 156,
      testRuns: 6,
      teamMembers: 5,
      coverage: 76,
      lastActivity: "1 day ago",
      createdDate: "2023-11-20",
      owner: "Jane Smith"
    },
    {
      id: "PROD003",
      name: "Backend Services",
      description: "API testing and microservices integration testing suite",
      status: "On Hold",
      testCases: 234,
      testRuns: 3,
      teamMembers: 4,
      coverage: 92,
      lastActivity: "1 week ago",
      createdDate: "2023-09-10",
      owner: "Mike Johnson"
    },
    {
      id: "PROD004",
      name: "Payment Gateway",
      description: "Payment processing and financial transaction testing",
      status: "Completed",
      testCases: 89,
      testRuns: 8,
      teamMembers: 3,
      coverage: 95,
      lastActivity: "2 weeks ago",
      createdDate: "2023-08-05",
      owner: "Sarah Wilson"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "On Hold": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 90) return "text-green-600";
    if (coverage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateProduct = () => {
    console.log("Creating product:", formData);
    // Here you would handle the product creation logic
    setIsCreateDialogOpen(false);
    setFormData({ productName: "", productOwner: "", description: "" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => handleInputChange("productName", e.target.value)}
                  placeholder="Enter product name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="productOwner">Product Owner</Label>
                <Input
                  id="productOwner"
                  value={formData.productOwner}
                  onChange={(e) => handleInputChange("productOwner", e.target.value)}
                  placeholder="Enter product owner"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProduct}>
                Create Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-3xl font-bold text-green-600">
                  {products.filter(p => p.status === "Active").length}
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
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-3xl font-bold text-purple-600">
                  {products.reduce((sum, p) => sum + p.teamMembers, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Coverage</p>
                <p className="text-3xl font-bold text-blue-600">
                  {Math.round(products.reduce((sum, p) => sum + p.coverage, 0) / products.length)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                </div>
                <Badge className={getStatusColor(product.status)}>
                  {product.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{product.testCases}</div>
                  <div className="text-xs text-gray-500">Test Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{product.testRuns}</div>
                  <div className="text-xs text-gray-500">Test Runs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{product.teamMembers}</div>
                  <div className="text-xs text-gray-500">Team Members</div>
                </div>
              </div>

              {/* Coverage */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Test Coverage</span>
                  <span className={`font-medium ${getCoverageColor(product.coverage)}`}>
                    {product.coverage}%
                  </span>
                </div>
                <Progress value={product.coverage} className="h-2" />
              </div>

              {/* Meta Information */}
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Owner: {product.owner}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{product.lastActivity}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {product.createdDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-3 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-6 w-6" />
              <span>Create Product</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Manage Teams</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
