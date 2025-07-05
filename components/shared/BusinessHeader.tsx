import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import {
  LogOut,
  User,
  BarChart3,
  QrCode,
  Users,
  Settings,
  Gift,
  Plus,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function BusinessHeader() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email;
    return "Administrador";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center space-x-8">
            <Link
              href="/admin/dashboard"
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                FirulApp Business
              </span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/generar-codigo"
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Generar Código</span>
              </Link>
              <Link
                href="/admin/clientes"
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Clientes</span>
              </Link>
              <Link
                href="/admin/historial-sellos"
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <Activity className="w-4 h-4" />
                <span>Historial</span>
              </Link>
              <Link
                href="/admin/recompensas"
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
              >
                <Gift className="w-4 h-4" />
                <span>Recompensas</span>
              </Link>
            </nav>
          </div>

          {/* Usuario y acciones */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{getUserDisplayName()}</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Administrador
              </span>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
