import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addUser } from "@/store/slices/userSlice";
import { selectAllUsers } from "@/store/selectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Users as UsersIcon, 
  Calendar, 
  Settings,
  User,
  Shield,
  Code,
  Bug,
  UserCheck
} from "lucide-react";

const availableRoles = [
  { id: "admin", label: "Admin", icon: Shield },
  { id: "manager", label: "Manager", icon: UserCheck },
  { id: "developer", label: "Developer", icon: Code },
  { id: "tester", label: "Tester", icon: Bug }
];

export const Users = () => {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    roles: [] as string[]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    const roleConfig = availableRoles.find(r => r.id === role);
    return roleConfig ? roleConfig.icon : User;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleChange = (roleId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleId]
        : prev.roles.filter(r => r !== roleId)
    }));
  };

  const handleCreateUser = () => {
    if (formData.email && formData.fullName && formData.roles.length > 0) {
      dispatch(addUser({
        email: formData.email,
        fullName: formData.fullName,
        roles: formData.roles
      }));
      
      setIsCreateDialogOpen(false);
      setFormData({
        email: "",
        fullName: "",
        roles: []
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Roles</Label>
                <div className="space-y-2">
                  {availableRoles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={role.id}
                          checked={formData.roles.includes(role.id)}
                          onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                        />
                        <Icon className="h-4 w-4 text-gray-500" />
                        <Label htmlFor={role.id} className="text-sm font-normal">
                          {role.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      {users.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => {
                          const Icon = getRoleIcon(role);
                          return (
                            <Badge key={role} variant="outline" className="text-xs">
                              <Icon className="h-3 w-3 mr-1" />
                              {role}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{user.createdDate}</span>
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
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first user.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
