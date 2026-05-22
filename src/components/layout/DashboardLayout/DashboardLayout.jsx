import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../Sidebar/Sidebar";
import Navbar from "../Navbar/Navbar";
import Content from "../Content/Content";

const DashboardLayout = ({ children, title, breadcrumbs }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar onToggleSidebar={toggleSidebar} collapsed={sidebarCollapsed} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <Content title={title} breadcrumbs={breadcrumbs}>
            {children}
          </Content>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
