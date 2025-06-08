
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Users, FileText, Layers } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Dashboard = () => {
  const [timeFrame, setTimeFrame] = useState<string>("week");
  const [productFilter, setProductFilter] = useState<string>("all");

  const products = useAppSelector(state => state.products.products);
  const modules = useAppSelector(state => state.modules.modules);
  const testCases = useAppSelector(state => state.tests.testCases);
  const testRuns = useAppSelector(state => state.testRuns.testRuns);
  const testCaseExecutions = useAppSelector(state => state.testRuns.testCaseExecutions);
  const defects = useAppSelector(state => state.testRuns.defects);

  // Calculate summary statistics
  const totalTestCases = testCases.length;
  const totalTestRuns = testRuns.length;
  const activeTestRuns = testRuns.filter(run => run.status === "In Progress").length;
  const passedTests = testCaseExecutions.filter(exec => exec.status === "Passed").length;
  const failedTests = testCaseExecutions.filter(exec => exec.status === "Failed").length;
  const blockedTests = testCaseExecutions.filter(exec => exec.status === "Blocked").length;
  const notRunTests = testCaseExecutions.filter(exec => exec.status === "Not Run").length;
  const totalExecutions = passedTests + failedTests + blockedTests + notRunTests;
  const testCoverage = totalTestCases > 0 
    ? Math.round((testCases.filter(tc => tc.lastRun !== "Never").length / totalTestCases) * 100) 
    : 0;
  
  const activeProducts = products.filter(p => p.status === "Active").length;
  const totalModules = modules.length;
  const activeModules = modules.filter(m => m.status === "Active" || m.status === "Testing").length;
  const totalDefects = defects.length;
  const openDefects = defects.filter(d => d.status === "Open" || d.status === "In Progress").length;

  const stats = [
    { title: "Total Test Cases", value: totalTestCases.toString(), icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { title: "Active Test Runs", value: activeTestRuns.toString(), icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Open Defects", value: openDefects.toString(), icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { title: "Test Coverage", value: `${testCoverage}%`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  // Generate execution trend data based on execution dates
  const generateTrendData = () => {
    // Get dates from last 7 days or 30 days based on timeframe
    const days = timeFrame === "week" ? 7 : 30;
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = timeFrame === "week" 
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]
        : dateStr;
      
      // Filter executions that occurred on this date
      const dayExecutions = testCaseExecutions.filter(exec => 
        exec.executedDate && exec.executedDate.startsWith(dateStr)
      );
      
      result.push({
        name: dayName,
        passed: dayExecutions.filter(exec => exec.status === "Passed").length,
        failed: dayExecutions.filter(exec => exec.status === "Failed").length,
        blocked: dayExecutions.filter(exec => exec.status === "Blocked").length,
      });
    }
    
    return result;
  };

  // Format test status distribution data
  const testStatusData = [
    { name: "Passed", value: passedTests, color: "#10b981" },
    { name: "Failed", value: failedTests, color: "#ef4444" },
    { name: "Blocked", value: blockedTests, color: "#f59e0b" },
    { name: "Not Run", value: notRunTests > 0 ? notRunTests : totalTestCases - passedTests - failedTests - blockedTests, color: "#6b7280" },
  ];

  // Format defect severity data
  const defectSeverityData = [
    { name: "Critical", value: defects.filter(d => d.severity === "Critical").length, color: "#dc2626" },
    { name: "High", value: defects.filter(d => d.severity === "High").length, color: "#ea580c" },
    { name: "Medium", value: defects.filter(d => d.severity === "Medium").length, color: "#f59e0b" },
    { name: "Low", value: defects.filter(d => d.severity === "Low").length, color: "#65a30d" },
  ];

  // Generate product coverage data
  const productCoverageData = products.map(product => {
    const productTestCases = testCases.filter(tc => tc.productId === product.id);
    const executedTests = productTestCases.filter(tc => tc.lastRun !== "Never").length;
    const coverage = productTestCases.length > 0 
      ? Math.round((executedTests / productTestCases.length) * 100)
      : 0;
      
    return {
      name: product.name,
      coverage: coverage,
      target: 90 // Target coverage
    };
  });

  // Get recent activities from test runs and defects
  const getRecentActivity = () => {
    const activities = [
      // From test runs
      ...testRuns.map(run => ({
        action: `Test Run '${run.name}' ${run.status === "Completed" ? "completed" : 
          run.status === "In Progress" ? "started" : "updated"}`,
        user: run.assignedTo,
        time: calculateTimeAgo(run.lastModified),
        status: run.status === "Completed" ? "completed" : 
          run.status === "In Progress" ? "started" : "updated"
      })),
      // From defects
      ...defects.map(defect => ({
        action: `Defect '${defect.title}' ${defect.status === "Open" ? "reported" : 
          defect.status === "Resolved" || defect.status === "Closed" ? "resolved" : "updated"}`,
        user: defect.status === "Open" ? defect.reportedBy : defect.assignedTo || defect.reportedBy,
        time: calculateTimeAgo(defect.reportedDate),
        status: defect.status === "Open" ? "failed" : 
          defect.status === "Resolved" || defect.status === "Closed" ? "completed" : "updated"
      }))
    ];
    
    // Sort by recency and take the top 5
    return activities
      .sort((a, b) => getTimestampFromTimeAgo(a.time) - getTimestampFromTimeAgo(b.time))
      .slice(0, 5);
  };

  // Helper function to convert dates to "time ago" format
  const calculateTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hours ago`;
    
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return `on ${date.toLocaleDateString()}`;
  };

  // Helper function to get timestamp for sorting
  const getTimestampFromTimeAgo = (timeAgo: string) => {
    const now = new Date().getTime();
    
    if (timeAgo.includes("minutes")) {
      const mins = parseInt(timeAgo);
      return now - (mins * 60 * 1000);
    } else if (timeAgo.includes("hours")) {
      const hours = parseInt(timeAgo);
      return now - (hours * 60 * 60 * 1000);
    } else if (timeAgo.includes("days")) {
      const days = parseInt(timeAgo);
      return now - (days * 24 * 60 * 60 * 1000);
    } else {
      // If it's "on date" format, return a default old timestamp
      return now - (30 * 24 * 60 * 60 * 1000);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Select value={timeFrame} onValueChange={setTimeFrame}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={productFilter} onValueChange={setProductFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bg}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Project Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Products</span>
                <span className="font-bold">{products.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Active Products</span>
                <span className="font-bold text-green-600">{activeProducts}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Avg. Test Coverage</span>
                <span className="font-bold text-blue-600">{testCoverage}%</span>
              </div>
              <div className="mt-2">
                <Progress value={testCoverage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Modules</span>
                <span className="font-bold">{totalModules}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Active Modules</span>
                <span className="font-bold text-green-600">{activeModules}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Completed Modules</span>
                <span className="font-bold text-blue-600">{modules.filter(m => m.status === "Completed").length}</span>
              </div>
              <div className="mt-2 flex space-x-2">
                {['Active', 'In Development', 'Testing', 'Completed', 'On Hold'].map(status => (
                  <Badge key={status} className={`${
                    status === 'Active' ? 'bg-green-100 text-green-800' :
                    status === 'In Development' ? 'bg-blue-100 text-blue-800' :
                    status === 'Testing' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'Completed' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {modules.filter(m => m.status === status).length} {status}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Defects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total Defects</span>
                <span className="font-bold">{totalDefects}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Open Defects</span>
                <span className="font-bold text-red-600">{openDefects}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Resolved Defects</span>
                <span className="font-bold text-green-600">{defects.filter(d => d.status === "Resolved" || d.status === "Closed").length}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {['Critical', 'High', 'Medium', 'Low'].map(severity => (
                  <Badge key={severity} className={`${
                    severity === 'Critical' ? 'bg-red-100 text-red-800' :
                    severity === 'High' ? 'bg-orange-100 text-orange-800' :
                    severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {defects.filter(d => d.severity === severity).length} {severity}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Execution Trend ({timeFrame === "week" ? "Last 7 Days" : "Last 30 Days"})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generateTrendData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="passed" stackId="a" fill="#10b981" name="Passed" />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
                <Bar dataKey="blocked" stackId="a" fill="#f59e0b" name="Blocked" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={testStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {testStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Test Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productCoverageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(value) => [`${value}%`, 'Coverage']} />
                <Bar dataKey="coverage" fill="#3b82f6" name="Actual" />
                <Bar dataKey="target" fill="#e5e7eb" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Defect Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={defectSeverityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {defectSeverityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getRecentActivity().map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                <div className={`p-2 rounded-full ${
                  activity.status === 'completed' ? 'bg-green-100' :
                  activity.status === 'failed' ? 'bg-red-100' :
                  activity.status === 'started' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  {activity.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {activity.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                  {activity.status === 'started' && <Clock className="h-4 w-4 text-blue-600" />}
                  {activity.status === 'updated' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Test Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Active Test Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testRuns
              .filter(run => run.status === "In Progress")
              .slice(0, 3)
              .map((run, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-900">{run.name}</h3>
                    <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{run.description}</p>
                  <div className="grid grid-cols-3 text-sm mb-2 gap-2">
                    <div>
                      <span className="text-gray-500">Progress:</span> {run.progress}%
                    </div>
                    <div>
                      <span className="text-gray-500">Passed:</span> {run.passedTestCases}/{run.totalTestCases}
                    </div>
                    <div>
                      <span className="text-gray-500">Failed:</span> {run.failedTestCases}
                    </div>
                  </div>
                  <Progress value={run.progress} className="h-2 mb-3" />
                  <div className="flex justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{run.assignedTo}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      <span>{run.testSuiteIds.length} Test Suites</span>
                    </div>
                    <div className="flex items-center">
                      <Layers className="h-3 w-3 mr-1" />
                      <span>{run.totalTestCases} Test Cases</span>
                    </div>
                  </div>
                </div>
              ))}
            
            {testRuns.filter(run => run.status === "In Progress").length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No active test runs at the moment.</p>
              </div>
            )}
            
            {testRuns.filter(run => run.status === "In Progress").length > 3 && (
              <div className="text-center">
                <Button variant="outline">
                  View All Active Test Runs
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
