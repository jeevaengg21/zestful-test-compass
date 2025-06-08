import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectAllTestPlans, selectAllUsers, selectAllTestSuites, selectAllTestCases } from "@/store/selectors";
import { updateTestRun, TestRun } from "@/store/slices/testRunSlice";

interface TestRunEditFormProps {
  testRun: TestRun;
  onClose: () => void;
}

export function TestRunEditForm({ testRun, onClose }: TestRunEditFormProps) {
  const dispatch = useAppDispatch();
  const testPlans = useAppSelector(selectAllTestPlans);
  const users = useAppSelector(selectAllUsers);
  const testSuites = useAppSelector(selectAllTestSuites);
  const allTestCases = useAppSelector(selectAllTestCases);

  const [formData, setFormData] = useState({
    name: testRun.name,
    description: testRun.description,
    testPlanId: testRun.testPlanId,
    testSuiteIds: [...testRun.testSuiteIds],
    assignedTo: testRun.assignedTo,
    priority: testRun.priority,
    environment: testRun.environment,
    startDate: testRun.startDate,
    endDate: testRun.endDate,
    estimatedHours: testRun.estimatedHours
  });

  const selectedTestPlan = testPlans.find(plan => plan.id === formData.testPlanId);
  
  // Fix: Preserve the order from test plan by mapping over testSuiteIds instead of filtering
  const availableTestSuites = selectedTestPlan 
    ? selectedTestPlan.testSuiteIds.map(suiteId => 
        testSuites.find(suite => suite.id === suiteId)
      ).filter(Boolean)
    : [];

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
      const suite = testSuites.find(s => s.id === suiteId);
      return total + (suite?.testCaseIds.length || 0);
    }, 0);
  };

  const getTestCaseIdsFromSuites = () => {
    let testCaseIds: string[] = [];
    formData.testSuiteIds.forEach(suiteId => {
      const suite = testSuites.find(s => s.id === suiteId);
      if (suite) {
        testCaseIds = [...testCaseIds, ...suite.testCaseIds];
      }
    });
    return testCaseIds;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalTestCases = calculateTotalTestCases();
    
    // Create sorted copies of the arrays to avoid mutating read-only arrays
    const currentSuiteIds = [...formData.testSuiteIds].sort();
    const originalSuiteIds = [...testRun.testSuiteIds].sort();
    
    const testSuitesChanged = JSON.stringify(currentSuiteIds) !== JSON.stringify(originalSuiteIds);
    
    const updates = {
      ...formData,
      totalTestCases,
      // Reset execution counts if test suites changed
      ...(testSuitesChanged && {
        executedTestCases: 0,
        passedTestCases: 0,
        failedTestCases: 0,
        blockedTestCases: 0,
        skippedTestCases: 0,
        progress: 0
      })
    };

    // Get test case IDs if test suites changed
    const testCaseIds = testSuitesChanged ? getTestCaseIdsFromSuites() : undefined;

    dispatch(updateTestRun({ 
      id: testRun.id, 
      updates,
      testCaseIds 
    }));
    onClose();
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
            <Label htmlFor="testPlanId">Test Plan *</Label>
            <Select 
              value={formData.testPlanId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, testPlanId: value, testSuiteIds: [] }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select test plan" />
              </SelectTrigger>
              <SelectContent>
                {testPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
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
            <CardTitle className="text-lg">Manage Test Suites</CardTitle>
            <CardDescription>
              Choose which test suites from the selected test plan to include in this run
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {availableTestSuites.map((suite) => (
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
                      {suite.testCaseIds.length} test cases
                    </div>
                  </div>
                </Label>
              </div>
            ))}
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
        <Button type="submit" disabled={!formData.testPlanId || formData.testSuiteIds.length === 0}>
          Update Test Run
        </Button>
      </div>
    </form>
  );
}
