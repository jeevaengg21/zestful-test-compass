
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  ChevronRight,
  ChevronDown,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

export const TestCases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["login", "checkout"]);

  const folders = [
    { id: "all", name: "All Test Cases", count: 247 },
    { id: "login", name: "User Authentication", count: 45, children: [
      { id: "login-basic", name: "Basic Login", count: 12 },
      { id: "login-social", name: "Social Login", count: 8 },
      { id: "login-security", name: "Security Tests", count: 25 }
    ]},
    { id: "checkout", name: "Checkout Process", count: 67, children: [
      { id: "cart", name: "Shopping Cart", count: 23 },
      { id: "payment", name: "Payment Gateway", count: 34 },
      { id: "confirmation", name: "Order Confirmation", count: 10 }
    ]},
    { id: "api", name: "API Testing", count: 89 },
    { id: "mobile", name: "Mobile App", count: 46 },
  ];

  const testCases = [
    {
      id: "TC001",
      title: "User can login with valid credentials",
      priority: "High",
      status: "Passed",
      lastRun: "2024-01-15",
      assignee: "John Doe",
      folder: "login-basic"
    },
    {
      id: "TC002", 
      title: "User cannot login with invalid password",
      priority: "High",
      status: "Failed",
      lastRun: "2024-01-15",
      assignee: "Jane Smith",
      folder: "login-basic"
    },
    {
      id: "TC003",
      title: "Password reset functionality works correctly",
      priority: "Medium",
      status: "Not Run",
      lastRun: "Never",
      assignee: "Mike Johnson",
      folder: "login-security"
    },
    {
      id: "TC004",
      title: "Add item to cart and verify total",
      priority: "High",
      status: "Passed",
      lastRun: "2024-01-14",
      assignee: "Sarah Wilson",
      folder: "cart"
    },
    {
      id: "TC005",
      title: "Complete checkout with credit card",
      priority: "Critical",
      status: "Blocked",
      lastRun: "2024-01-13",
      assignee: "Tom Brown",
      folder: "payment"
    },
  ];

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Passed": return "bg-green-100 text-green-800";
      case "Failed": return "bg-red-100 text-red-800";
      case "Blocked": return "bg-yellow-100 text-yellow-800";
      case "Not Run": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-blue-100 text-blue-800";
      case "Low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Test Cases</h1>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Test Case
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with folders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Test Suites</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {folders.map((folder) => (
                <div key={folder.id}>
                  <button
                    onClick={() => {
                      setSelectedFolder(folder.id);
                      if (folder.children) toggleFolder(folder.id);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors",
                      selectedFolder === folder.id && "bg-blue-50 text-blue-700"
                    )}
                  >
                    <div className="flex items-center space-x-2">
                      {folder.children && (
                        expandedFolders.includes(folder.id) ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <FileText className="h-4 w-4" />
                      <span className="text-sm font-medium">{folder.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {folder.count}
                    </Badge>
                  </button>
                  
                  {folder.children && expandedFolders.includes(folder.id) && (
                    <div className="ml-6 space-y-1">
                      {folder.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedFolder(child.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 transition-colors",
                            selectedFolder === child.id && "bg-blue-50 text-blue-700"
                          )}
                        >
                          <span className="text-sm">{child.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {child.count}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search and filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search test cases..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test cases table */}
          <Card>
            <CardHeader>
              <CardTitle>Test Cases ({testCases.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testCases.map((testCase) => (
                      <tr key={testCase.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {testCase.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {testCase.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getPriorityColor(testCase.priority)}>
                            {testCase.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(testCase.status)}>
                            {testCase.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {testCase.lastRun}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {testCase.assignee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
