import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { LogIn, ArrowLeft } from "lucide-react";

// Importar utilidades y tipos
import { validarEmail } from "@/utils";

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
import { api } from "@/lib/api-client";
import { LoginClientDto } from "@shared";
import { useAuth } from "@/contexts/AuthContext";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

// TODO: Importar contexto de cliente cuando esté listo
// import { useCliente } from '@/contexts/ClienteContext';

// Datos mock para desarrollo
// import { buscarClientePorDNI, simularRespuestaAPI } from "@/data/mock";

export default function ClienteLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("El email es obligatorio");
      return;
    }

    if (!password) {
      setError("La contraseña es obligatoria");
      return;
    }

    if (!validarEmail(email)) {
      setError("Email inválido");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const loginClientDto: LoginClientDto = {
        email,
        password,
      };
      const response = (await api.clients.login(loginClientDto)) as {
        success: boolean;
        message: string;
        data: { token: string; client: any; tokens: any };
      };
      if (response.success) {
        // Usar el AuthContext para manejar la autenticación
        login({
          userType: "client",
          user: response.data.client,
          tokens: response.data.tokens,
        });

        router.push("/cliente/mi-tarjeta");
      } else {
        setError(response.message || "Error al iniciar sesión");
      }
    } catch (error: any) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login Cliente | FirulApp</title>
        <meta
          name="description"
          content="Inicia sesión para acceder a tu tarjeta de fidelización digital"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Button variant="ghost" asChild className="mb-8">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
            <p className="mt-2 text-gray-600">
              Accede a tu tarjeta de fidelización digital
            </p>
          </div>

          {/* Formulario */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={error ? "border-red-500" : ""}
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={error ? "border-red-500" : ""}
                    placeholder="Tu contraseña"
                    required
                  />
                </div>

                {/* Error */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Botones */}
                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
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

                  <div className="text-center">
                    <span className="text-sm text-gray-600">
                      ¿No tienes cuenta?{" "}
                      <Link
                        href="/cliente/registro"
                        className="text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Regístrate aquí
                      </Link>
                    </span>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ¿Problemas para acceder?{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Contacta soporte
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
