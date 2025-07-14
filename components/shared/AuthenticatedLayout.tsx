import { useAuth } from "../../contexts/AuthContext";
import Navigation from "./Navigation";
import { useRouter } from "next/router";
import { Button } from "../ui/button";
import {
  Home,
  Users,
  Gift,
  BarChart3,
  Settings,
  Ticket,
  CreditCard,
  TrendingUp,
  Menu,
  X,
  Package,
} from "lucide-react";
import { useState } from "react";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AuthenticatedLayout({
  children,
  title,
}: AuthenticatedLayoutProps) {
  const { user, userType, isLoading, isHydrated } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminMenuItems = [
    { name: "Dashboard", icon: Home, href: "/admin/dashboard" },
    { name: "Clientes", icon: Users, href: "/admin/clientes" },
    { name: "Empleados", icon: Users, href: "/admin/empleados" },
    { name: "Recompensas", icon: Gift, href: "/admin/recompensas" },
    { name: "Canjes", icon: Package, href: "/admin/canjes" },
    /* Comentado para MVP - Funcionalidades avanzadas
    { name: "Generar Código", icon: Ticket, href: "/admin/generar-codigo" },
    {
      name: "Código Rápido",
      icon: CreditCard,
      href: "/admin/generar-codigo-rapido",
    },
    { name: "Historial", icon: BarChart3, href: "/admin/historial-sellos" },
    */
  ];

  const clientMenuItems = [
    { name: "Mi Tarjeta", icon: CreditCard, href: "/cliente/mi-tarjeta" },
    { name: "Canjear Código", icon: Ticket, href: "/cliente/canjear-codigo" },
    //{ name: "Recompensas", icon: Gift, href: "/cliente/recompensas" },
  ];

  const menuItems = userType === "admin" ? adminMenuItems : clientMenuItems;

  const isActive = (href: string) => {
    return router.pathname === href;
  };

  // Mostrar loading mientras se hidrata o carga
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario después de la hidratación, mostrar mensaje
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se encontró información de usuario</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-gray-900">
                {userType === "admin" ? "FidelizApp Admin" : "FidelizApp"}
              </h1>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      isActive(item.href)
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-gray-900">
                  {userType === "admin" ? "FidelizApp Admin" : "FidelizApp"}
                </h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.name}
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActive(item.href)
                          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        router.push(item.href);
                        setSidebarOpen(false);
                      }}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>

        <Navigation />

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
