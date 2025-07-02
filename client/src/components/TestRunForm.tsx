import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAllUsers, selectAllProducts } from "@/store/selectors";
import { createTestRunAsync, TestRun } from "@/store/slices/testRunSlice";
import { apiRequest } from "@/lib/queryClient";
import { TestPlan, TestSuite } from "@shared/schema";

interface TestRunFormProps {
  onClose: () => void;
}

export function TestRunForm({ onClose }: TestRunFormProps) {
  const dispatch = useAppDispatch();
  const users = useAppSelector(selectAllUsers);
  const products = useAppSelector(selectAllProducts);

  // State for API-fetched data
  const [productTestPlans, setProductTestPlans] = useState<TestPlan[]>([]);
  const [testPlanTestSuites, setTestPlanTestSuites] = useState<TestSuite[]>([]);
  
  // Loading states
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isLoadingSuites, setIsLoadingSuites] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    description: "",
    testPlanId: "",
    testSuiteIds: [] as string[],
    assignedTo: "",
    priority: "Medium" as TestRun['priority'],
    environment: "Testing" as TestRun['environment'],
    startDate: "",
    endDate: "",
    estimatedHours: 0
  });

  // Fetch test plans when product is selected
  useEffect(() => {
    const fetchTestPlansForProduct = async () => {
      if (!formData.productId) {
        setProductTestPlans([]);
        return;
      }

      try {
        setIsLoadingPlans(true);
        // Fetch test plans for the selected product from API
        const response = await apiRequest(`/api/test-plans?productId=${formData.productId}`);
        setProductTestPlans(response);
        console.log(`Loaded ${response.length} test plans for product ${formData.productId}`);
      } catch (error) {
        console.error("Failed to fetch test plans for product:", error);
        setProductTestPlans([]);
      } finally {
        setIsLoadingPlans(false);
      }
    };

    fetchTestPlansForProduct();
  }, [formData.productId]);

  // Fetch test suites when test plan is selected
  useEffect(() => {
    const fetchTestSuitesForTestPlan = async () => {
      if (!formData.testPlanId) {
        setTestPlanTestSuites([]);
        return;
      }

      try {
        setIsLoadingSuites(true);
        // Fetch test suites for the selected test plan from API
        const response = await apiRequest(`/api/test-plans/${formData.testPlanId}/test-suites`);
        setTestPlanTestSuites(response);
        console.log(`Loaded ${response.length} test suites for test plan ${formData.testPlanId}`);
      } catch (error) {
        console.error("Failed to fetch test suites for test plan:", error);
        setTestPlanTestSuites([]);
      } finally {
        setIsLoadingSuites(false);
      }
    };

    fetchTestSuitesForTestPlan();
  }, [formData.testPlanId]);

  // When product changes, reset test plan and test suite selections
  const handleProductChange = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      productId,
      testPlanId: "",
      testSuiteIds: []
    }));
  };

  // When test plan changes, reset test suite selections
  const handleTestPlanChange = (testPlanId: string) => {
    setFormData(prev => ({
      ...prev,
      testPlanId,
      testSuiteIds: []
    }));
  };

  const selectedTestPlan = productTestPlans.find(plan => plan.id === formData.testPlanId);

  const handleTestSuiteChange = (suiteId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        testSuiteIds: [...prev.testSuiteIds, suiteId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        testSuiteIds: prev.testSuiteIds.filter(id => id !== suiteId)
      }));
    }
  };

  const calculateTotalTestCases = () => {
    return formData.testSuiteIds.reduce((total, suiteId) => {
      const suite = testPlanTestSuites.find(s => s.id === suiteId);
      return total + (suite?.testCaseIds?.length || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalTestCases = calculateTotalTestCases();
    
    const testRunData = {
      ...formData,
      status: "Not Started" as const,
      progress: 0,
      totalTestCases,
      executedTestCases: 0,
      passedTestCases: 0,
      failedTestCases: 0,
      blockedTestCases: 0,
      skippedTestCases: 0,
      // Use the current user from Auth context when available
      createdBy: "USR001" 
    };

    try {
      // Use the async thunk to persist to database
      await dispatch(createTestRunAsync(testRunData)).unwrap();
      console.log("Test run created successfully");
      onClose();
    } catch (error) {
      console.error("Failed to create test run:", error);
      // Add error handling/notification here
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Test Run Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the test run"
            />
          </div>

          <div>
            <Label htmlFor="productId">Product *</Label>
            <Select 
              value={formData.productId} 
              onValueChange={handleProductChange}
            >
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

          <div>
            <Label htmlFor="testPlanId">Test Plan *</Label>
            <Select 
              value={formData.testPlanId} 
              onValueChange={handleTestPlanChange}
              disabled={!formData.productId || isLoadingPlans}
            >
              <SelectTrigger>
                {isLoadingPlans ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Loading plans...</span>
                  </div>
                ) : (
                  <SelectValue placeholder={formData.productId ? "Select test plan" : "Select a product first"} />
                )}
              </SelectTrigger>
              <SelectContent>
                {productTestPlans.length > 0 ? (
                  productTestPlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-plans" disabled>
                    {formData.productId ? "No test plans found for this product" : "Select a product first"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assignedTo">Assigned To *</Label>
            <Select 
              value={formData.assignedTo} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TestRun['priority'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="environment">Environment</Label>
              <Select 
                value={formData.environment} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value as TestRun['environment'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Testing">Testing</SelectItem>
                  <SelectItem value="Staging">Staging</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>
      </div>

      {/* Test Suite Selection */}
      {selectedTestPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Test Suites</CardTitle>
            <CardDescription>
              Choose which test suites from the selected test plan to include in this run
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoadingSuites ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 mr-2 animate-spin text-blue-500" />
                <span>Loading test suites...</span>
              </div>
            ) : testPlanTestSuites.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No test suites found for this test plan.
              </div>
            ) : (
              testPlanTestSuites.map((suite) => (
                <div key={suite.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={suite.id}
                    checked={formData.testSuiteIds.includes(suite.id)}
                    onCheckedChange={(checked) => handleTestSuiteChange(suite.id, checked as boolean)}
                  />
                  <Label htmlFor={suite.id} className="flex-1">
                    <div>
                      <div className="font-medium">{suite.name}</div>
                      <div className="text-sm text-gray-500">
                        {suite.testCaseIds?.length || 0} test cases
                      </div>
                    </div>
                  </Label>
                </div>
              ))
            )}
            {formData.testSuiteIds.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Total Test Cases: {calculateTotalTestCases()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.testPlanId || !formData.productId}>
          Create Test Run
        </Button>
      </div>
    </form>
  );
}
