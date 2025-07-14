import React from "react";
import { Download, Smartphone, Zap, Shield } from "lucide-react";
import { Card } from "../ui/card";
import usePWA from "../../hooks/usePWA";

const PWAInfoCard: React.FC = () => {
  const { isInstallable, isInstalled, isSupported } = usePWA();

  if (!isSupported) {
    return null; // No mostrar si PWA no es soportada
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 p-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2">
          FidelizApp como App Nativa
        </h3>

        <p className="text-gray-600 text-sm mb-4">
          Instala FidelizApp en tu dispositivo para una experiencia más rápida y
          accesible
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-700">Más rápida</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-gray-700">Más segura</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Smartphone className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700">Acceso directo</span>
          </div>
        </div>

        {isInstalled ? (
          <div className="bg-green-100 border border-green-200 rounded-lg p-3">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">✓ App instalada</span>
            </div>
          </div>
        ) : isInstallable ? (
          <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-700 text-sm mb-2">
              Disponible para instalar
            </p>
            <button
              onClick={() => {
                // El botón de instalación se maneja desde el componente padre
                // Este es solo informativo
              }}
              className="text-blue-600 text-xs underline hover:text-blue-800"
            >
              Ver botón de instalación arriba
            </button>
          </div>
        ) : (
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
            <p className="text-gray-600 text-sm">
              Usa Chrome, Edge o Safari para instalar
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PWAInfoCard;
