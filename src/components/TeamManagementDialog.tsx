
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, X, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TestPlan, updateTestPlan } from "@/store/slices/testPlanSlice";

interface TeamManagementDialogProps {
  testPlan: TestPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamManagementDialog({ testPlan, open, onOpenChange }: TeamManagementDialogProps) {
  const dispatch = useAppDispatch();
  const allUsers = useAppSelector(state => state.users.users);
  const currentTestPlan = useAppSelector(state => 
    state.testPlans.testPlans.find(plan => plan.id === testPlan.id)
  ) || testPlan;
  const [searchTerm, setSearchTerm] = useState("");

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  // Get assigned team members using the current state from Redux
  const assignedMembers = allUsers.filter(user => 
    currentTestPlan.assignedTeamMembers.includes(user.id)
  );
  
  // Get available users (not assigned and matching search)
  const availableUsers = allUsers.filter(user => 
    !currentTestPlan.assignedTeamMembers.includes(user.id) &&
    user.status === 'Active' &&
    (user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.roles.some(role => role.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleAddTeamMember = (userId: string) => {
    const updatedTeamMembers = [...currentTestPlan.assignedTeamMembers, userId];
    dispatch(updateTestPlan({ 
      id: currentTestPlan.id, 
      updates: { assignedTeamMembers: updatedTeamMembers } 
    }));
  };

  const handleRemoveTeamMember = (userId: string) => {
    const updatedTeamMembers = currentTestPlan.assignedTeamMembers.filter(id => id !== userId);
    dispatch(updateTestPlan({ 
      id: currentTestPlan.id, 
      updates: { assignedTeamMembers: updatedTeamMembers } 
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'developer': return 'bg-green-100 text-green-800';
      case 'tester': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Team - {currentTestPlan.name}</DialogTitle>
          <DialogDescription>
            Assign and manage team members for this test plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Assigned Team Members */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Assigned Team Members ({assignedMembers.length})</h3>
            {assignedMembers.length > 0 ? (
              <div className="space-y-2">
                {assignedMembers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="font-medium">{user.fullName}</div>
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                      <div className="flex gap-1 mt-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="secondary" className={getRoleColor(role)}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTeamMember(user.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No team members assigned to this test plan yet
              </div>
            )}
          </div>

          {/* Search and Add Team Members */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Available Team Members</h3>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {availableUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles.map((role) => (
                            <Badge key={role} variant="secondary" className={getRoleColor(role)}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTeamMember(user.id)}
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
                {searchTerm ? "No team members found matching your search" : "No additional team members available"}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
