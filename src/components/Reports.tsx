
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { 
  Download, 
  Calendar, 
  Filter, 
  TrendingUp, 
  TrendingDown,
  FileText,
  BarChart3
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Reports = () => {
  const [reportPeriod, setReportPeriod] = useState<string>("last30days");
  const [reportProduct, setReportProduct] = useState<string>("all");

  const products = useAppSelector(state => state.products.products);
  const modules = useAppSelector(state => state.modules.modules);
  const testCases = useAppSelector(state => state.tests.testCases);
  const testRuns = useAppSelector(state => state.testRuns.testRuns);
  const testCaseExecutions = useAppSelector(state => state.testRuns.testCaseExecutions);
  const defects = useAppSelector(state => state.testRuns.defects);

  // Filter data by selected product if applicable
  const filteredTestCases = reportProduct === "all" 
    ? testCases 
    : testCases.filter(tc => tc.productId === reportProduct);

  const filteredTestRuns = reportProduct === "all"
    ? testRuns
    : testRuns.filter(run => {
        // Get product ID from test suites
        const testSuiteIds = run.testSuiteIds;
        const modules = testSuiteIds.map(suiteId => {
          const suite = testSuites.find(s => s.id === suiteId);
          return suite ? suite.productId : null;
        }).filter(Boolean);
        return modules.includes(reportProduct);
      });

  const filteredExecutions = reportProduct === "all"
    ? testCaseExecutions
    : testCaseExecutions.filter(exec => {
        const testCase = testCases.find(tc => tc.id === exec.testCaseId);
        return testCase && testCase.productId === reportProduct;
      });

  const filteredDefects = reportProduct === "all"
    ? defects
    : defects.filter(d => {
        const execution = testCaseExecutions.find(exec => exec.id === d.testCaseExecutionId);
        if (!execution) return false;
        const testCase = testCases.find(tc => tc.id === execution.testCaseId);
        return testCase && testCase.productId === reportProduct;
      });

  // Aggregate execution data by date
  const generateExecutionTrendData = () => {
    // Determine date range
    const days = reportPeriod === "last7days" ? 7 : 
                 reportPeriod === "last30days" ? 30 : 90;
    
    const result = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Use week name for weekly view
      const dateLabel = days <= 7 
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()]
        : dateStr.slice(5); // Just month-day for longer periods
      
      // Filter executions on this date
      const dayExecutions = filteredExecutions.filter(exec => 
        exec.executedDate && exec.executedDate.startsWith(dateStr)
      );
      
      result.push({
        date: dateLabel,
        passed: dayExecutions.filter(exec => exec.status === "Passed").length,
        failed: dayExecutions.filter(exec => exec.status === "Failed").length,
        blocked: dayExecutions.filter(exec => exec.status === "Blocked").length,
      });
    }
    
    return result;
  };

  // Process defect trends by week
  const generateDefectTrendData = () => {
    // Group defects by week
    const weeks = reportPeriod === "last7days" ? 1 : 
                  reportPeriod === "last30days" ? 4 : 12;
    
    const result = [];
    const today = new Date();
    
    for (let i = weeks - 1; i >= 0; i--) {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() - (i * 7));
      
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      
      const weekLabel = `Week ${weeks - i}`;
      
      // Filter defects reported in this week
      const weekDefects = filteredDefects.filter(defect => {
        const reportDate = new Date(defect.reportedDate);
        return reportDate >= startDate && reportDate <= endDate;
      });
      
      result.push({
        week: weekLabel,
        critical: weekDefects.filter(d => d.severity === "Critical").length,
        high: weekDefects.filter(d => d.severity === "High").length,
        medium: weekDefects.filter(d => d.severity === "Medium").length,
        low: weekDefects.filter(d => d.severity === "Low").length,
      });
    }
    
    return result;
  };

  // Calculate product coverage
  const generateProjectCoverageData = () => {
    return products.map(product => {
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
  };

  // Aggregate test status data
  const testStatusDistribution = [
    { 
      name: "Passed", 
      value: filteredExecutions.filter(exec => exec.status === "Passed").length, 
      color: "#10b981" 
    },
    { 
      name: "Failed", 
      value: filteredExecutions.filter(exec => exec.status === "Failed").length, 
      color: "#ef4444" 
    },
    { 
      name: "Blocked", 
      value: filteredExecutions.filter(exec => exec.status === "Blocked").length, 
      color: "#f59e0b" 
    },
    { 
      name: "Not Run", 
      value: filteredExecutions.filter(exec => exec.status === "Not Run").length || 
             filteredTestCases.length - filteredExecutions.length, 
      color: "#6b7280" 
    },
  ];

  // Calculate summary statistics
  const calculateStats = () => {
    const prevPeriodDays = reportPeriod === "last7days" ? 14 : 
                           reportPeriod === "last30days" ? 60 : 180;
    
    const today = new Date();
    const periodStartDate = new Date(today);
    periodStartDate.setDate(periodStartDate.getDate() - (reportPeriod === "last7days" ? 7 : 
                                                        reportPeriod === "last30days" ? 30 : 90));
    
    const prevPeriodStartDate = new Date(periodStartDate);
    prevPeriodStartDate.setDate(prevPeriodStartDate.getDate() - prevPeriodDays);
    
    // Current period executions
    const currentPeriodExecutions = filteredExecutions.filter(exec => {
      if (!exec.executedDate) return false;
      const execDate = new Date(exec.executedDate);
      return execDate >= periodStartDate && execDate <= today;
    });
    
    // Previous period executions
    const prevPeriodExecutions = filteredExecutions.filter(exec => {
      if (!exec.executedDate) return false;
      const execDate = new Date(exec.executedDate);
      return execDate >= prevPeriodStartDate && execDate < periodStartDate;
    });
    
    // Calculate metrics
    const currentTotalTests = currentPeriodExecutions.length;
    const prevTotalTests = prevPeriodExecutions.length;
    const totalTestsChange = prevTotalTests > 0 
      ? Math.round(((currentTotalTests - prevTotalTests) / prevTotalTests) * 100) 
      : 100;
    
    const currentPassed = currentPeriodExecutions.filter(exec => exec.status === "Passed").length;
    const prevPassed = prevPeriodExecutions.filter(exec => exec.status === "Passed").length;
    const currentPassRate = currentTotalTests > 0 ? (currentPassed / currentTotalTests) * 100 : 0;
    const prevPassRate = prevTotalTests > 0 ? (prevPassed / prevTotalTests) * 100 : 0;
    const passRateChange = prevPassRate > 0 
      ? (currentPassRate - prevPassRate).toFixed(1) 
      : "+0.0";
    
    // Critical defects
    const currentCriticalDefects = filteredDefects.filter(d => 
      d.severity === "Critical" && 
      new Date(d.reportedDate) >= periodStartDate && 
      new Date(d.reportedDate) <= today
    ).length;
    
    const prevCriticalDefects = filteredDefects.filter(d => 
      d.severity === "Critical" && 
      new Date(d.reportedDate) >= prevPeriodStartDate && 
      new Date(d.reportedDate) < periodStartDate
    ).length;
    
    const criticalDefectsChange = prevCriticalDefects > 0 
      ? Math.round(((currentCriticalDefects - prevCriticalDefects) / prevCriticalDefects) * 100) 
      : currentCriticalDefects > 0 ? 100 : 0;
    
    // Average test duration
    const currentExecutionTimes = currentPeriodExecutions
      .map(exec => exec.executionTime || 0)
      .filter(time => time > 0);
    
    const prevExecutionTimes = prevPeriodExecutions
      .map(exec => exec.executionTime || 0)
      .filter(time => time > 0);
    
    const currentAvgTime = currentExecutionTimes.length > 0 
      ? currentExecutionTimes.reduce((sum, time) => sum + time, 0) / currentExecutionTimes.length / 60
      : 0;
    
    const prevAvgTime = prevExecutionTimes.length > 0 
      ? prevExecutionTimes.reduce((sum, time) => sum + time, 0) / prevExecutionTimes.length / 60
      : 0;
    
    const timeChange = prevAvgTime > 0 
      ? (currentAvgTime - prevAvgTime).toFixed(1) 
      : "0.0";
    
    return [
      {
        title: "Total Tests Executed",
        value: currentTotalTests.toLocaleString(),
        change: `${totalTestsChange >= 0 ? '+' : ''}${totalTestsChange}%`,
        trend: totalTestsChange >= 0 ? "up" : "down",
        icon: BarChart3,
        color: "text-blue-600"
      },
      {
        title: "Pass Rate",
        value: `${currentPassRate.toFixed(1)}%`,
        change: `${passRateChange.startsWith('-') ? '' : '+'}${passRateChange}%`, 
        trend: !passRateChange.startsWith('-') ? "up" : "down",
        icon: TrendingUp,
        color: "text-green-600"
      },
      {
        title: "Critical Defects",
        value: currentCriticalDefects.toString(),
        change: `${criticalDefectsChange >= 0 ? '+' : ''}${criticalDefectsChange}%`,
        trend: criticalDefectsChange <= 0 ? "down" : "up", // Inverse for defects (down is good)
        icon: TrendingDown,
        color: "text-red-600"
      },
      {
        title: "Avg Test Duration",
        value: `${currentAvgTime.toFixed(1)}h`,
        change: `${timeChange.startsWith('-') ? '' : '+'}${timeChange}h`,
        trend: !timeChange.startsWith('-') ? "up" : "down", 
        icon: Calendar,
        color: "text-purple-600"
      }
    ];
  };

  // Generate recent reports
  const recentReports = [
    {
      name: "Sprint 23 Test Summary",
      type: "Test Execution Report",
      generatedDate: "2024-01-15",
      status: "Completed"
    },
    {
      name: "Mobile App Quality Report", 
      type: "Quality Metrics Report",
      generatedDate: "2024-01-14",
      status: "Completed"
    },
    {
      name: "API Performance Analysis",
      type: "Performance Report", 
      generatedDate: "2024-01-13",
      status: "Completed"
    }
  ];

  const testSuites = useAppSelector(state => state.tests.testSuites);
  const summaryStats = calculateStats();
  const executionTrend = generateExecutionTrendData();
  const defectTrend = generateDefectTrendData();
  const projectCoverage = generateProjectCoverageData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-3">
          <Select value={reportProduct} onValueChange={setReportProduct}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Product" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {products.map(product => (
                <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="last30days">Last 30 Days</SelectItem>
              <SelectItem value="last90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${
                        (stat.trend === 'up' && stat.title !== 'Critical Defects') || 
                        (stat.trend === 'down' && stat.title === 'Critical Defects') 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tab Navigation for Different Report Types */}
      <Tabs defaultValue="execution" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="execution">Execution Reports</TabsTrigger>
          <TabsTrigger value="defects">Defects Reports</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="execution" className="space-y-6">
          {/* Test Execution Trend */}
          <Card>
            <CardHeader>
              <CardTitle>
                Test Execution Trend ({reportPeriod === "last7days" ? "Last 7 Days" : 
                                      reportPeriod === "last30days" ? "Last 30 Days" : 
                                      "Last 90 Days"})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={executionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="passed" stackId="1" stroke="#10b981" fill="#10b981" />
                  <Area type="monotone" dataKey="failed" stackId="1" stroke="#ef4444" fill="#ef4444" />
                  <Area type="monotone" dataKey="blocked" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Test Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Test Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={testStatusDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {testStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Tests']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Test Execution by Module */}
          <Card>
            <CardHeader>
              <CardTitle>Test Execution by Module</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={modules
                    .filter(module => reportProduct === "all" || module.productId === reportProduct)
                    .map(module => {
                      const moduleTestCases = filteredTestCases.filter(tc => tc.moduleId === module.id);
                      const executions = filteredExecutions.filter(exec => {
                        const testCase = testCases.find(tc => tc.id === exec.testCaseId);
                        return testCase && testCase.moduleId === module.id;
                      });
                      
                      return {
                        name: module.name,
                        passed: executions.filter(e => e.status === "Passed").length,
                        failed: executions.filter(e => e.status === "Failed").length,
                        blocked: executions.filter(e => e.status === "Blocked").length,
                        notRun: moduleTestCases.length - executions.length
                      };
                    })
                    .sort((a, b) => (b.passed + b.failed + b.blocked) - (a.passed + a.failed + a.blocked))
                    .slice(0, 10)} // Top 10 modules by execution count
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="passed" stackId="a" fill="#10b981" name="Passed" />
                  <Bar dataKey="failed" stackId="a" fill="#ef4444" name="Failed" />
                  <Bar dataKey="blocked" stackId="a" fill="#f59e0b" name="Blocked" />
                  <Bar dataKey="notRun" stackId="a" fill="#6b7280" name="Not Run" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defects" className="space-y-6">
          {/* Defect Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Defect Trend by Severity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={defectTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="critical" stackId="a" fill="#dc2626" name="Critical" />
                  <Bar dataKey="high" stackId="a" fill="#ea580c" name="High" />
                  <Bar dataKey="medium" stackId="a" fill="#d97706" name="Medium" />
                  <Bar dataKey="low" stackId="a" fill="#65a30d" name="Low" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Defect Status */}
          <Card>
            <CardHeader>
              <CardTitle>Defect Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Open", value: filteredDefects.filter(d => d.status === "Open").length, color: "#ef4444" },
                      { name: "In Progress", value: filteredDefects.filter(d => d.status === "In Progress").length, color: "#f59e0b" },
                      { name: "Resolved", value: filteredDefects.filter(d => d.status === "Resolved").length, color: "#3b82f6" },
                      { name: "Closed", value: filteredDefects.filter(d => d.status === "Closed").length, color: "#10b981" },
                      { name: "Rejected", value: filteredDefects.filter(d => d.status === "Rejected").length, color: "#6b7280" }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { color: "#ef4444" }, 
                      { color: "#f59e0b" }, 
                      { color: "#3b82f6" }, 
                      { color: "#10b981" },
                      { color: "#6b7280" }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Defects']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Defect Age Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Defect Age Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={[
                    { 
                      name: "< 7 Days", 
                      critical: filteredDefects.filter(d => 
                        d.severity === "Critical" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 7 * 24 * 60 * 60 * 1000
                      ).length,
                      high: filteredDefects.filter(d => 
                        d.severity === "High" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 7 * 24 * 60 * 60 * 1000
                      ).length,
                      medium: filteredDefects.filter(d => 
                        d.severity === "Medium" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 7 * 24 * 60 * 60 * 1000
                      ).length,
                      low: filteredDefects.filter(d => 
                        d.severity === "Low" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 7 * 24 * 60 * 60 * 1000
                      ).length
                    },
                    { 
                      name: "7-14 Days", 
                      critical: filteredDefects.filter(d => 
                        d.severity === "Critical" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 7 * 24 * 60 * 60 * 1000 &&
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 14 * 24 * 60 * 60 * 1000
                      ).length,
                      high: filteredDefects.filter(d => 
                        d.severity === "High" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 7 * 24 * 60 * 60 * 1000 &&
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 14 * 24 * 60 * 60 * 1000
                      ).length,
                      medium: filteredDefects.filter(d => 
                        d.severity === "Medium" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 7 * 24 * 60 * 60 * 1000 &&
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 14 * 24 * 60 * 60 * 1000
                      ).length,
                      low: filteredDefects.filter(d => 
                        d.severity === "Low" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 7 * 24 * 60 * 60 * 1000 &&
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 14 * 24 * 60 * 60 * 1000
                      ).length
                    },
                    { 
                      name: "14-30 Days", 
                      critical: filteredDefects.filter(d => 
                        d.severity === "Critical" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 14 * 24 * 60 * 60 * 1000 &&
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 30 * 24 * 60 * 60 * 1000
                      ).length,
                      high: filteredDefects.filter(d => 
                        d.severity === "High" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 14 * 24 * 60 * 60 * 1000 &&
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 30 * 24 * 60 * 60 * 1000
                      ).length,
                      medium: filteredDefects.filter(d => 
                        d.severity === "Medium" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 14 * 24 * 60 * 60 * 1000 &&
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 30 * 24 * 60 * 60 * 1000
                      ).length,
                      low: filteredDefects.filter(d => 
                        d.severity === "Low" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 14 * 24 * 60 * 60 * 1000 &&
                        new Date().getTime() - new Date(d.reportedDate).getTime() < 30 * 24 * 60 * 60 * 1000
                      ).length
                    },
                    { 
                      name: "> 30 Days", 
                      critical: filteredDefects.filter(d => 
                        d.severity === "Critical" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 30 * 24 * 60 * 60 * 1000
                      ).length,
                      high: filteredDefects.filter(d => 
                        d.severity === "High" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 30 * 24 * 60 * 60 * 1000
                      ).length,
                      medium: filteredDefects.filter(d => 
                        d.severity === "Medium" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 30 * 24 * 60 * 60 * 1000
                      ).length,
                      low: filteredDefects.filter(d => 
                        d.severity === "Low" && 
                        d.status !== "Closed" && 
                        d.status !== "Resolved" && 
                        new Date().getTime() - new Date(d.reportedDate).getTime() >= 30 * 24 * 60 * 60 * 1000
                      ).length
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="critical" name="Critical" fill="#dc2626" />
                  <Bar dataKey="high" name="High" fill="#ea580c" />
                  <Bar dataKey="medium" name="Medium" fill="#d97706" />
                  <Bar dataKey="low" name="Low" fill="#65a30d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-6">
          {/* Test Coverage by Project */}
          <Card>
            <CardHeader>
              <CardTitle>Test Coverage by Product</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectCoverage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Coverage']} />
                  <Legend />
                  <Bar dataKey="coverage" name="Actual" fill="#3b82f6" />
                  <Bar dataKey="target" name="Target" fill="#e5e7eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Module Coverage */}
          <Card>
            <CardHeader>
              <CardTitle>
                Module Coverage {reportProduct !== "all" ? `for ${products.find(p => p.id === reportProduct)?.name}` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart 
                  data={modules
                    .filter(module => reportProduct === "all" || module.productId === reportProduct)
                    .map(module => {
                      const moduleTestCases = testCases.filter(tc => tc.moduleId === module.id);
                      const executedTests = moduleTestCases.filter(tc => tc.lastRun !== "Never");
                      const coverage = moduleTestCases.length > 0 
                        ? Math.round((executedTests.length / moduleTestCases.length) * 100)
                        : 0;
                        
                      return {
                        name: module.name,
                        coverage: coverage,
                        target: 90, // Target coverage
                        tests: moduleTestCases.length
                      };
                    })
                    .sort((a, b) => b.coverage - a.coverage)
                  } 
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'coverage') return [`${value}%`, 'Coverage'];
                      if (name === 'target') return [`${value}%`, 'Target'];
                      if (name === 'tests') return [value, 'Test Cases'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="coverage" name="Coverage" fill="#3b82f6" />
                  <Bar dataKey="target" name="Target" fill="#e5e7eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Test Case Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Test Case Distribution by Priority</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Critical", value: filteredTestCases.filter(tc => tc.priority === "Critical").length, color: "#dc2626" },
                      { name: "High", value: filteredTestCases.filter(tc => tc.priority === "High").length, color: "#ea580c" },
                      { name: "Medium", value: filteredTestCases.filter(tc => tc.priority === "Medium").length, color: "#d97706" },
                      { name: "Low", value: filteredTestCases.filter(tc => tc.priority === "Low").length, color: "#65a30d" }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { color: "#dc2626" }, 
                      { color: "#ea580c" }, 
                      { color: "#d97706" }, 
                      { color: "#65a30d" }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Test Cases']} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Priority Coverage</h3>
                {["Critical", "High", "Medium", "Low"].map(priority => {
                  const testsByPriority = filteredTestCases.filter(tc => tc.priority === priority);
                  const executedTests = testsByPriority.filter(tc => tc.lastRun !== "Never");
                  const coverage = testsByPriority.length > 0
                    ? Math.round((executedTests.length / testsByPriority.length) * 100)
                    : 0;
                  
                  return (
                    <div key={priority} className="space-y-1">
                      <div className="flex justify-between items-center text-sm">
                        <span className={`font-medium ${
                          priority === "Critical" ? "text-red-600" :
                          priority === "High" ? "text-orange-600" :
                          priority === "Medium" ? "text-yellow-600" :
                          "text-green-600"
                        }`}>{priority}</span>
                        <span className="text-gray-600">{coverage}% covered ({executedTests.length}/{testsByPriority.length})</span>
                      </div>
                      <Progress value={coverage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-500">{report.type} • Generated on {report.generatedDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-green-100 text-green-800">
                    {report.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-24 flex flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>Test Execution Report</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span>Quality Metrics Report</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col space-y-2">
              <FileText className="h-6 w-6" />
              <span>Custom Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
