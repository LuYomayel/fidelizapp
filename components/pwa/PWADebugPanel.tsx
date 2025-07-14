import React, { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import usePWA from "../../hooks/usePWA";
import { Eye, EyeOff, Download, RefreshCw, Wifi, WifiOff } from "lucide-react";

const PWADebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const {
    isSupported,
    isInstallable,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    install,
    skipWaiting,
  } = usePWA();

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
        >
          <Eye className="w-4 h-4 mr-2" />
          Debug PWA
        </Button>
      </div>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 p-4 bg-white shadow-lg border-2 border-blue-500 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Debug PWA</h3>
        <Button onClick={() => setIsVisible(false)} size="sm" variant="ghost">
          <EyeOff className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span>PWA Soportada:</span>
          <Badge variant={isSupported ? "default" : "destructive"}>
            {isSupported ? "Sí" : "No"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Instalable:</span>
          <Badge variant={isInstallable ? "default" : "secondary"}>
            {isInstallable ? "Sí" : "No"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Instalada:</span>
          <Badge variant={isInstalled ? "default" : "secondary"}>
            {isInstalled ? "Sí" : "No"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Online:</span>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Sí" : "No"}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span>Actualización:</span>
          <Badge variant={isUpdateAvailable ? "default" : "secondary"}>
            {isUpdateAvailable ? "Disponible" : "No"}
          </Badge>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {isInstallable && !isInstalled && (
          <Button
            onClick={install}
            size="sm"
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            <Download className="w-3 h-3 mr-1" />
            Instalar
          </Button>
        )}

        {isUpdateAvailable && (
          <Button
            onClick={skipWaiting}
            size="sm"
            className="w-full bg-green-500 hover:bg-green-600"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Actualizar
          </Button>
        )}

        <Button
          onClick={() => {
            // Simular offline/online para testing
            if (isOnline) {
              window.dispatchEvent(new Event("offline"));
            } else {
              window.dispatchEvent(new Event("online"));
            }
          }}
          size="sm"
          variant="outline"
          className="w-full"
        >
          {isOnline ? (
            <>
              <WifiOff className="w-3 h-3 mr-1" />
              Simular Offline
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3 mr-1" />
              Simular Online
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default PWADebugPanel;
