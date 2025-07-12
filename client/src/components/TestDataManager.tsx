import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteTestDataSetAsync, fetchTestDataSets, fetchTestCaseDataMappings } from "@/store/slices/testDataSlice";
import { selectAllTestDataSets, selectAllProducts, selectTestCasesUsingTestDataSet } from "@/store/selectors";
import { TestDataForm } from "./TestDataForm";
import { TestDataViewer } from "./TestDataViewer";
import { useToast } from "@/components/ui/use-toast";
import { useUserData } from "@/hooks/useUserData";
import { Loader2 } from "lucide-react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Database,
  Link
} from "lucide-react";

// Define a debug logging function
const debugLog = (message: string, data?: any) => {
  console.log(`[TestDataManager Debug] ${message}`, data || '');
};

export const TestDataManager = () => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { getUserName } = useUserData(); // Add getUserName from useUserData hook
  
  // Add debug logging for state from redux
  debugLog('Component rendering');
  
  const testDataSets = useAppSelector(selectAllTestDataSets);
  debugLog('testDataSets loaded from store', testDataSets);
  
  const products = useAppSelector(selectAllProducts);
  debugLog('products loaded from store', products);
  
  // Get all test cases using test data sets in one selector call at the component root level
  const allTestCasesUsingDataSets = useAppSelector(state => {
    // Return a map of test data set IDs to the number of test cases using them
    try {
      const result = {};
      testDataSets.forEach(set => {
        const testCases = selectTestCasesUsingTestDataSet(state, set.id);
        result[set.id] = testCases.length;
      });
      return result;
    } catch (err) {
      debugLog('Error building test cases usage map', err);
      return {};
    }
  });
  
  const loading = useAppSelector(state => state.testData.loading);
  const error = useAppSelector(state => state.testData.error);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTestDataSet, setEditingTestDataSet] = useState<string | null>(null);
  const [viewingTestDataSet, setViewingTestDataSet] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch test data sets and mappings when component mounts
  useEffect(() => {
    debugLog('Fetching test data sets and mappings');
    dispatch(fetchTestDataSets());
    dispatch(fetchTestCaseDataMappings());
  }, [dispatch]);

  // Refresh data after successful creation or update
  const handleFormSuccess = () => {
    // Fetch fresh data
    debugLog('Form submission successful, fetching fresh data');
    dispatch(fetchTestDataSets());
    // Close dialogs safely
    setIsCreateDialogOpen(false);
    setEditingTestDataSet(null);
  };

  // Show error toast if there's an API error
  useEffect(() => {
    if (error) {
      debugLog('API Error detected', error);
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    debugLog(`Looking up product name for ID: ${productId}`, product);
    return product ? product.name : "Unknown Product";
  };

  // Fixed getUsageCount function that uses the pre-computed map instead of a hook
  const getUsageCount = (testDataSetId: string) => {
    try {
      const count = allTestCasesUsingDataSets[testDataSetId] || 0;
      debugLog(`Usage count for test data set ${testDataSetId}: ${count}`);
      return count;
    } catch (err) {
      debugLog(`Error getting usage count for ${testDataSetId}:`, err);
      return 0;
    }
  };

  const handleDeleteTestDataSet = async (id: string) => {
    debugLog(`Delete requested for test data set: ${id}`);
    if (window.confirm("Are you sure you want to delete this test data set? This action cannot be undone.")) {
      setDeleteLoading(id);
      try {
        await dispatch(deleteTestDataSetAsync(id)).unwrap();
        toast({
          title: "Test data set deleted",
          description: "The test data set has been deleted successfully.",
        });
      } catch (error) {
        console.error("Error deleting test data set:", error);
        debugLog(`Error deleting test data set ${id}:`, error);
        toast({
          title: "Error",
          description: "Failed to delete test data set. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  // Add try-catch to handle filtering errors
  let filteredTestDataSets = [];
  try {
    filteredTestDataSets = testDataSets.filter(set => 
      set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getProductName(set.productId).toLowerCase().includes(searchTerm.toLowerCase())
    );
    debugLog('Filtered test data sets', { 
      total: testDataSets.length, 
      filtered: filteredTestDataSets.length, 
      searchTerm 
    });
  } catch (err) {
    debugLog('Error filtering test data sets:', err);
    filteredTestDataSets = [];
  }

  // Helper function to safely get the length of data array
  const getDataItemCount = (testDataSet: any) => {
    try {
      if (!testDataSet) return 0;
      if (Array.isArray(testDataSet.data)) return testDataSet.data.length;
      if (Array.isArray(testDataSet.items)) return testDataSet.items.length;
      return 0;
    } catch (err) {
      debugLog(`Error getting item count for test data set:`, { testDataSet, error: err });
      return 0;
    }
  };

  // Add defensive rendering logic
  if (loading) {
    debugLog('Rendering loading state');
  } else if (testDataSets === undefined || testDataSets === null) {
    debugLog('testDataSets is undefined or null');
  } else if (testDataSets.length === 0) {
    debugLog('testDataSets is empty');
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-8 w-8" />
            Test Data Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage test data sets and map them to test cases
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Test Data Set
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Test Data Set</DialogTitle>
            </DialogHeader>
            <TestDataForm
              onSuccess={handleFormSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Test Data Set Dialog */}
      <Dialog open={!!editingTestDataSet} onOpenChange={() => setEditingTestDataSet(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Test Data Set</DialogTitle>
          </DialogHeader>
          {editingTestDataSet && (
            <TestDataForm
              testDataSetId={editingTestDataSet}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingTestDataSet(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Test Data Set Dialog */}
      <Dialog open={!!viewingTestDataSet} onOpenChange={() => setViewingTestDataSet(null)}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Test Data Set Details</DialogTitle>
          </DialogHeader>
          {viewingTestDataSet && (
            <TestDataViewer
              testDataSetId={viewingTestDataSet}
              onEdit={() => {
                setEditingTestDataSet(viewingTestDataSet);
                setViewingTestDataSet(null);
              }}
              onClose={() => setViewingTestDataSet(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search test data sets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Data Sets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Test Data Sets ({filteredTestDataSets.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading test data sets...</span>
              </div>
            ) : (
              <>
                {/* Add error boundary div */}
                <div id="error-debug-info" style={{display: 'none', padding: '10px', backgroundColor: '#ffeeee', color: '#cc0000'}}></div>
                
                {testDataSets && testDataSets.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Usage</TableHead>                        
                        <TableHead>Created By</TableHead>
                        <TableHead>Last Modified</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTestDataSets.map((testDataSet) => {
                        try {
                          debugLog('Rendering test data set row', { id: testDataSet.id, name: testDataSet.name });
                          
                          return (
                            <TableRow key={testDataSet.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium text-blue-600 cursor-pointer"
                                      onClick={() => setViewingTestDataSet(testDataSet.id)}>
                                    {testDataSet.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {testDataSet.description}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-900">
                                {getProductName(testDataSet.productId)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getDataItemCount(testDataSet)} items
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Link className="h-3 w-3" />
                                  <span className="text-sm">
                                    {getUsageCount(testDataSet.id)} test cases
                                  </span>
                                </div>
                              </TableCell>
                             
                              <TableCell className="text-gray-900">
                                {/* Use getUserName function to display user name instead of ID */}
                                {testDataSet.createdBy ? getUserName(testDataSet.createdBy) : 'Unknown'}
                              </TableCell>
                              <TableCell className="text-gray-500">
                                {testDataSet.lastModified ? new Date(testDataSet.lastModified).toLocaleString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setViewingTestDataSet(testDataSet.id)}
                                  >
                                    <Database className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setEditingTestDataSet(testDataSet.id)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => handleDeleteTestDataSet(testDataSet.id)}
                                    className="text-red-600 hover:text-red-800"
                                    disabled={deleteLoading === testDataSet.id}
                                  >
                                    {deleteLoading === testDataSet.id ? (
                                      <Loader2 className="animate-spin h-4 w-4" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        } catch (err) {
                          debugLog(`Error rendering row for test data set:`, { testDataSet, error: err });
                          
                          // Show error in UI for debugging
                          const errorDiv = document.getElementById('error-debug-info');
                          if (errorDiv) {
                            errorDiv.style.display = 'block';
                            errorDiv.textContent = `Error rendering row: ${err}. Data: ${JSON.stringify(testDataSet)}`;
                          }
                          
                          // Return a fallback row
                          return (
                            <TableRow key={testDataSet?.id || 'error-row'}>
                              <TableCell colSpan={8} className="text-red-500">
                                Error rendering this row. See console for details.
                              </TableCell>
                            </TableRow>
                          );
                        }
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-8 text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test Data Sets Found</h3>
                    <p className="text-gray-600">
                      {searchTerm ? "Try adjusting your search criteria." : "Create your first test data set to get started."}
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                      Debug info: {JSON.stringify({
                        testDataSetsLength: testDataSets?.length,
                        filteredLength: filteredTestDataSets?.length,
                        loading
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
