import { useAuth } from "../../contexts/AuthContext";
import ClientHeader from "./ClientHeader";
import BusinessHeader from "./BusinessHeader";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const { userType } = useAuth();

  const renderHeader = () => {
    switch (userType) {
      case "client":
        return <ClientHeader />;
      case "admin":
        return <BusinessHeader />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      <main className="flex-1">{children}</main>
    </div>
  );
}
