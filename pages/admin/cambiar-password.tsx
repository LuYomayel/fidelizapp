import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Key, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

// Componentes shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Context y API
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api-client";
import { toast } from "react-hot-toast";

export default function CambiarPassword() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const { user, login } = useAuth();
  const router = useRouter();

  // Obtener email de query params si existe
  useEffect(() => {
    if (router.query.email) {
      setEmail(router.query.email as string);
    }
  }, [router.query.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (formData.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validar que la nueva contraseña no sea el email
    if (user?.email && formData.newPassword === user.email) {
      setError("La nueva contraseña no puede ser tu email");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.business.firstTimeChangePassword({
        currentPassword: email,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        toast.success(
          `Contraseña cambiada correctamente. Bienvenido ${response.data?.business.businessName}.`
        );

        login({
          userType: "admin",
          user: response.data?.business,
          tokens: {
            accessToken: response.data?.tokens?.accessToken || "",
            refreshToken: response.data?.tokens?.refreshToken || "",
          },
        });
        toast.success("Contraseña cambiada correctamente");
        // Redirigir al dashboard después del cambio exitoso
        router.push("/admin/dashboard");
      } else {
        toast.error(response.message || "Error al cambiar la contraseña");
      }
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Error al cambiar la contraseña"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <Head>
        <title>Cambiar Contraseña | Stampia</title>
        <meta
          name="description"
          content="Cambia tu contraseña temporal por una segura"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Key className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Cambiar Contraseña
            </h1>
            <p className="mt-2 text-gray-600">
              Por seguridad, debes cambiar tu contraseña temporal
            </p>
          </div>

          {/* Alerta de información */}
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Tu contraseña actual es tu email. Por
              seguridad, necesitas cambiarla por una contraseña segura antes de
              continuar.
            </AlertDescription>
          </Alert>

          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Nueva Contraseña
              </CardTitle>
              <CardDescription>
                Elige una contraseña segura para tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repite tu contraseña"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Cambiando..." : "Cambiar Contraseña"}
                </Button>

                <div className="text-center text-sm text-gray-600 mt-4">
                  <p>
                    <strong>Consejos para una contraseña segura:</strong>
                  </p>
                  <ul className="text-xs mt-2 space-y-1">
                    <li>• Usa al menos 8 caracteres</li>
                    <li>• Incluye mayúsculas y minúsculas</li>
                    <li>• Añade números y símbolos</li>
                    <li>• No uses información personal</li>
                  </ul>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
