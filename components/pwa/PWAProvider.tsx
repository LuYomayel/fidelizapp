import React from "react";
import InstallPrompt from "./InstallPrompt";
import UpdatePrompt from "./UpdatePrompt";
import OfflineIndicator from "./OfflineIndicator";
import PWADebugPanel from "./PWADebugPanel";

interface PWAProviderProps {
  children: React.ReactNode;
  showInstallPrompt?: boolean;
  showUpdatePrompt?: boolean;
  showOfflineIndicator?: boolean;
  showDebugPanel?: boolean;
}

const PWAProvider: React.FC<PWAProviderProps> = ({
  children,
  showInstallPrompt = true,
  showUpdatePrompt = true,
  showOfflineIndicator = true,
  showDebugPanel = false,
}) => {
  return (
    <>
      {children}

      {/* PWA Components */}
      {showOfflineIndicator && <OfflineIndicator />}
      {showUpdatePrompt && <UpdatePrompt />}
      {showInstallPrompt && <InstallPrompt />}
      {showDebugPanel && <PWADebugPanel />}
    </>
  );
};

export default PWAProvider;
