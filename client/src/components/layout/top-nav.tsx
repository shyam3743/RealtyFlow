import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { Bell } from "lucide-react";

export default function TopNav() {
  const { user } = useAuth();

  const handleLogout = () => {
    fetch('/api/auth/logout', { method: 'POST' })
      .then(() => {
        window.location.href = "/";
      })
      .catch(() => {
        // Fallback to OAuth logout
        window.location.href = "/api/logout";
      });
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-building text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">RealEstate CRM</h1>
            <p className="text-sm text-gray-500">Sales Management System</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Role Switcher */}
          <Select defaultValue={user?.role || 'sales_team'}>
            <SelectTrigger className="w-40 bg-primary-50 border-primary-200 text-primary-700">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="master">Master</SelectItem>
              <SelectItem value="developer_hq">Developer HQ</SelectItem>
              <SelectItem value="sales_admin">Sales Admin</SelectItem>
              <SelectItem value="sales_executive">Sales Executive</SelectItem>
            </SelectContent>
          </Select>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative p-2">
            <Bell className="h-5 w-5 text-gray-400" />
            <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              5
            </span>
          </Button>

          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback className="bg-primary-100 text-primary-600 text-sm">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="sm"
              className="ml-4"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
