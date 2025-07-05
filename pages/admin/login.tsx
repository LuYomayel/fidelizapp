import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { LogIn, Shield, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { LoginBusinessDto } from "../../shared";
import { useAuth } from "@/contexts/AuthContext";
import { IBusiness } from "@/shared";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// TODO: Importar contexto de admin cuando esté listo
// import { useAdmin } from '@/contexts/AdminContext';

// Datos mock para desarrollo

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data: LoginBusinessDto = {
        email: formData.email,
        password: formData.password,
      };
      const response = (await api.businesses.login(data)) as {
        success: boolean;
        message: string;
        data: {
          business: IBusiness;
          token: string;
          tokens: { accessToken: string; refreshToken: string };
        };
      };

      if (!response.success) {
        throw new Error(response.message || "Error al iniciar sesión");
      }

      login({
        userType: "admin",
        user: response.data?.business,
        tokens: {
          accessToken: response.data?.tokens?.accessToken,
          refreshToken: response.data?.tokens?.refreshToken,
        },
      });

      // Guardar token y datos del negocio en localStorage
      localStorage.setItem(
        "admin_token",
        response.data?.tokens?.accessToken || ""
      );
      localStorage.setItem(
        "admin_data",
        JSON.stringify(response.data?.business || {})
      );

      // Redirigir al dashboard
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión. Intenta nuevamente.");
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
        <title>Iniciar Sesión - Administrador | FirulApp</title>
        <meta
          name="description"
          content="Accede al panel de administración de tu negocio"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              Panel de Administración
            </h2>
            <p className="mt-2 text-gray-600">
              Accede a la gestión de tu negocio
            </p>
          </div>

          {/* Formulario */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="label label-required">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`${error ? "border-red-500" : ""}`}
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="label label-required">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className={`pr-12 ${error ? "border-red-500" : ""}`}
                      placeholder="Tu contraseña"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2" />
                      Iniciando sesión...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <LogIn className="w-5 h-5 mr-2" />
                      Iniciar Sesión
                    </div>
                  )}
                </Button>

                {/* Separador */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">O</span>
                  </div>
                </div>

                {/* Botón de Google */}
                <GoogleSignInButton
                  text="Continuar con Google"
                  disabled={isLoading}
                />
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  ¿No tienes cuenta?{" "}
                  <Link
                    href="/negocio/registro"
                    className="text-secondary-600 hover:text-secondary-700 font-medium"
                  >
                    Registra tu negocio
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          {/* Información de prueba para desarrollo */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Datos de prueba:
            </h4>
            <p className="text-sm text-yellow-700">
              Email:{" "}
              <code className="bg-yellow-100 px-1 rounded">
                admin@cafearoma.com
              </code>
            </p>
            <p className="text-sm text-yellow-700">
              Contraseña:{" "}
              <code className="bg-yellow-100 px-1 rounded">admin123</code>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
