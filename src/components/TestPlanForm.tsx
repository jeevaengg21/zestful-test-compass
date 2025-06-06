import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectAllProducts } from "@/store/selectors";
import { TestPlan } from "@/store/slices/testPlanSlice";

interface TestPlanFormProps {
  onSubmit: (testPlan: Omit<TestPlan, 'id' | 'createdDate' | 'lastModified' | 'progress'>) => void;
  onCancel?: () => void;
  initialData?: Partial<TestPlan>;
  isEditing?: boolean;
}

export function TestPlanForm({ onSubmit, onCancel, initialData, isEditing = false }: TestPlanFormProps) {
  const products = useAppSelector(selectAllProducts);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    objectives: initialData?.objectives || [""],
    scope: initialData?.scope || "",
    testSuiteIds: initialData?.testSuiteIds || [],
    assignedTeamMembers: initialData?.assignedTeamMembers || [],
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    status: initialData?.status || "Draft" as TestPlan['status'],
    priority: initialData?.priority || "Medium" as TestPlan['priority'],
    productId: initialData?.productId || "",
    environment: initialData?.environment || "Testing" as TestPlan['environment'],
    testStrategy: initialData?.testStrategy || "",
    entryCriteria: initialData?.entryExitCriteria?.entryCriteria || [""],
    exitCriteria: initialData?.entryExitCriteria?.exitCriteria || [""],
    deliverables: initialData?.deliverables || [""],
    risks: initialData?.risks || [""],
    createdBy: initialData?.createdBy || "USR001", // Should be current user
    estimatedEffort: initialData?.estimatedEffort || 0,
    actualEffort: initialData?.actualEffort || 0
  });

  const addArrayItem = (field: keyof typeof formData, defaultValue = "") => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), defaultValue]
    }));
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: keyof typeof formData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const testPlanData = {
      ...formData,
      entryExitCriteria: {
        entryCriteria: formData.entryCriteria.filter(item => item.trim() !== ""),
        exitCriteria: formData.exitCriteria.filter(item => item.trim() !== "")
      },
      objectives: formData.objectives.filter(item => item.trim() !== ""),
      deliverables: formData.deliverables.filter(item => item.trim() !== ""),
      risks: formData.risks.filter(item => item.trim() !== "")
    };

    onSubmit(testPlanData as Omit<TestPlan, 'id' | 'createdDate' | 'lastModified' | 'progress'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Test Plan Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="productId">Product *</Label>
            <Select value={formData.productId} onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}>
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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TestPlan['priority'] }))}>
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
              <Select value={formData.environment} onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value as TestPlan['environment'] }))}>
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
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="scope">Scope</Label>
            <Textarea
              id="scope"
              value={formData.scope}
              onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
              placeholder="Define what will and won't be tested"
            />
          </div>

          <div>
            <Label htmlFor="testStrategy">Test Strategy</Label>
            <Textarea
              id="testStrategy"
              value={formData.testStrategy}
              onChange={(e) => setFormData(prev => ({ ...prev, testStrategy: e.target.value }))}
              placeholder="Describe the overall testing approach"
            />
          </div>

          <div>
            <Label htmlFor="estimatedEffort">Estimated Effort (hours)</Label>
            <Input
              id="estimatedEffort"
              type="number"
              value={formData.estimatedEffort}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedEffort: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Arrays */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Objectives</CardTitle>
            <CardDescription>Define the key objectives for this test plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.objectives.map((objective, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={objective}
                  onChange={(e) => updateArrayItem('objectives', index, e.target.value)}
                  placeholder="Enter objective"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem('objectives', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('objectives')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Objective
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deliverables</CardTitle>
            <CardDescription>Expected outputs from this test plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.deliverables.map((deliverable, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={deliverable}
                  onChange={(e) => updateArrayItem('deliverables', index, e.target.value)}
                  placeholder="Enter deliverable"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem('deliverables', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('deliverables')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Deliverable
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Entry Criteria</CardTitle>
            <CardDescription>Conditions that must be met before testing begins</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.entryCriteria.map((criteria, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={criteria}
                  onChange={(e) => updateArrayItem('entryCriteria', index, e.target.value)}
                  placeholder="Enter entry criteria"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem('entryCriteria', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('entryCriteria')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry Criteria
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exit Criteria</CardTitle>
            <CardDescription>Conditions that must be met to complete testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.exitCriteria.map((criteria, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={criteria}
                  onChange={(e) => updateArrayItem('exitCriteria', index, e.target.value)}
                  placeholder="Enter exit criteria"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeArrayItem('exitCriteria', index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addArrayItem('exitCriteria')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exit Criteria
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risks</CardTitle>
          <CardDescription>Identify potential risks and mitigation strategies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.risks.map((risk, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={risk}
                onChange={(e) => updateArrayItem('risks', index, e.target.value)}
                placeholder="Enter risk and mitigation"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeArrayItem('risks', index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => addArrayItem('risks')}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Risk
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update Test Plan' : 'Create Test Plan'}
        </Button>
      </div>
    </form>
  );
}
