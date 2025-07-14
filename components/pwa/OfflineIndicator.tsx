import React from "react";
import { Card } from "../ui/card";
import usePWA from "../../hooks/usePWA";

const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <Card className="fixed top-4 left-4 right-4 z-50 p-3 bg-yellow-50 border-2 border-yellow-500 shadow-lg md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">⚠️</span>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">Sin conexión</h3>
          <p className="text-xs text-gray-500">
            Algunas funciones pueden no estar disponibles
          </p>
        </div>
      </div>
    </Card>
  );
};

export default OfflineIndicator;
