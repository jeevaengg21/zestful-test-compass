
import { 
  BarChart3, 
  FileText, 
  Play, 
  FolderOpen, 
  PieChart,
  TestTube,
  Users,
  Layers,
  Calendar
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UserMenu } from "./UserMenu";

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "test-cases", label: "Test Cases", icon: FileText },
    { id: "test-suites", label: "Test Suites", icon: Layers },
    { id: "test-plans", label: "Test Plans", icon: Calendar },
    { id: "test-runs", label: "Test Runs", icon: Play },
    { id: "products", label: "Products", icon: FolderOpen },
    { id: "users", label: "Users", icon: Users },
    { id: "reports", label: "Reports", icon: PieChart },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center space-x-2">
            <TestTube className="h-8 w-8 text-blue-400" />
            <h1 className="text-xl font-bold group-data-[collapsible=icon]:hidden">TestManager</h1>
          </div>
          <div className="flex items-center space-x-2">
            <UserMenu />
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => onViewChange(item.id)}
                  isActive={activeView === item.id}
                  tooltip={item.label}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <div className="p-4">
          <div className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
            Test Management Suite v1.0
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
