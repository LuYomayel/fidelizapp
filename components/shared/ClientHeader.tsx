import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { LogOut, User, CreditCard, QrCode, Home, Gift } from "lucide-react";
import Link from "next/link";

export default function ClientHeader() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email;
    return "Cliente";
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y navegación principal */}
          <div className="flex items-center space-x-8">
            <Link
              href="/cliente/mi-tarjeta"
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Stampia</span>
            </Link>

            <nav className="hidden md:flex space-x-6">
              <Link
                href="/cliente/mi-tarjeta"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>Mi Tarjeta</span>
              </Link>
              <Link
                href="/cliente/canjear-codigo"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Canjear Código</span>
              </Link>
              <Link
                href="/cliente/recompensas"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
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
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                Cliente
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
