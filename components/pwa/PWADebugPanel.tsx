import React, { useState } from "react";
import usePWA from "../../hooks/usePWA";

const PWADebugPanel: React.FC = () => {
  const pwa = usePWA();
  const [isOpen, setIsOpen] = useState(false);

  const environment = process.env.NEXT_PUBLIC_ENV || "production";
  const isDevelopment = environment === "development";

  const handleClearCache = async () => {
    try {
      await pwa.clearCache();
      alert("Cache limpiado exitosamente");
    } catch (error) {
      console.error("Error limpiando cache:", error);
      alert("Error limpiando cache");
    }
  };

  const handleSkipWaiting = () => {
    pwa.skipWaiting();
    alert("Update aplicado. La página se recargará.");
  };

  const handleCheckUpdates = async () => {
    try {
      await pwa.checkForUpdates();
      alert("Verificación de updates completada");
    } catch (error) {
      console.error("Error verificando updates:", error);
      alert("Error verificando updates");
    }
  };

  if (!isDevelopment) {
    return null;
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="PWA Debug Panel"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Panel de debug */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              PWA Debug Panel
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Información del ambiente */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium text-gray-700 mb-2">Environment</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">NEXT_PUBLIC_ENV:</span>{" "}
                <span className="text-blue-600">{environment}</span>
              </div>
              <div>
                <span className="font-medium">NODE_ENV:</span>{" "}
                <span className="text-blue-600">{process.env.NODE_ENV}</span>
              </div>
            </div>
          </div>

          {/* Estado de PWA */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <h4 className="font-medium text-gray-700 mb-2">PWA Status</h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="font-medium">Supported:</span>{" "}
                <span
                  className={
                    pwa.isSupported ? "text-green-600" : "text-red-600"
                  }
                >
                  {pwa.isSupported ? "✅" : "❌"}
                </span>
              </div>
              <div>
                <span className="font-medium">Online:</span>{" "}
                <span
                  className={pwa.isOnline ? "text-green-600" : "text-red-600"}
                >
                  {pwa.isOnline ? "✅" : "❌"}
                </span>
              </div>
              <div>
                <span className="font-medium">Installable:</span>{" "}
                <span
                  className={
                    pwa.isInstallable ? "text-green-600" : "text-gray-600"
                  }
                >
                  {pwa.isInstallable ? "✅" : "❌"}
                </span>
              </div>
              <div>
                <span className="font-medium">Installed:</span>{" "}
                <span
                  className={
                    pwa.isInstalled ? "text-green-600" : "text-gray-600"
                  }
                >
                  {pwa.isInstalled ? "✅" : "❌"}
                </span>
              </div>
              <div>
                <span className="font-medium">Update Available:</span>{" "}
                <span
                  className={
                    pwa.isUpdateAvailable ? "text-yellow-600" : "text-gray-600"
                  }
                >
                  {pwa.isUpdateAvailable ? "🔄" : "❌"}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Actions</h4>

            <button
              onClick={handleClearCache}
              className="w-full bg-red-500 text-white py-2 px-3 rounded text-sm hover:bg-red-600 transition-colors"
            >
              🗑️ Clear Cache
            </button>

            <button
              onClick={handleCheckUpdates}
              className="w-full bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
            >
              🔄 Check Updates
            </button>

            {pwa.isUpdateAvailable && (
              <button
                onClick={handleSkipWaiting}
                className="w-full bg-yellow-500 text-white py-2 px-3 rounded text-sm hover:bg-yellow-600 transition-colors"
              >
                ⚡ Apply Update
              </button>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-500 text-white py-2 px-3 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              🔄 Reload Page
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <p className="text-yellow-800">
              <strong>💡 Tips:</strong>
            </p>
            <ul className="mt-1 text-yellow-700 space-y-1">
              <li>• Cmd+Shift+R para hard refresh</li>
              <li>• DevTools → Application → Storage → Clear storage</li>
              <li>• DevTools → Application → Service Workers → Unregister</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default PWADebugPanel;
