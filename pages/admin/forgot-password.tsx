import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";

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

// API client
import { api } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import LandingHeader from "@/components/landing/header";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    setIsLoading(true);

    try {
      const response = await api.businesses.forgotPassword({ email });

      if (response.success) {
        setSuccess(true);
        toast.success("Código de recuperación enviado a tu email");
        // Redirigir a la página de verificación con el modo forgot-password
        router.push(
          `/admin/verificar-email?email=${encodeURIComponent(
            email
          )}&mode=forgot-password`
        );
      } else {
        setError(response.message || "Error al enviar el código");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Error al enviar el código");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Head>
          <title>Código Enviado | Stampia</title>
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                </div>

                <CardTitle className="text-2xl mb-4">
                  ¡Código Enviado!
                </CardTitle>

                <CardDescription className="mb-6">
                  Hemos enviado un código de recuperación a tu email. Revisa tu
                  bandeja de entrada y spam.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Recuperar Contraseña | Stampia</title>
        <meta
          name="description"
          content="Recupera tu contraseña de administrador"
        />
      </Head>
      <LandingHeader />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Recuperar Contraseña
            </h1>
            <p className="mt-2 text-gray-600">
              Ingresa tu email para recibir un código de recuperación
            </p>
          </div>

          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle>Email de Recuperación</CardTitle>
              <CardDescription>
                Te enviaremos un código para restablecer tu contraseña
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Código"
                  )}
                </Button>

                <div className="text-center"></div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
