
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteTestDataSet } from "@/store/slices/testDataSlice";
import { selectAllTestDataSets, selectAllProducts, selectTestCasesUsingTestDataSet } from "@/store/selectors";
import { TestDataForm } from "./TestDataForm";
import { TestDataViewer } from "./TestDataViewer";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Database,
  Link
} from "lucide-react";

export const TestDataManager = () => {
  const dispatch = useAppDispatch();
  const testDataSets = useAppSelector(selectAllTestDataSets);
  const products = useAppSelector(selectAllProducts);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTestDataSet, setEditingTestDataSet] = useState<string | null>(null);
  const [viewingTestDataSet, setViewingTestDataSet] = useState<string | null>(null);

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  const getUsageCount = (testDataSetId: string) => {
    const testCases = useAppSelector((state) => selectTestCasesUsingTestDataSet(state, testDataSetId));
    return testCases.length;
  };

  const handleDeleteTestDataSet = (id: string) => {
    if (window.confirm("Are you sure you want to delete this test data set? This action cannot be undone.")) {
      dispatch(deleteTestDataSet(id));
    }
  };

  const filteredTestDataSets = testDataSets.filter(set => 
    set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    set.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getProductName(set.productId).toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onSuccess={() => setIsCreateDialogOpen(false)}
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
              onSuccess={() => setEditingTestDataSet(null)}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestDataSets.map((testDataSet) => (
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
                        {testDataSet.items.length} items
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
                    <TableCell>
                      <Badge className={testDataSet.isActive 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                      }>
                        {testDataSet.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {testDataSet.createdBy}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {testDataSet.lastModified}
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredTestDataSets.length === 0 && (
              <div className="p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Test Data Sets Found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search criteria." : "Create your first test data set to get started."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
