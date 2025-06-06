
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TestPlan, updateTestPlan } from "@/store/slices/testPlanSlice";
import { selectAllTestSuites, selectAllUsers } from "@/store/selectors";

interface TestSuiteManagementDialogProps {
  testPlan: TestPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestSuiteManagementDialog({ testPlan, open, onOpenChange }: TestSuiteManagementDialogProps) {
  const dispatch = useAppDispatch();
  const allTestSuites = useAppSelector(selectAllTestSuites);
  const users = useAppSelector(selectAllUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.fullName || "Unknown User";
  };

  const availableTestSuites = allTestSuites.filter(
    suite => !testPlan.testSuiteIds.includes(suite.id) &&
             suite.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mappedTestSuites = testPlan.testSuiteIds.map(suiteId => 
    allTestSuites.find(suite => suite.id === suiteId)
  ).filter(Boolean);

  const handleAddTestSuite = (suiteId: string) => {
    console.log("Adding test suite:", suiteId);
    const updatedSuiteIds = [...testPlan.testSuiteIds, suiteId];
    dispatch(updateTestPlan({
      id: testPlan.id,
      updates: { testSuiteIds: updatedSuiteIds }
    }));
  };

  const handleRemoveTestSuite = (suiteId: string) => {
    console.log("Removing test suite:", suiteId);
    const updatedSuiteIds = testPlan.testSuiteIds.filter(id => id !== suiteId);
    dispatch(updateTestPlan({
      id: testPlan.id,
      updates: { testSuiteIds: updatedSuiteIds }
    }));
  };

  const handleMoveUp = (index: number) => {
    console.log("Moving up index:", index);
    if (index > 0) {
      const updatedSuiteIds = [...testPlan.testSuiteIds];
      [updatedSuiteIds[index], updatedSuiteIds[index - 1]] = [updatedSuiteIds[index - 1], updatedSuiteIds[index]];
      dispatch(updateTestPlan({
        id: testPlan.id,
        updates: { testSuiteIds: updatedSuiteIds }
      }));
    }
  };

  const handleMoveDown = (index: number) => {
    console.log("Moving down index:", index);
    if (index < testPlan.testSuiteIds.length - 1) {
      const updatedSuiteIds = [...testPlan.testSuiteIds];
      [updatedSuiteIds[index], updatedSuiteIds[index + 1]] = [updatedSuiteIds[index + 1], updatedSuiteIds[index]];
      dispatch(updateTestPlan({
        id: testPlan.id,
        updates: { testSuiteIds: updatedSuiteIds }
      }));
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'Archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-full max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Test Suites - {testPlan.name}</DialogTitle>
          <DialogDescription>
            Map and unmap test suites for this test plan
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
          {/* Available Test Suites */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Available Test Suites</h3>
              <div className="relative mt-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search test suites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[250px]">Name</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Test Cases</TableHead>
                    <TableHead className="min-w-[120px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableTestSuites.map((suite) => (
                    <TableRow key={suite.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{suite.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {suite.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusBadgeClass(suite.status)}>
                          {suite.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{suite.testCaseIds.length}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddTestSuite(suite.id);
                          }}
                          className="h-8 px-3"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {availableTestSuites.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No available test suites found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Mapped Test Suites */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Mapped Test Suites ({testPlan.testSuiteIds.length})</h3>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[250px]">Name</TableHead>
                    <TableHead className="min-w-[120px]">Status</TableHead>
                    <TableHead className="min-w-[120px]">Test Cases</TableHead>
                    <TableHead className="min-w-[140px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappedTestSuites.map((suite, index) => (
                    <TableRow key={suite.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{suite.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {suite.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusBadgeClass(suite.status)}>
                          {suite.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{suite.testCaseIds.length}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMoveUp(index);
                            }}
                            disabled={index === 0}
                            className="h-8 w-8 p-0"
                            title="Move up"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleMoveDown(index);
                            }}
                            disabled={index === mappedTestSuites.length - 1}
                            className="h-8 w-8 p-0"
                            title="Move down"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleRemoveTestSuite(suite.id);
                            }}
                            className="h-8 w-8 p-0"
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {mappedTestSuites.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No test suites mapped to this plan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
