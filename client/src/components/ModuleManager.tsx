import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Module } from "@shared/schema";
import { useAppSelector } from "@/store/hooks";
import { selectModulesByProduct } from "@/store/selectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Users, 
  Calendar, 
  Settings,
  User,
  UserCheck,
  Code,
  Bug,
  Edit,
  MoreVertical
} from "lucide-react";

interface ModuleManagerProps {
  productId: string;
  productName: string;
}

export const ModuleManager = ({ productId, productName }: ModuleManagerProps) => {
  // Use Redux store for modules data instead of individual API call
  const reduxModules = useAppSelector((state) => selectModulesByProduct(state, productId));
  const isLoading = useAppSelector(state => state.modules.loading);
  
  // Local modules state for immediate UI updates
  const [localModules, setLocalModules] = useState<Module[]>([]);
  
  // Sync local state when Redux data changes
  useEffect(() => {
    if (reduxModules.length > 0) {
      setLocalModules(reduxModules);
    }
  }, [reduxModules]);

  const productModules = localModules;

  const createModuleMutation = useMutation({
    mutationFn: (moduleData: any) => apiRequest('/api/modules', {
      method: 'POST',
      body: JSON.stringify(moduleData)
    }),
    onSuccess: (newModule) => {
      // Add new module to local state for immediate UI update
      setLocalModules(prevModules => [newModule, ...prevModules]);
      setIsCreateDialogOpen(false);
      resetForm();
    }
  });

  const updateModuleMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      apiRequest(`/api/modules/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      }),
    onSuccess: (updatedModule) => {
      // Update local state immediately for instant UI update
      setLocalModules(prevModules => 
        prevModules.map(module => 
          module.id === updatedModule.id ? updatedModule : module
        )
      );
      setEditingModule(null);
      resetForm();
    }
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    moduleName: "",
    description: "",
    moduleOwner: "",
    manager: "",
    developers: "",
    testers: "",
    status: "Active" as "Active" | "Testing" | "In Development" | "On Hold" | "Completed"
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "In Development": return "bg-blue-100 text-blue-800";
      case "Testing": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-gray-100 text-gray-800";
      case "On Hold": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      moduleName: "",
      description: "",
      moduleOwner: "",
      manager: "",
      developers: "",
      testers: "",
      status: "Active"
    });
  };

  const handleCreateModule = () => {
    if (formData.moduleName && formData.moduleOwner) {
      createModuleMutation.mutate({
        name: formData.moduleName,
        description: formData.description,
        moduleOwner: formData.moduleOwner,
        manager: formData.manager,
        developers: formData.developers ? formData.developers.split(',').map(d => d.trim()) : [],
        testers: formData.testers ? formData.testers.split(',').map(t => t.trim()) : [],
        productId: productId,
        status: formData.status
      });
    }
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setFormData({
      moduleName: module.name,
      description: module.description,
      moduleOwner: module.moduleOwner || "",
      manager: module.manager || "",
      developers: module.developers ? module.developers.join(', ') : "",
      testers: module.testers ? module.testers.join(', ') : "",
      status: (module.status || "Active") as "Active" | "Testing" | "In Development" | "On Hold" | "Completed"
    });
  };

  const handleUpdateModule = () => {
    if (editingModule && formData.moduleName && formData.moduleOwner) {
      updateModuleMutation.mutate({
        id: editingModule.id,
        updates: {
          name: formData.moduleName,
          description: formData.description,
          moduleOwner: formData.moduleOwner,
          manager: formData.manager,
          developers: formData.developers ? formData.developers.split(',').map(d => d.trim()) : [],
          testers: formData.testers ? formData.testers.split(',').map(t => t.trim()) : [],
          status: formData.status
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Modules</h2>
          <p className="text-gray-600">Product: {productName}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Module
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Module</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="moduleName">Module Name</Label>
                <Input
                  id="moduleName"
                  value={formData.moduleName}
                  onChange={(e) => handleInputChange("moduleName", e.target.value)}
                  placeholder="Enter module name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Enter module description"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="moduleOwner">Module Owner</Label>
                <Input
                  id="moduleOwner"
                  value={formData.moduleOwner}
                  onChange={(e) => handleInputChange("moduleOwner", e.target.value)}
                  placeholder="Enter module owner"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => handleInputChange("manager", e.target.value)}
                  placeholder="Enter manager name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="developers">Developers</Label>
                <Input
                  id="developers"
                  value={formData.developers}
                  onChange={(e) => handleInputChange("developers", e.target.value)}
                  placeholder="Enter developer names (comma separated)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="testers">Testers</Label>
                <Input
                  id="testers"
                  value={formData.testers}
                  onChange={(e) => handleInputChange("testers", e.target.value)}
                  placeholder="Enter tester names (comma separated)"
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
              <Button onClick={handleCreateModule}>
                Create Module
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Module Dialog */}
      <Dialog open={!!editingModule} onOpenChange={() => {
        setEditingModule(null);
        resetForm();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editModuleName">Module Name</Label>
              <Input
                id="editModuleName"
                value={formData.moduleName}
                onChange={(e) => handleInputChange("moduleName", e.target.value)}
                placeholder="Enter module name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter module description"
                rows={3}
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
                  <SelectItem value="In Development">In Development</SelectItem>
                  <SelectItem value="Testing">Testing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editModuleOwner">Module Owner</Label>
              <Input
                id="editModuleOwner"
                value={formData.moduleOwner}
                onChange={(e) => handleInputChange("moduleOwner", e.target.value)}
                placeholder="Enter module owner"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editManager">Manager</Label>
              <Input
                id="editManager"
                value={formData.manager}
                onChange={(e) => handleInputChange("manager", e.target.value)}
                placeholder="Enter manager name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editDevelopers">Developers</Label>
              <Input
                id="editDevelopers"
                value={formData.developers}
                onChange={(e) => handleInputChange("developers", e.target.value)}
                placeholder="Enter developer names (comma separated)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editTesters">Testers</Label>
              <Input
                id="editTesters"
                value={formData.testers}
                onChange={(e) => handleInputChange("testers", e.target.value)}
                placeholder="Enter tester names (comma separated)"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => {
              setEditingModule(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateModule}>
              Update Module
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modules Table */}
      {productModules.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Module List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Developers</TableHead>
                  <TableHead>Testers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productModules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell className="font-medium">{module.id}</TableCell>
                    <TableCell className="font-medium">{module.name}</TableCell>
                    <TableCell className="max-w-xs truncate" title={module.description}>
                      {module.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3 text-blue-600" />
                        <span className="text-sm">{module.moduleOwner}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <UserCheck className="h-3 w-3 text-green-600" />
                        <span className="text-sm">{module.manager}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Code className="h-3 w-3 text-purple-600" />
                        <span className="text-sm">{(module.developers || []).length}</span>
                      </div>
                      <div className="text-xs text-gray-500 max-w-32 truncate" title={(module.developers || []).join(", ")}>
                        {(module.developers || []).join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Bug className="h-3 w-3 text-orange-600" />
                        <span className="text-sm">{(module.testers || []).length}</span>
                      </div>
                      <div className="text-xs text-gray-500 max-w-32 truncate" title={(module.testers || []).join(", ")}>
                        {(module.testers || []).join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(module.status || "Active")}>
                        {module.status || "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{module.createdDate ? new Date(module.createdDate).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditModule(module)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Module
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first module for this product.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Module
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
