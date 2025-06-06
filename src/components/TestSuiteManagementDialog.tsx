
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TestPlan, updateTestPlan } from "@/store/slices/testPlanSlice";
import { selectAllTestSuites } from "@/store/selectors";

interface TestSuiteManagementDialogProps {
  testPlan: TestPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestSuiteManagementDialog({ testPlan, open, onOpenChange }: TestSuiteManagementDialogProps) {
  const dispatch = useAppDispatch();
  const allTestSuites = useAppSelector(selectAllTestSuites);
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

  // Get mapped test suites using the current state from Redux
  const mappedTestSuites = allTestSuites.filter(suite => 
    currentTestPlan.testSuiteIds.includes(suite.id)
  );
  
  // Get available test suites (not mapped and matching search)
  const availableTestSuites = allTestSuites.filter(suite => 
    !currentTestPlan.testSuiteIds.includes(suite.id) &&
    (suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     suite.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddTestSuite = (testSuiteId: string) => {
    const updatedTestSuiteIds = [...currentTestPlan.testSuiteIds, testSuiteId];
    dispatch(updateTestPlan({ 
      id: currentTestPlan.id, 
      updates: { testSuiteIds: updatedTestSuiteIds } 
    }));
  };

  const handleRemoveTestSuite = (testSuiteId: string) => {
    const updatedTestSuiteIds = currentTestPlan.testSuiteIds.filter(id => id !== testSuiteId);
    dispatch(updateTestPlan({ 
      id: currentTestPlan.id, 
      updates: { testSuiteIds: updatedTestSuiteIds } 
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Test Suites - {currentTestPlan.name}</DialogTitle>
          <DialogDescription>
            Map and unmap test suites for this test plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mapped Test Suites */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Mapped Test Suites ({mappedTestSuites.length})</h3>
            {mappedTestSuites.length > 0 ? (
              <div className="space-y-2">
                {mappedTestSuites.map((suite) => (
                  <div key={suite.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{suite.name}</div>
                      <div className="text-sm text-muted-foreground">{suite.description}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary">{suite.status}</Badge>
                        <Badge variant="outline">{suite.testCaseIds.length} test cases</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveTestSuite(suite.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No test suites mapped to this plan yet
              </div>
            )}
          </div>

          {/* Search and Add Test Suites */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Available Test Suites</h3>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search test suites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {availableTestSuites.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Test Cases</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableTestSuites.map((suite) => (
                    <TableRow key={suite.id}>
                      <TableCell className="font-medium">{suite.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{suite.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{suite.status}</Badge>
                      </TableCell>
                      <TableCell>{suite.testCaseIds.length}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTestSuite(suite.id)}
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
                {searchTerm ? "No test suites found matching your search" : "No additional test suites available"}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
