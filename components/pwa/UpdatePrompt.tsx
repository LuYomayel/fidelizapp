import React from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import usePWA from "../../hooks/usePWA";

const UpdatePrompt: React.FC = () => {
  const { isUpdateAvailable, skipWaiting } = usePWA();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <Card
      data-update-prompt
      className="fixed top-4 left-4 right-4 z-50 p-4 bg-green-50 border-2 border-green-500 shadow-lg md:left-auto md:right-4 md:max-w-sm"
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">🔄</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            Actualización disponible
          </h3>
          <p className="text-xs text-gray-500">
            Nueva versión de Stampia disponible
          </p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Ocultar el prompt (se puede mejorar con estado local)
              const element = document.querySelector("[data-update-prompt]");
              if (element) {
                element.remove();
              }
            }}
          >
            Después
          </Button>
          <Button
            size="sm"
            onClick={skipWaiting}
            className="bg-green-500 hover:bg-green-600"
          >
            Actualizar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UpdatePrompt;
