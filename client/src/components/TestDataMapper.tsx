import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTestCaseDataMapping, removeTestCaseDataMapping } from "@/store/slices/testDataSlice";
import { selectTestDataSetsForTestCase, selectAllTestDataSets, selectAllTestCaseDataMappings } from "@/store/selectors";
import { 
  Link,
  Unlink,
  Database
} from "lucide-react";

// Add debug logging
const debugLog = (message: string, data?: any) => {
  console.log(`[TestDataMapper Debug] ${message}`, data || '');
};

interface TestDataMapperProps {
  testCaseId: string;
  testCaseTitle: string;
}

export const TestDataMapper = ({ testCaseId, testCaseTitle }: TestDataMapperProps) => {
  debugLog('Component rendering', { testCaseId, testCaseTitle });
  
  const dispatch = useAppDispatch();
  
  // Add try-catch blocks around all useAppSelector calls
  let mappedTestDataSets = [];
  try {
    const sets = useAppSelector((state) => selectTestDataSetsForTestCase(state, testCaseId || ""));
    debugLog('Mapped test data sets loaded', sets);
    mappedTestDataSets = sets;
  } catch (err) {
    debugLog('Error loading mapped test data sets', err);
    mappedTestDataSets = [];
  }
  
  let allTestDataSets = [];
  try {
    const sets = useAppSelector(selectAllTestDataSets);
    debugLog('All test data sets loaded', sets);
    allTestDataSets = sets;
  } catch (err) {
    debugLog('Error loading all test data sets', err);
    allTestDataSets = [];
  }
  
  let allMappings = [];
  try {
    const mappings = useAppSelector(selectAllTestCaseDataMappings);
    debugLog('All mappings loaded', mappings);
    allMappings = mappings;
  } catch (err) {
    debugLog('Error loading all mappings', err);
    allMappings = [];
  }
  
  const [isMapperDialogOpen, setIsMapperDialogOpen] = useState(false);
  const [selectedDataSets, setSelectedDataSets] = useState<string[]>([]);

  // Don't render anything if testCaseId is empty
  if (!testCaseId) {
    debugLog('Not rendering - no testCaseId provided');
    return (
      <div className="text-center text-gray-500 py-8">
        No test case selected
      </div>
    );
  }

  const handleOpenMapper = () => {
    // Pre-select currently mapped data sets
    try {
      const currentMappings = mappedTestDataSets.map(set => set.id);
      setSelectedDataSets(currentMappings);
      setIsMapperDialogOpen(true);
      debugLog('Mapper dialog opened', { currentMappings });
    } catch (err) {
      debugLog('Error opening mapper dialog', err);
    }
  };

  const handleToggleDataSet = (dataSetId: string) => {
    try {
      setSelectedDataSets(prev => 
        prev.includes(dataSetId) 
          ? prev.filter(id => id !== dataSetId)
          : [...prev, dataSetId]
      );
      debugLog('Toggled data set', { dataSetId, newSelections: selectedDataSets });
    } catch (err) {
      debugLog('Error toggling data set', err);
    }
  };

  const handleSaveMappings = () => {
    try {
      debugLog('Saving mappings', { selectedDataSets });
      const currentMappings = mappedTestDataSets.map(set => set.id);
      
      // Remove mappings that are no longer selected
      currentMappings.forEach(dataSetId => {
        if (!selectedDataSets.includes(dataSetId)) {
          const mapping = allMappings.find(m => m.testCaseId === testCaseId && m.testDataSetId === dataSetId);
          if (mapping) {
            dispatch(removeTestCaseDataMapping(mapping.id));
          }
        }
      });

      // Add new mappings
      selectedDataSets.forEach(dataSetId => {
        if (!currentMappings.includes(dataSetId)) {
          dispatch(addTestCaseDataMapping({
            testCaseId,
            testDataSetId: dataSetId,
            isDefault: selectedDataSets.length === 1 // Make it default if it's the only one
          }));
        }
      });

      setIsMapperDialogOpen(false);
    } catch (err) {
      debugLog('Error saving mappings', err);
    }
  };

  const handleUnmapDataSet = (dataSetId: string) => {
    try {
      debugLog('Unmapping data set', { dataSetId });
      const mapping = allMappings.find(m => m.testCaseId === testCaseId && m.testDataSetId === dataSetId);
      if (mapping) {
        dispatch(removeTestCaseDataMapping(mapping.id));
      }
    } catch (err) {
      debugLog('Error unmapping data set', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Test Data</h4>
        <Dialog open={isMapperDialogOpen} onOpenChange={setIsMapperDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" onClick={handleOpenMapper}>
              <Link className="h-4 w-4 mr-2" />
              Map Test Data
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Map Test Data Sets to: {testCaseTitle}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-gray-600">
                Select test data sets that should be available for this test case:
              </p>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Items</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTestDataSets.filter(set => {
                    try {
                      // Add safe check for isActive
                      return set.isActive === undefined || set.isActive === true;
                    } catch (err) {
                      debugLog('Error filtering active test data sets', { set, error: err });
                      return true; // Include by default if we can't determine
                    }
                  }).map((dataSet) => {
                    try {
                      return (
                        <TableRow key={dataSet.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedDataSets.includes(dataSet.id)}
                              onCheckedChange={() => handleToggleDataSet(dataSet.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{dataSet.name}</TableCell>
                          <TableCell className="text-gray-600">{dataSet.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {(() => {
                                // Safely access items count
                                try {
                                  if (Array.isArray(dataSet.data)) return dataSet.data.length;
                                  if (Array.isArray(dataSet.items)) return dataSet.items.length;
                                  return 0;
                                } catch (err) {
                                  debugLog('Error getting items count', { dataSet, error: err });
                                  return 0;
                                }
                              })()} items
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    } catch (err) {
                      debugLog('Error rendering data set row', { dataSet, error: err });
                      return (
                        <TableRow key={dataSet?.id || 'error-row'}>
                          <TableCell colSpan={4} className="text-red-500">
                            Error rendering row. Check console for details.
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })}
                </TableBody>
              </Table>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsMapperDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveMappings}>
                  Save Mappings
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {mappedTestDataSets.length > 0 ? (
        <div className="space-y-2">
          {mappedTestDataSets.map((dataSet) => {
            try {
              return (
                <div key={dataSet.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">{dataSet.name}</div>
                      <div className="text-xs text-gray-500">
                        {(() => {
                          // Safely access items count
                          try {
                            if (Array.isArray(dataSet.data)) return dataSet.data.length;
                            if (Array.isArray(dataSet.items)) return dataSet.items.length;
                            return 0;
                          } catch (err) {
                            debugLog('Error getting items count in mapped list', { dataSet, error: err });
                            return 0;
                          }
                        })()} data items
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnmapDataSet(dataSet.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Unlink className="h-3 w-3" />
                  </Button>
                </div>
              );
            } catch (err) {
              debugLog('Error rendering mapped data set', { dataSet, error: err });
              return (
                <div key={dataSet?.id || 'error-mapped'} className="text-red-500 p-2 border border-red-300 rounded">
                  Error displaying mapped data set. See console for details.
                </div>
              );
            }
          })}
        </div>
      ) : (
        <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
          <p>No test data sets mapped yet</p>
          <p className="text-xs mt-1">Click "Map Test Data" to connect data sets to this test case</p>
        </div>
      )}
    </div>
  );
};
