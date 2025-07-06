import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import PublicRoute from "../components/shared/PublicRoute";
import { AuthenticatedLayout } from "../components/shared/AuthenticatedLayout";

export default function TestAuthPage() {
  const { tokens, user, userType, isLoading, login, logout } = useAuth();

  const simulateClientLogin = () => {
    login({
      tokens: {
        accessToken: "test-client-token",
        refreshToken: "test-refresh-token",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      user: {
        id: 1,
        email: "cliente@test.com",
        name: "Cliente Test",
      },
      userType: "client",
    });
  };

  const simulateAdminLogin = () => {
    login({
      tokens: {
        accessToken: "test-admin-token",
        refreshToken: "test-refresh-token",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      },
      user: {
        id: 2,
        email: "admin@test.com",
        name: "Admin Test",
      },
      userType: "admin",
    });
  };

  return (
    <PublicRoute>
      <AuthenticatedLayout>
        <div className="p-4">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>🧪 Test de Autenticación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded">
                      <div className="text-sm text-blue-600">Cargando</div>
                      <div className="font-bold">{isLoading ? "Sí" : "No"}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <div className="text-sm text-green-600">Autenticado</div>
                      <div className="font-bold">{tokens ? "Sí" : "No"}</div>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <div className="text-sm text-purple-600">Usuario</div>
                      <div className="font-bold">{user?.email || "N/A"}</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded">
                      <div className="text-sm text-orange-600">Tipo</div>
                      <div className="font-bold">{userType || "N/A"}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={simulateClientLogin} variant="outline">
                      🔑 Login Cliente
                    </Button>
                    <Button onClick={simulateAdminLogin} variant="outline">
                      🔑 Login Admin
                    </Button>
                    <Button onClick={logout} variant="outline">
                      🚪 Logout
                    </Button>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded text-sm">
                    <strong>Instrucciones:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Haz login como cliente o admin</li>
                      <li>Ve manualmente a "/" - deberías ser redirigido</li>
                      <li>Recarga la página para probar persistencia</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthenticatedLayout>
    </PublicRoute>
  );
}
