import React from "react";
import InstallPrompt from "./InstallPrompt";
import UpdatePrompt from "./UpdatePrompt";
import OfflineIndicator from "./OfflineIndicator";

interface PWAProviderProps {
  children: React.ReactNode;
  showInstallPrompt?: boolean;
  showUpdatePrompt?: boolean;
  showOfflineIndicator?: boolean;
}

const PWAProvider: React.FC<PWAProviderProps> = ({
  children,
  showInstallPrompt = true,
  showUpdatePrompt = true,
  showOfflineIndicator = true,
}) => {
  return (
    <>
      {children}

      {/* PWA Components */}
      {showOfflineIndicator && <OfflineIndicator />}
      {showUpdatePrompt && <UpdatePrompt />}
      {showInstallPrompt && <InstallPrompt />}
    </>
  );
};

export default PWAProvider;
