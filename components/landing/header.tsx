import { Button } from "@/components/ui/button";
import { Heart, Users, Smartphone, Download } from "lucide-react";
import Link from "next/link";
import usePWA from "@/hooks/usePWA";

export default function LandingHeader() {
  const { isInstallable, isInstalled, install } = usePWA();

  return (
    <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Link href="/">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
        </Link>
        <Link href="/">
          <span className="text-2xl font-bold text-gray-900">Stampia</span>
        </Link>
      </div>

      <div className="flex items-center space-x-3">
        {/* Botón de instalación PWA */}
        {isInstallable && !isInstalled && (
          <Button
            onClick={install}
            size="sm"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Instalar App</span>
            <span className="sm:hidden">Instalar</span>
          </Button>
        )}

        {/* Indicador de app instalada */}
        {isInstalled && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="hidden sm:inline">App Instalada</span>
            <span className="sm:hidden">✓</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center space-x-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
          >
            <Link href="/admin/login">
              <Users className="w-4 h-4 mr-1 text-purple-600" />
              Iniciar sesión Negocio
            </Link>
          </Button>
          <span className="text-gray-400 text-sm hidden sm:block">|</span>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
          >
            <Link href="/cliente/login">
              <Smartphone className="w-4 h-4 sm:mr-1 text-purple-600" />
              Iniciar sesión Cliente
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
