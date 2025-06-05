
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

export const Reports = () => {
  const testExecutionTrend = [
    { date: "Jan 1", passed: 45, failed: 5, blocked: 2 },
    { date: "Jan 2", passed: 52, failed: 3, blocked: 1 },
    { date: "Jan 3", passed: 48, failed: 8, blocked: 3 },
    { date: "Jan 4", passed: 61, failed: 2, blocked: 1 },
    { date: "Jan 5", passed: 55, failed: 6, blocked: 2 },
    { date: "Jan 6", passed: 38, failed: 4, blocked: 3 },
    { date: "Jan 7", passed: 42, failed: 3, blocked: 2 },
  ];

  const defectTrend = [
    { week: "Week 1", critical: 2, high: 5, medium: 12, low: 8 },
    { week: "Week 2", critical: 1, high: 8, medium: 15, low: 6 },
    { week: "Week 3", critical: 3, high: 4, medium: 18, low: 9 },
    { week: "Week 4", critical: 0, high: 6, medium: 14, low: 11 },
  ];

  const projectCoverage = [
    { name: "E-Commerce", coverage: 89, target: 90 },
    { name: "Mobile App", coverage: 76, target: 85 },
    { name: "API Services", coverage: 92, target: 95 },
    { name: "Payment", coverage: 95, target: 98 },
  ];

  const testStatusDistribution = [
    { name: "Passed", value: 756, color: "#10b981" },
    { name: "Failed", value: 89, color: "#ef4444" },
    { name: "Blocked", value: 45, color: "#f59e0b" },
    { name: "Not Run", value: 357, color: "#6b7280" },
  ];

  const summaryStats = [
    {
      title: "Total Tests Executed",
      value: "2,847",
      change: "+12%",
      trend: "up",
      icon: BarChart3,
      color: "text-blue-600"
    },
    {
      title: "Pass Rate",
      value: "89.2%",
      change: "+2.1%", 
      trend: "up",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      title: "Critical Defects",
      value: "6",
      change: "-50%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-600"
    },
    {
      title: "Avg Test Duration",
      value: "4.2h",
      change: "-0.8h",
      trend: "down", 
      icon: Calendar,
      color: "text-purple-600"
    }
  ];

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
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
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Execution Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Test Execution Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={testExecutionTrend}>
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                <Bar dataKey="critical" stackId="a" fill="#dc2626" />
                <Bar dataKey="high" stackId="a" fill="#ea580c" />
                <Bar dataKey="medium" stackId="a" fill="#d97706" />
                <Bar dataKey="low" stackId="a" fill="#65a30d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Test Coverage by Project */}
        <Card>
          <CardHeader>
            <CardTitle>Test Coverage by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={projectCoverage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Coverage']} />
                <Bar dataKey="coverage" fill="#3b82f6" />
                <Bar dataKey="target" fill="#e5e7eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
