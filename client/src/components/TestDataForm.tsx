import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTestDataSetAsync, updateTestDataSetAsync } from "@/store/slices/testDataSlice";
import { selectAllProducts, selectModulesByProduct, selectTestDataSetById } from "@/store/selectors";
import { useToast } from "@/components/ui/use-toast";

interface TestDataFormProps {
  testDataSetId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TestDataForm = ({ testDataSetId, onSuccess, onCancel }: TestDataFormProps) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const products = useAppSelector(selectAllProducts);
  const existingTestDataSet = testDataSetId ? useAppSelector((state) => selectTestDataSetById(state, testDataSetId)) : null;
  const isMountedRef = useRef(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productId: "",
    moduleId: "",
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const modules = useAppSelector((state) => selectModulesByProduct(state, formData.productId));

  // Set isMounted to false when component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (existingTestDataSet) {
      setFormData({
        name: existingTestDataSet.name,
        description: existingTestDataSet.description,
        productId: existingTestDataSet.productId,
        moduleId: existingTestDataSet.moduleId || "",
        isActive: existingTestDataSet.isActive,
      });
    }
  }, [existingTestDataSet]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (formData.name && formData.productId) {
      setIsSubmitting(true);
      
      try {
        if (testDataSetId) {
          const result = await dispatch(updateTestDataSetAsync({
            id: testDataSetId,
            updates: {
              name: formData.name,
              description: formData.description,
              productId: formData.productId,
              moduleId: formData.moduleId || undefined,
              isActive: formData.isActive
            }
          })).unwrap();
          
          if (isMountedRef.current) {
            toast({
              title: "Test data set updated",
              description: "Your test data set has been updated successfully.",
            });
            
            // Call onSuccess directly - no need for setTimeout
            onSuccess();
          }
        } else {
          const result = await dispatch(addTestDataSetAsync({
            name: formData.name,
            description: formData.description,
            productId: formData.productId,
            moduleId: formData.moduleId || undefined,
            data: [], // Use data property instead of items
            isActive: formData.isActive
          })).unwrap();
          
          if (isMountedRef.current) {
            toast({
              title: "Test data set created",
              description: "Your test data set has been created successfully.",
            });
            
            // Call onSuccess directly - no need for setTimeout
            onSuccess();
          }
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error("Error submitting test data set:", error);
          toast({
            title: "Error",
            description: `Failed to ${testDataSetId ? "update" : "create"} test data set. Please try again.`,
            variant: "destructive",
          });
        }
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    }
  };

  return (
    <div className="space-y-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter test data set name"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Enter test data set description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="product">Product</Label>
          <Select value={formData.productId} onValueChange={(value) => handleInputChange("productId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="module">Module (Optional)</Label>
          <Select value={formData.moduleId} onValueChange={(value) => handleInputChange("moduleId", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id}>
                  {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => handleInputChange("isActive", checked)}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {testDataSetId ? "Update" : "Create"} Test Data Set
        </Button>
      </div>
    </div>
  );
};
