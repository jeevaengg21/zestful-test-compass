
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  FolderOpen, 
  Users, 
  Calendar, 
  BarChart3,
  Settings,
  CheckCircle,
  Clock
} from "lucide-react";

export const Projects = () => {
  const projects = [
    {
      id: "PROJ001",
      name: "E-Commerce Platform",
      description: "Main e-commerce website testing project including web and mobile interfaces",
      status: "Active",
      testCases: 347,
      testRuns: 12,
      teamMembers: 8,
      coverage: 89,
      lastActivity: "2 hours ago",
      createdDate: "2023-10-15",
      lead: "John Doe"
    },
    {
      id: "PROJ002", 
      name: "Mobile Application",
      description: "iOS and Android mobile app testing for customer-facing features",
      status: "Active",
      testCases: 156,
      testRuns: 6,
      teamMembers: 5,
      coverage: 76,
      lastActivity: "1 day ago",
      createdDate: "2023-11-20",
      lead: "Jane Smith"
    },
    {
      id: "PROJ003",
      name: "Backend Services",
      description: "API testing and microservices integration testing suite",
      status: "On Hold",
      testCases: 234,
      testRuns: 3,
      teamMembers: 4,
      coverage: 92,
      lastActivity: "1 week ago",
      createdDate: "2023-09-10",
      lead: "Mike Johnson"
    },
    {
      id: "PROJ004",
      name: "Payment Gateway",
      description: "Payment processing and financial transaction testing",
      status: "Completed",
      testCases: 89,
      testRuns: 8,
      teamMembers: 3,
      coverage: 95,
      lastActivity: "2 weeks ago",
      createdDate: "2023-08-05",
      lead: "Sarah Wilson"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "On Hold": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 90) return "text-green-600";
    if (coverage >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-green-600">
                  {projects.filter(p => p.status === "Active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-3xl font-bold text-purple-600">
                  {projects.reduce((sum, p) => sum + p.teamMembers, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Coverage</p>
                <p className="text-3xl font-bold text-blue-600">
                  {Math.round(projects.reduce((sum, p) => sum + p.coverage, 0) / projects.length)}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{project.name}</CardTitle>
                  <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{project.testCases}</div>
                  <div className="text-xs text-gray-500">Test Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{project.testRuns}</div>
                  <div className="text-xs text-gray-500">Test Runs</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{project.teamMembers}</div>
                  <div className="text-xs text-gray-500">Team Members</div>
                </div>
              </div>

              {/* Coverage */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Test Coverage</span>
                  <span className={`font-medium ${getCoverageColor(project.coverage)}`}>
                    {project.coverage}%
                  </span>
                </div>
                <Progress value={project.coverage} className="h-2" />
              </div>

              {/* Meta Information */}
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>Lead: {project.lead}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{project.lastActivity}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {project.createdDate}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-3 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span>Create Project</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Manage Teams</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
