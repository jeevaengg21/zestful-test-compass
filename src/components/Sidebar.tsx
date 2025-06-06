
import { AppSidebar } from "./AppSidebar";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  return <AppSidebar activeView={activeView} onViewChange={onViewChange} />;
};
