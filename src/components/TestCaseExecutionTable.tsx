
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Play,
  Bug
} from "lucide-react";
import { TestCaseExecution } from "@/store/slices/testRunSlice";
import { useAppSelector } from "@/store/hooks";
import { selectAllTestSuites } from "@/store/selectors";

interface TestCaseExecutionTableProps {
  executions: TestCaseExecution[];
  selectedExecutionIndex: number | null;
  currentPage: number;
  itemsPerPage: number;
  getTestCaseDetails: (testCaseId: string) => any;
  onExecutionClick: (index: number) => void;
  onDefectClick: (index: number) => void;
  onPageChange: (page: number) => void;
  tableRef: React.RefObject<HTMLDivElement>;
}

export function TestCaseExecutionTable({
  executions,
  selectedExecutionIndex,
  currentPage,
  itemsPerPage,
  getTestCaseDetails,
  onExecutionClick,
  onDefectClick,
  onPageChange,
  tableRef
}: TestCaseExecutionTableProps) {
  const allTestSuites = useAppSelector(selectAllTestSuites);
  
  const totalItems = executions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExecutions = executions.slice(startIndex, endIndex);

  const getTestSuiteForTestCase = (testCaseId: string) => {
    return allTestSuites.find(suite => 
      suite.testCaseIds && suite.testCaseIds.includes(testCaseId)
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Passed": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Failed": return <XCircle className="h-4 w-4 text-red-600" />;
      case "Blocked": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "Skipped": return <Clock className="h-4 w-4 text-gray-600" />;
      default: return <Play className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Passed": return "bg-green-100 text-green-800";
      case "Failed": return "bg-red-100 text-red-800";
      case "Blocked": return "bg-yellow-100 text-yellow-800";
      case "Skipped": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const getCurrentExecutionNumber = () => {
    return selectedExecutionIndex !== null ? selectedExecutionIndex + 1 : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Test Case Executions</span>
          <div className="flex items-center gap-4">
            {selectedExecutionIndex !== null && (
              <div className="text-sm text-gray-500">
                Currently executing: Test {getCurrentExecutionNumber()} of {executions.length}
              </div>
            )}
            <span className="text-sm font-normal text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} test cases
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={tableRef}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Case</TableHead>
                <TableHead>Test Suite</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Executed By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedExecutions.map((execution, index) => {
                const globalIndex = startIndex + index;
                const isCurrentExecution = selectedExecutionIndex === globalIndex;
                const testCase = getTestCaseDetails(execution.testCaseId);
                const testSuite = getTestSuiteForTestCase(execution.testCaseId);
                
                return (
                  <TableRow 
                    key={execution.id}
                    className={isCurrentExecution ? "bg-blue-50 border-blue-200 border-2" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isCurrentExecution && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        )}
                        <div>
                          <div className="font-medium">{testCase?.title || "Unknown Test Case"}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {testCase?.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {testSuite ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{testSuite.name}</span>
                          <span className="text-xs text-gray-500">{testSuite.id}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No Suite</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(execution.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(execution.status)}
                          {execution.status}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{testCase?.priority || "Unknown"}</Badge>
                    </TableCell>
                    <TableCell>
                      {execution.executedBy ? "User" : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={isCurrentExecution ? "default" : "outline"}
                          onClick={() => onExecutionClick(index)}
                        >
                          {isCurrentExecution ? "Continue" : "Execute"}
                        </Button>
                        {execution.status === "Failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDefectClick(index)}
                          >
                            <Bug className="h-4 w-4 mr-1" />
                            Log Defect
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => onPageChange(currentPage - 1)}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {generatePageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => onPageChange(page as number)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => onPageChange(currentPage + 1)}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
