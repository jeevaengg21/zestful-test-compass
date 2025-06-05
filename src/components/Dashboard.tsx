
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp, Users } from "lucide-react";

export const Dashboard = () => {
  const stats = [
    { title: "Total Test Cases", value: "1,247", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { title: "Active Test Runs", value: "12", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Failed Tests", value: "23", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
    { title: "Test Coverage", value: "89%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const testExecutionData = [
    { name: "Mon", passed: 45, failed: 5, skipped: 2 },
    { name: "Tue", passed: 52, failed: 3, skipped: 1 },
    { name: "Wed", passed: 48, failed: 8, skipped: 3 },
    { name: "Thu", passed: 61, failed: 2, skipped: 1 },
    { name: "Fri", passed: 55, failed: 6, skipped: 2 },
    { name: "Sat", passed: 38, failed: 4, skipped: 3 },
    { name: "Sun", passed: 42, failed: 3, skipped: 2 },
  ];

  const testStatusData = [
    { name: "Passed", value: 756, color: "#10b981" },
    { name: "Failed", value: 89, color: "#ef4444" },
    { name: "Blocked", value: 45, color: "#f59e0b" },
    { name: "Not Run", value: 357, color: "#6b7280" },
  ];

  const recentActivity = [
    { action: "Test Run 'Sprint 23' completed", user: "John Doe", time: "2 hours ago", status: "completed" },
    { action: "New test case created in 'Login Module'", user: "Jane Smith", time: "4 hours ago", status: "created" },
    { action: "Test Run 'Regression Suite' failed", user: "Mike Johnson", time: "6 hours ago", status: "failed" },
    { action: "Project 'Mobile App' settings updated", user: "Sarah Wilson", time: "1 day ago", status: "updated" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Execution Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testExecutionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="passed" stackId="a" fill="#10b981" />
                <Bar dataKey="failed" stackId="a" fill="#ef4444" />
                <Bar dataKey="skipped" stackId="a" fill="#f59e0b" />
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
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                <div className={`p-2 rounded-full ${
                  activity.status === 'completed' ? 'bg-green-100' :
                  activity.status === 'failed' ? 'bg-red-100' :
                  activity.status === 'created' ? 'bg-blue-100' : 'bg-yellow-100'
                }`}>
                  {activity.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {activity.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                  {activity.status === 'created' && <Users className="h-4 w-4 text-blue-600" />}
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
    </div>
  );
};
