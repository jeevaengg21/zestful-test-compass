import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Plus, X, ChevronUp, ChevronDown, Settings } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { TestPlan, updateTestPlan } from "@/store/slices/testPlanSlice";
import { selectAllTestSuites } from "@/store/selectors";
import { TestCaseManagementDialog } from "./TestCaseManagementDialog";

interface TestSuiteManagementDialogProps {
  testPlan: TestPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ITEMS_PER_PAGE = 10;

export function TestSuiteManagementDialog({ testPlan, open, onOpenChange }: TestSuiteManagementDialogProps) {
  const dispatch = useAppDispatch();
  const allTestSuites = useAppSelector(selectAllTestSuites);
  const currentTestPlan = useAppSelector(state => 
    state.testPlans.testPlans.find(plan => plan.id === testPlan.id)
  ) || testPlan;
  const [searchTerm, setSearchTerm] = useState("");
  const [availablePage, setAvailablePage] = useState(1);
  const [mappedPage, setMappedPage] = useState(1);
  const [selectedTestSuite, setSelectedTestSuite] = useState<any>(null);
  const [testCaseDialogOpen, setTestCaseDialogOpen] = useState(false);

  // Reset search and pagination when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setAvailablePage(1);
      setMappedPage(1);
    }
  }, [open]);

  // Get mapped test suites using the current state from Redux
  const mappedTestSuites = allTestSuites.filter(suite => 
    currentTestPlan.testSuiteIds.includes(suite.id)
  ).sort((a, b) => {
    const indexA = currentTestPlan.testSuiteIds.indexOf(a.id);
    const indexB = currentTestPlan.testSuiteIds.indexOf(b.id);
    return indexA - indexB;
  });
  
  // Get available test suites (not mapped and matching search)
  const availableTestSuites = allTestSuites.filter(suite => 
    !currentTestPlan.testSuiteIds.includes(suite.id) &&
    (suite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     suite.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination calculations
  const availableTotalPages = Math.ceil(availableTestSuites.length / ITEMS_PER_PAGE);
  const mappedTotalPages = Math.ceil(mappedTestSuites.length / ITEMS_PER_PAGE);
  
  const paginatedAvailableTestSuites = availableTestSuites.slice(
    (availablePage - 1) * ITEMS_PER_PAGE,
    availablePage * ITEMS_PER_PAGE
  );
  
  const paginatedMappedTestSuites = mappedTestSuites.slice(
    (mappedPage - 1) * ITEMS_PER_PAGE,
    mappedPage * ITEMS_PER_PAGE
  );

  // Reset to first page when search changes
  useEffect(() => {
    setAvailablePage(1);
  }, [searchTerm]);

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

  const handleMoveUp = (testSuiteId: string) => {
    const currentIndex = currentTestPlan.testSuiteIds.indexOf(testSuiteId);
    if (currentIndex > 0) {
      const updatedTestSuiteIds = [...currentTestPlan.testSuiteIds];
      [updatedTestSuiteIds[currentIndex - 1], updatedTestSuiteIds[currentIndex]] = 
      [updatedTestSuiteIds[currentIndex], updatedTestSuiteIds[currentIndex - 1]];
      
      dispatch(updateTestPlan({ 
        id: currentTestPlan.id, 
        updates: { testSuiteIds: updatedTestSuiteIds } 
      }));
    }
  };

  const handleMoveDown = (testSuiteId: string) => {
    const currentIndex = currentTestPlan.testSuiteIds.indexOf(testSuiteId);
    if (currentIndex < currentTestPlan.testSuiteIds.length - 1) {
      const updatedTestSuiteIds = [...currentTestPlan.testSuiteIds];
      [updatedTestSuiteIds[currentIndex], updatedTestSuiteIds[currentIndex + 1]] = 
      [updatedTestSuiteIds[currentIndex + 1], updatedTestSuiteIds[currentIndex]];
      
      dispatch(updateTestPlan({ 
        id: currentTestPlan.id, 
        updates: { testSuiteIds: updatedTestSuiteIds } 
      }));
    }
  };

  const handleManageTestCases = (testSuite: any) => {
    setSelectedTestSuite(testSuite);
    setTestCaseDialogOpen(true);
  };

  const renderPagination = (currentPage: number, totalPages: number, onPageChange: (page: number) => void) => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Test Suites - {currentTestPlan.name}</DialogTitle>
            <DialogDescription>
              Map and unmap test suites for this test plan.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-8">
            {/* Available Test Suites - Left Side */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available Test Suites</h3>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search test suites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>

              {paginatedAvailableTestSuites.length > 0 ? (
                <>
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
                      {paginatedAvailableTestSuites.map((suite) => (
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
                  {renderPagination(availablePage, availableTotalPages, setAvailablePage)}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  {searchTerm ? "No test suites found matching your search" : "No additional test suites available"}
                </div>
              )}
            </div>

            {/* Mapped Test Suites - Right Side */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Mapped Test Suites ({mappedTestSuites.length})</h3>
              {paginatedMappedTestSuites.length > 0 ? (
                <>
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
                      {paginatedMappedTestSuites.map((suite) => {
                        const globalIndex = mappedTestSuites.findIndex(s => s.id === suite.id);
                        return (
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
                              <Badge variant="secondary">{suite.status}</Badge>
                            </TableCell>
                            <TableCell>{suite.testCaseIds.length}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleManageTestCases(suite)}
                                  className="h-8 w-8 p-0"
                                  title="Manage Test Cases"
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMoveUp(suite.id)}
                                  disabled={globalIndex === 0}
                                  className="h-8 w-8 p-0"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMoveDown(suite.id)}
                                  disabled={globalIndex === mappedTestSuites.length - 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveTestSuite(suite.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  {renderPagination(mappedPage, mappedTotalPages, setMappedPage)}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg">
                  No test suites mapped to this plan yet
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedTestSuite && (
        <TestCaseManagementDialog
          testSuite={selectedTestSuite}
          open={testCaseDialogOpen}
          onOpenChange={setTestCaseDialogOpen}
        />
      )}
    </>
  );
}
