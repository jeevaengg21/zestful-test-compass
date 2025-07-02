import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTestDataItem, updateTestDataItem, deleteTestDataItem } from "@/store/slices/testDataSlice";
import { selectTestDataSetById, selectTestCasesUsingTestDataSet, selectAllProducts } from "@/store/selectors";
import { 
  Plus, 
  Edit, 
  Trash2,
  Copy,
  Eye,
  EyeOff
} from "lucide-react";

// Define the TestDataItem interface locally
interface TestDataItem {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'password';
  description?: string;
}

// Define TestDataSet interface to match the structure from the error messages
interface TestDataSet {
  id: string;
  name: string;
  description?: string;
  productId: string;
  createdBy: string;
  lastModified?: string | number | Date;
  isActive: boolean;
  items?: TestDataItem[];
  data?: TestDataItem[];
}

interface TestDataViewerProps {
  testDataSetId: string;
  onEdit: () => void;
  onClose: () => void;
}

export const TestDataViewer = ({ testDataSetId, onEdit, onClose }: TestDataViewerProps) => {
  const dispatch = useAppDispatch();
  const testDataSet = useAppSelector((state) => selectTestDataSetById(state, testDataSetId)) as TestDataSet | undefined;
  const testCasesUsing = useAppSelector((state) => selectTestCasesUsingTestDataSet(state, testDataSetId));
  const products = useAppSelector(selectAllProducts);

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TestDataItem | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [newItem, setNewItem] = useState({
    key: "",
    value: "",
    type: "string" as TestDataItem['type'],
    description: ""
  });

  // Safely access test data items regardless of whether they're in 'items' or 'data' property
  const testDataItems = useMemo(() => {
    if (!testDataSet) return [];
    if (Array.isArray(testDataSet.data)) return testDataSet.data;
    if (Array.isArray(testDataSet.items)) return testDataSet.items;
    return [];
  }, [testDataSet]);
  
  if (!testDataSet) {
    return <div>Test data set not found</div>;
  }

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  const handleAddItem = () => {
    if (newItem.key && newItem.value) {
      dispatch(addTestDataItem({
        testDataSetId,
        item: {
          key: newItem.key,
          value: newItem.value,
          type: newItem.type,
          description: newItem.description
        }
      }));
      setNewItem({ key: "", value: "", type: "string", description: "" });
      setIsAddItemDialogOpen(false);
    }
  };

  const handleUpdateItem = () => {
    if (editingItem) {
      dispatch(updateTestDataItem({
        testDataSetId,
        itemId: editingItem.id,
        updates: editingItem
      }));
      setEditingItem(null);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm("Are you sure you want to delete this test data item?")) {
      dispatch(deleteTestDataItem({ testDataSetId, itemId }));
    }
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const togglePasswordVisibility = (itemId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const renderValue = (item: TestDataItem) => {
    if (item.type === 'password') {
      const isVisible = showPasswords[item.id];
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono">
            {isVisible ? item.value : '•'.repeat(item.value.length)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePasswordVisibility(item.id)}
          >
            {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        </div>
      );
    }
    return <span className="font-mono">{item.value}</span>;
  };

  return (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
      {/* Test Data Set Info */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{testDataSet.name}</h3>
            <p className="text-gray-600">{testDataSet.description}</p>
          </div>
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Product:</span> {getProductName(testDataSet.productId)}
          </div>
          <div>
            <span className="font-medium">Status:</span>{" "}
            <Badge className={testDataSet.isActive 
              ? "bg-green-100 text-green-800" 
              : "bg-gray-100 text-gray-800"
            }>
              {testDataSet.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Created by:</span> {testDataSet.createdBy}
          </div>
          <div>
            <span className="font-medium">Last modified:</span> {testDataSet.lastModified ? new Date(testDataSet.lastModified).toLocaleString() : 'N/A'}
          </div>
        </div>

        {testCasesUsing.length > 0 && (
          <div>
            <span className="font-medium">Used by test cases:</span>
            <div className="mt-2 flex flex-wrap gap-1">
              {testCasesUsing.map(testCase => (
                <Badge key={testCase.id} variant="outline">
                  {testCase.id}: {testCase.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Test Data Items */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-semibold">Test Data Items ({testDataItems.length})</h4>
          <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Test Data Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Key</Label>
                  <Input
                    value={newItem.key}
                    onChange={(e) => setNewItem(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="e.g., username, password, email"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Value</Label>
                  <Input
                    value={newItem.value}
                    onChange={(e) => setNewItem(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Enter the test data value"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={newItem.type} onValueChange={(value: TestDataItem['type']) => 
                    setNewItem(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="password">Password</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Description (Optional)</Label>
                  <Input
                    value={newItem.description}
                    onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this test data item"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddItemDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddItem}>
                    Add Item
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Item Dialog */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Test Data Item</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Key</Label>
                  <Input
                    value={editingItem.key}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, key: e.target.value } : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Value</Label>
                  <Input
                    value={editingItem.value}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, value: e.target.value } : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={editingItem.type} onValueChange={(value: TestDataItem['type']) => 
                    setEditingItem(prev => prev ? { ...prev, type: value } : null)
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="url">URL</SelectItem>
                      <SelectItem value="password">Password</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Input
                    value={editingItem.description || ""}
                    onChange={(e) => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingItem(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateItem}>
                    Update Item
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testDataItems.map((item: TestDataItem) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.key}</TableCell>
                <TableCell>{renderValue(item)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.type}</Badge>
                </TableCell>
                <TableCell className="text-gray-600">{item.description}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.value)}
                      title="Copy value"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingItem(item)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {testDataItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No test data items yet. Click "Add Item" to get started.
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};