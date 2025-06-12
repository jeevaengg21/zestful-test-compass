import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAppSelector } from "@/store/hooks";
import { selectAllProducts } from "@/store/selectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ModuleManager } from "./ModuleManager";
import { 
  Plus, 
  FolderOpen, 
  Users, 
  Calendar, 
  BarChart3,
  Settings,
  CheckCircle,
  Clock,
  ArrowLeft,
  Layers,
  Edit,
  MoreVertical
} from "lucide-react";

export const Products = () => {
  // Use Redux store for products instead of individual API call
  const reduxProducts = useAppSelector(selectAllProducts);
  const isLoading = useAppSelector(state => state.products.loading);
  
  // Local products state for immediate UI updates
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  
  // Sync local state when Redux data changes
  useEffect(() => {
    if (reduxProducts.length > 0) {
      setLocalProducts(reduxProducts);
    }
  }, [reduxProducts]);

  const products = localProducts;

  const createProductMutation = useMutation({
    mutationFn: (productData: any) => apiRequest('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    }),
    onSuccess: (newProduct) => {
      // Add new product to local state for immediate UI update
      setLocalProducts(prevProducts => [newProduct, ...prevProducts]);
      setIsCreateDialogOpen(false);
      resetForm();
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      apiRequest(`/api/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
    onSuccess: (updatedProduct) => {
      // Update local state immediately for instant UI update
      setLocalProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
      setEditingProduct(null);
      resetForm();
    }
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productName: "",
    productOwner: "",
    description: "",
    status: "Active" as "Active" | "On Hold" | "Completed"
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Inactive": return "bg-gray-100 text-gray-800";
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
    if (formData.productName && formData.productOwner) {
      createProductMutation.mutate({
        name: formData.productName,
        owner: formData.productOwner,
        description: formData.description,
        status: formData.status
      });
    }
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      productOwner: "",
      description: "",
      status: "Active" as const
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      productName: product.name,
      productOwner: product.owner || "",
      description: product.description,
      status: (product.status || "Active") as "Active"
    });
  };

  const handleUpdateProduct = () => {
    if (editingProduct && formData.productName && formData.productOwner) {
      updateProductMutation.mutate({
        id: editingProduct.id,
        updates: {
          name: formData.productName,
          owner: formData.productOwner,
          description: formData.description,
          status: formData.status
        }
      });
    }
  };

  const handleViewModules = (productId: string) => {
    setSelectedProduct(productId);
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
  };

  const selectedProductData = products.find(p => p.id === selectedProduct);

  // If a product is selected, show the module manager
  if (selectedProduct && selectedProductData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToProducts}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedProductData.name}</h1>
            <p className="text-gray-600">{selectedProductData.description}</p>
          </div>
        </div>
        <ModuleManager 
          productId={selectedProduct} 
          productName={selectedProductData.name}
        />
      </div>
    );
  }

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

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editProductName">Product Name</Label>
              <Input
                id="editProductName"
                value={formData.productName}
                onChange={(e) => handleInputChange("productName", e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editProductOwner">Product Owner</Label>
              <Input
                id="editProductOwner"
                value={formData.productOwner}
                onChange={(e) => handleInputChange("productOwner", e.target.value)}
                placeholder="Enter product owner"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editStatus">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter product description"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditingProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>
              Update Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
                  {products.reduce((sum, p) => sum + (p.teamMembers || 0), 0)}
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
                  {products.length > 0 ? Math.round(products.reduce((sum, p) => sum + (p.coverage || 0), 0) / products.length) : 0}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid with Scroll Area */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
                        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(product.status)}>
                          {product.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Product
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                        <span className={`font-medium ${getCoverageColor(product.coverage || 0)}`}>
                          {product.coverage || 0}%
                        </span>
                      </div>
                      <Progress value={product.coverage || 0} className="h-2" />
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
                          <span>{product.lastActivity ? new Date(product.lastActivity).toLocaleDateString() : 'No activity'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Created: {product.createdDate ? new Date(product.createdDate).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewModules(product.id)}
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        View Modules
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

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
