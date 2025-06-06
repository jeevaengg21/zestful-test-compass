import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Calendar, Users, FileText, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectAllProducts, selectAllTestSuites, selectAllUsers } from "@/store/selectors";
import { TestPlan } from "@/store/slices/testPlanSlice";

interface TestPlanDetailsProps {
  testPlan: TestPlan;
  onClose: () => void;
}

export function TestPlanDetails({ testPlan, onClose }: TestPlanDetailsProps) {
  const products = useAppSelector(selectAllProducts);
  const testSuites = useAppSelector(selectAllTestSuites);
  const users = useAppSelector(selectAllUsers);
  const testExecutions = useAppSelector(state => state.testPlans.testExecutions);

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || "Unknown Product";
  };

  const getTestSuiteName = (suiteId: string) => {
    const suite = testSuites.find(s => s.id === suiteId);
    return suite?.name || "Unknown Suite";
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.fullName || "Unknown User";
  };

  const getStatusColor = (status: TestPlan['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: TestPlan['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const planExecutions = testExecutions.filter(execution => execution.testPlanId === testPlan.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{testPlan.name}</h2>
          <p className="text-muted-foreground mt-1">{testPlan.description}</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className={getStatusColor(testPlan.status)}>
            {testPlan.status}
          </Badge>
          <Badge variant="secondary" className={getPriorityColor(testPlan.priority)}>
            {testPlan.priority}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testPlan.progress}%</div>
            <Progress value={testPlan.progress} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testPlan.assignedTeamMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Suites</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testPlan.testSuiteIds.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Effort</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testPlan.estimatedEffort}h</div>
            {testPlan.actualEffort && (
              <p className="text-xs text-muted-foreground">
                Actual: {testPlan.actualEffort}h
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="execution">Execution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Product</Label>
                  <p className="text-sm text-muted-foreground">{getProductName(testPlan.productId)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Environment</Label>
                  <p className="text-sm text-muted-foreground">{testPlan.environment}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Test Strategy</Label>
                  <p className="text-sm text-muted-foreground">{testPlan.testStrategy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Scope</Label>
                  <p className="text-sm text-muted-foreground">{testPlan.scope}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entry & Exit Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Entry Criteria</Label>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {testPlan.entryExitCriteria.entryCriteria.map((criteria, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label className="text-sm font-medium">Exit Criteria</Label>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {testPlan.entryExitCriteria.exitCriteria.map((criteria, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {testPlan.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      {deliverable}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {testPlan.risks.map((risk, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      {risk}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="objectives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Plan Objectives</CardTitle>
              <CardDescription>Key goals and objectives for this test plan</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {testPlan.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium flex items-center justify-center mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-sm">{objective}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Test plan schedule and important dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Start Date</Label>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {testPlan.startDate}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {testPlan.endDate}
                  </p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="text-sm text-muted-foreground">{testPlan.createdDate}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Modified</Label>
                  <p className="text-sm text-muted-foreground">{testPlan.lastModified}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created By</Label>
                  <p className="text-sm text-muted-foreground">{getUserName(testPlan.createdBy)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Team Members</CardTitle>
              <CardDescription>Team members responsible for executing this test plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testPlan.assignedTeamMembers.map((userId) => {
                  const user = users.find(u => u.id === userId);
                  return (
                    <div key={userId} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-medium flex items-center justify-center">
                        {user?.fullName.split(' ').map(n => n[0]).join('') || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{user?.fullName || 'Unknown User'}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                        <div className="flex gap-1 mt-1">
                          {user?.roles.map((role) => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Suites</CardTitle>
              <CardDescription>Test suites included in this plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testPlan.testSuiteIds.map((suiteId) => {
                  const suite = testSuites.find(s => s.id === suiteId);
                  return (
                    <div key={suiteId} className="p-3 border rounded-lg">
                      <div className="font-medium">{suite?.name || 'Unknown Suite'}</div>
                      <div className="text-sm text-muted-foreground mt-1">{suite?.description}</div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Test Cases: {suite?.testCaseIds.length || 0}</span>
                        <span>Status: {suite?.status}</span>
                        <span>Owner: {getUserName(suite?.owner || '')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Executions</CardTitle>
              <CardDescription>Track execution status of test suites</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Suite</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Defects Found</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planExecutions.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell>{getTestSuiteName(execution.testSuiteId)}</TableCell>
                      <TableCell>{getUserName(execution.assignedTo)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(execution.scheduledStart).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            to {new Date(execution.scheduledEnd).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          execution.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          execution.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          execution.status === 'Blocked' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {execution.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{execution.defectsFound}</TableCell>
                      <TableCell className="max-w-xs truncate">{execution.notes}</TableCell>
                    </TableRow>
                  ))}
                  {planExecutions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No test executions found for this plan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button>
          Edit Plan
        </Button>
      </div>
    </div>
  );
}
