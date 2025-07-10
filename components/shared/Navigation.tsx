import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { LogOut, User, Settings, ChevronDown, QrCode } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useRouter } from "next/router";

interface NavigationProps {
  title?: string;
  showLogout?: boolean;
}

export default function Navigation({
  title,
  showLogout = true,
}: NavigationProps) {
  const { user, userType, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
  };

  const getUserDisplayName = () => {
    if (userType === "client") {
      return user?.username;
    } else {
      return user?.businessName;
    }
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
              <h1 className="text-xl font-semibold text-gray-900 text-ellipsis">
                {title}
              </h1>
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

              {/* Menú desplegable de usuario */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configuración</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {userType === "admin" ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => router.push("/admin/perfil")}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Perfil del Negocio
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push("/admin/qr-negocio")}
                      >
                        <QrCode className="w-4 h-4 mr-2" />
                        Código QR del Negocio
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          router.push("/admin/configuracion-codigos")
                        }
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Configuración de Códigos
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => router.push("/cliente/perfil")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
