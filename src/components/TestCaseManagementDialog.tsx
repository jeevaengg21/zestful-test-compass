
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

  console.log("TestCaseManagementDialog - OPENED with suite:", currentTestSuite.name, "Dialog open:", open);

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
    console.log("Adding test case:", testCaseId, "Updated IDs:", updatedTestCaseIds);
    dispatch(updateTestSuite({ 
      id: currentTestSuite.id, 
      updates: { testCaseIds: updatedTestCaseIds } 
    }));
  };

  const handleRemoveTestCase = (testCaseId: string) => {
    const updatedTestCaseIds = currentTestSuite.testCaseIds.filter(id => id !== testCaseId);
    console.log("Removing test case:", testCaseId, "Updated IDs:", updatedTestCaseIds);
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
            Add or remove test cases for this test suite using the side-by-side interface below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Test Cases - Left Side */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Available Test Cases</h3>
              <Badge variant="outline">{availableTestCases.length} available</Badge>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search available test cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="border rounded-lg bg-card">
              {availableTestCases.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Title</TableHead>
                      <TableHead className="w-[80px]">Priority</TableHead>
                      <TableHead className="w-[80px]">Status</TableHead>
                      <TableHead className="w-[80px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableTestCases.map((testCase) => (
                      <TableRow key={testCase.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{testCase.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[180px]">
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
                            className="h-8"
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
                  {searchTerm ? "No test cases found matching your search" : "No additional test cases available"}
                </div>
              )}
            </div>
          </div>

          {/* Mapped Test Cases - Right Side */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Mapped Test Cases</h3>
              <Badge variant="outline">{mappedTestCases.length} mapped</Badge>
            </div>
            
            <div className="border rounded-lg bg-card">
              {mappedTestCases.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Title</TableHead>
                      <TableHead className="w-[80px]">Priority</TableHead>
                      <TableHead className="w-[80px]">Status</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappedTestCases.map((testCase, index) => (
                      <TableRow key={testCase.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">{testCase.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[180px]">
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
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No test cases mapped to this suite yet. Add some from the available test cases on the left.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
