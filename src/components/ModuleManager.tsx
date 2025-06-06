
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Users, 
  Calendar, 
  Settings,
  User,
  UserCheck,
  Code,
  Bug
} from "lucide-react";

interface Module {
  id: string;
  name: string;
  description: string;
  moduleOwner: string;
  manager: string;
  developers: string[];
  testers: string[];
  createdDate: string;
  status: string;
}

interface ModuleManagerProps {
  productId: string;
  productName: string;
}

export const ModuleManager = ({ productId, productName }: ModuleManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    moduleName: "",
    description: "",
    moduleOwner: "",
    manager: "",
    developers: "",
    testers: ""
  });

  // Sample modules data
  const [modules] = useState<Module[]>([
    {
      id: "MOD001",
      name: "User Authentication",
      description: "Login, registration, and password management functionality",
      moduleOwner: "John Doe",
      manager: "Jane Smith",
      developers: ["Alice Johnson", "Bob Wilson"],
      testers: ["Carol Brown", "David Lee"],
      createdDate: "2023-11-01",
      status: "Active"
    },
    {
      id: "MOD002",
      name: "Payment Processing",
      description: "Payment gateway integration and transaction handling",
      moduleOwner: "Mike Johnson",
      manager: "Sarah Wilson",
      developers: ["Tom Davis", "Lisa Garcia"],
      testers: ["Mark Anderson"],
      createdDate: "2023-11-05",
      status: "In Development"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "In Development": return "bg-blue-100 text-blue-800";
      case "Testing": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateModule = () => {
    console.log("Creating module:", formData);
    // Here you would handle the module creation logic
    setIsCreateDialogOpen(false);
    setFormData({
      moduleName: "",
      description: "",
      moduleOwner: "",
      manager: "",
      developers: "",
      testers: ""
    });
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
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateModule}>
                Create Module
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modules Table */}
      {modules.length > 0 ? (
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
                {modules.map((module) => (
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
                        <span className="text-sm">{module.developers.length}</span>
                      </div>
                      <div className="text-xs text-gray-500 max-w-32 truncate" title={module.developers.join(", ")}>
                        {module.developers.join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Bug className="h-3 w-3 text-orange-600" />
                        <span className="text-sm">{module.testers.length}</span>
                      </div>
                      <div className="text-xs text-gray-500 max-w-32 truncate" title={module.testers.join(", ")}>
                        {module.testers.join(", ")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(module.status)}>
                        {module.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{module.createdDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
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
