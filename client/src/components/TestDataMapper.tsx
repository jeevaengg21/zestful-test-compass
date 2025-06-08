
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

interface TestDataMapperProps {
  testCaseId: string;
  testCaseTitle: string;
}

export const TestDataMapper = ({ testCaseId, testCaseTitle }: TestDataMapperProps) => {
  const dispatch = useAppDispatch();
  const mappedTestDataSets = useAppSelector((state) => selectTestDataSetsForTestCase(state, testCaseId || ""));
  const allTestDataSets = useAppSelector(selectAllTestDataSets);
  const allMappings = useAppSelector(selectAllTestCaseDataMappings);
  
  const [isMapperDialogOpen, setIsMapperDialogOpen] = useState(false);
  const [selectedDataSets, setSelectedDataSets] = useState<string[]>([]);

  // Don't render anything if testCaseId is empty
  if (!testCaseId) {
    return (
      <div className="text-center text-gray-500 py-8">
        No test case selected
      </div>
    );
  }

  const handleOpenMapper = () => {
    // Pre-select currently mapped data sets
    const currentMappings = mappedTestDataSets.map(set => set.id);
    setSelectedDataSets(currentMappings);
    setIsMapperDialogOpen(true);
  };

  const handleToggleDataSet = (dataSetId: string) => {
    setSelectedDataSets(prev => 
      prev.includes(dataSetId) 
        ? prev.filter(id => id !== dataSetId)
        : [...prev, dataSetId]
    );
  };

  const handleSaveMappings = () => {
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
  };

  const handleUnmapDataSet = (dataSetId: string) => {
    const mapping = allMappings.find(m => m.testCaseId === testCaseId && m.testDataSetId === dataSetId);
    if (mapping) {
      dispatch(removeTestCaseDataMapping(mapping.id));
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
                  {allTestDataSets.filter(set => set.isActive).map((dataSet) => (
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
                          {dataSet.items.length} items
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
          {mappedTestDataSets.map((dataSet) => (
            <div key={dataSet.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">{dataSet.name}</div>
                  <div className="text-xs text-gray-500">
                    {dataSet.items.length} data items
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
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
          <Database className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No test data mapped to this test case</p>
          <p className="text-xs">Click "Map Test Data" to add test data sets</p>
        </div>
      )}
    </div>
  );
};
