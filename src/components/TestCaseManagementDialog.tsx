
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TestSuite, updateTestSuite } from "@/store/slices/testSlice";

interface TestCaseManagementDialogProps {
  testSuite: TestSuite;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestCaseManagementDialog({ testSuite, open, onOpenChange }: TestCaseManagementDialogProps) {
  const dispatch = useAppDispatch();
  const allTestCases = useAppSelector(state => state.tests.testCases);
  const currentTestSuite = useAppSelector(state => 
    state.tests.testSuites.find(suite => suite.id === testSuite.id)
  ) || testSuite;
  const [searchTerm, setSearchTerm] = useState("");

  // Reset search when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  // Get mapped test cases using the current state from Redux
  const mappedTestCases = allTestCases.filter(testCase => 
    currentTestSuite.testCaseIds.includes(testCase.id)
  ).sort((a, b) => {
    const indexA = currentTestSuite.testCaseIds.indexOf(a.id);
    const indexB = currentTestSuite.testCaseIds.indexOf(b.id);
    return indexA - indexB;
  });
  
  // Get available test cases (not mapped and matching search)
  const availableTestCases = allTestCases.filter(testCase => 
    !currentTestSuite.testCaseIds.includes(testCase.id) &&
    testCase.productId === currentTestSuite.productId &&
    testCase.moduleId === currentTestSuite.moduleId &&
    (testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     testCase.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddTestCase = (testCaseId: string) => {
    const updatedTestCaseIds = [...currentTestSuite.testCaseIds, testCaseId];
    dispatch(updateTestSuite({ 
      id: currentTestSuite.id, 
      updates: { testCaseIds: updatedTestCaseIds } 
    }));
  };

  const handleRemoveTestCase = (testCaseId: string) => {
    const updatedTestCaseIds = currentTestSuite.testCaseIds.filter(id => id !== testCaseId);
    dispatch(updateTestSuite({ 
      id: currentTestSuite.id, 
      updates: { testCaseIds: updatedTestCaseIds } 
    }));
  };

  const handleMoveUp = (testCaseId: string) => {
    const currentIndex = currentTestSuite.testCaseIds.indexOf(testCaseId);
    if (currentIndex > 0) {
      const updatedTestCaseIds = [...currentTestSuite.testCaseIds];
      [updatedTestCaseIds[currentIndex - 1], updatedTestCaseIds[currentIndex]] = 
      [updatedTestCaseIds[currentIndex], updatedTestCaseIds[currentIndex - 1]];
      
      dispatch(updateTestSuite({ 
        id: currentTestSuite.id, 
        updates: { testCaseIds: updatedTestCaseIds } 
      }));
    }
  };

  const handleMoveDown = (testCaseId: string) => {
    const currentIndex = currentTestSuite.testCaseIds.indexOf(testCaseId);
    if (currentIndex < currentTestSuite.testCaseIds.length - 1) {
      const updatedTestCaseIds = [...currentTestSuite.testCaseIds];
      [updatedTestCaseIds[currentIndex], updatedTestCaseIds[currentIndex + 1]] = 
      [updatedTestCaseIds[currentIndex + 1], updatedTestCaseIds[currentIndex]];
      
      dispatch(updateTestSuite({ 
        id: currentTestSuite.id, 
        updates: { testCaseIds: updatedTestCaseIds } 
      }));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'blocked': return 'bg-gray-100 text-gray-800';
      case 'not run': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Test Cases - {currentTestSuite.name}</DialogTitle>
          <DialogDescription>
            Map and unmap test cases for this test suite.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-8">
          {/* Available Test Cases - Left Side */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Available Test Cases</h3>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search test cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            {availableTestCases.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableTestCases.map((testCase) => (
                      <TableRow key={testCase.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{testCase.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {testCase.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getPriorityColor(testCase.priority)}>
                            {testCase.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(testCase.status)}>
                            {testCase.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddTestCase(testCase.id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                {searchTerm ? "No test cases found matching your search" : "No additional test cases available"}
              </div>
            )}
          </div>

          {/* Mapped Test Cases - Right Side */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mapped Test Cases ({mappedTestCases.length})</h3>
            {mappedTestCases.length > 0 ? (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappedTestCases.map((testCase, index) => (
                      <TableRow key={testCase.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{testCase.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {testCase.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getPriorityColor(testCase.priority)}>
                            {testCase.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(testCase.status)}>
                            {testCase.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveUp(testCase.id)}
                              disabled={index === 0}
                              className="h-8 w-8 p-0"
                              title="Move up"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveDown(testCase.id)}
                              disabled={index === mappedTestCases.length - 1}
                              className="h-8 w-8 p-0"
                              title="Move down"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveTestCase(testCase.id)}
                              className="h-8 w-8 p-0"
                              title="Remove"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border rounded-lg">
                No test cases mapped to this suite yet
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
