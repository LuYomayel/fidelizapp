import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { LogOut, User } from "lucide-react";

interface NavigationProps {
  title?: string;
  showLogout?: boolean;
}

export default function Navigation({
  title,
  showLogout = true,
}: NavigationProps) {
  const { user, userType, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email;
    return "Usuario";
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case "admin":
        return "Administrador";
      case "client":
        return "Cliente";
      default:
        return "";
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {title && (
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            )}
          </div>

          {user && showLogout && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{getUserDisplayName()}</span>
                {userType && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {getUserTypeLabel()}
                  </span>
                )}
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
