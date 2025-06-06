
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
    const updatedSuiteIds = [...testPlan.testSuiteIds, suiteId];
    dispatch(updateTestPlan({
      id: testPlan.id,
      updates: { testSuiteIds: updatedSuiteIds }
    }));
  };

  const handleRemoveTestSuite = (suiteId: string) => {
    const updatedSuiteIds = testPlan.testSuiteIds.filter(id => id !== suiteId);
    dispatch(updateTestPlan({
      id: testPlan.id,
      updates: { testSuiteIds: updatedSuiteIds }
    }));
  };

  const handleMoveUp = (index: number) => {
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
    if (index < testPlan.testSuiteIds.length - 1) {
      const updatedSuiteIds = [...testPlan.testSuiteIds];
      [updatedSuiteIds[index], updatedSuiteIds[index + 1]] = [updatedSuiteIds[index + 1], updatedSuiteIds[index]];
      dispatch(updateTestPlan({
        id: testPlan.id,
        updates: { testSuiteIds: updatedSuiteIds }
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Test Suites - {testPlan.name}</DialogTitle>
          <DialogDescription>
            Map and unmap test suites for this test plan
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
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

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Test Cases</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableTestSuites.map((suite) => (
                  <TableRow key={suite.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{suite.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {suite.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={
                        suite.status === 'Active' ? 'bg-green-100 text-green-800' :
                        suite.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {suite.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{suite.testCaseIds.length}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddTestSuite(suite.id)}
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

          {/* Mapped Test Suites */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Mapped Test Suites ({testPlan.testSuiteIds.length})</h3>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Test Cases</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappedTestSuites.map((suite, index) => (
                  <TableRow key={suite.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{suite.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {suite.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={
                        suite.status === 'Active' ? 'bg-green-100 text-green-800' :
                        suite.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {suite.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{suite.testCaseIds.length}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMoveDown(index)}
                          disabled={index === mappedTestSuites.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveTestSuite(suite.id)}
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

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
