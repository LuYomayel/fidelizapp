import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { LogIn, Shield, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api-client";
import { LoginBusinessDto } from "../../shared";
import { useAuth } from "@/contexts/AuthContext";
import { IBusiness } from "@/shared";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

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

      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
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
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center">
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
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="label label-required">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`input-field ${error ? "input-error" : ""}`}
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="password" className="label label-required">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`input-field pr-12 ${
                      error ? "input-error" : ""
                    }`}
                    placeholder="Tu contraseña"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-secondary w-full"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Iniciar Sesión
                  </div>
                )}
              </button>

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
      </div>
    </>
  );
}
