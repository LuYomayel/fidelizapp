import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import usePWA from "../../hooks/usePWA";

const InstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWA();

  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <Card
      data-install-prompt
      className="fixed bottom-4 left-4 right-4 z-50 p-4 bg-white border-2 border-blue-500 shadow-lg md:left-auto md:right-4 md:max-w-sm"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">📱</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            Instalar Stampia
          </h3>
          <p className="text-xs text-gray-500">
            Accede más rápido desde tu dispositivo
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Ocultar el prompt (se puede mejorar con estado local)
              const element = document.querySelector("[data-install-prompt]");
              if (element) {
                element.remove();
              }
            }}
          >
            Ahora no
          </Button>
          <Button
            size="sm"
            onClick={install}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Instalar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default InstallPrompt;
