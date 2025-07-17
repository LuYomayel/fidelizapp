import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast";

export default function VerificarEmailCliente() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    // Obtener email de los parámetros de URL
    const { email: urlEmail } = router.query;
    if (urlEmail && typeof urlEmail === "string") {
      setEmail(urlEmail);
    }
  }, [router.query]);

  useEffect(() => {
    // Countdown para reenvío
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = (await api.clients.verifyEmail({
        email,
        code,
      })) as {
        success: boolean;
        message: string;
        data?: {
          client: any;
          token: string;
        };
      };

      if (response.success) {
        toast.success("¡Email verificado exitosamente!");

        // Hacer login automático del cliente con los datos retornados
        if (response.data && response.data.client && response.data.token) {
          login({
            userType: "client",
            user: response.data.client,
            tokens: {
              accessToken: response.data.token,
              refreshToken: "", // No hay refresh token
            },
          });

          setTimeout(() => {
            toast.success("Redirigiendo a tu perfil...");
            router.push("/cliente/mi-tarjeta");
          }, 1500);
        } else {
          // Fallback si no vienen los datos de login
          setTimeout(() => {
            toast.success("Por favor, inicia sesión con tu cuenta verificada");
            router.push("/cliente/login");
          }, 1500);
        }
      } else {
        setErrors({
          code: response.message || "Código de verificación inválido",
        });
      }
    } catch (error: any) {
      console.error("Error en verificación:", error);
      setErrors({
        code:
          error.message || "Error al verificar el código. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setErrors({});

    try {
      const response = await api.clients.resendVerification({
        email,
      });

      if (response.success) {
        toast.success("Nuevo código enviado a tu email");
        setCountdown(60); // 60 segundos de espera
      } else {
        setErrors({
          email: response.message || "Error al enviar el código",
        });
      }
    } catch (error: any) {
      console.error("Error al reenviar código:", error);
      setErrors({
        email:
          error.message || "Error al reenviar el código. Intenta nuevamente.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <>
      <Head>
        <title>Verificar Email | Stampia</title>
        <meta
          name="description"
          content="Verifica tu email para completar tu registro"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verificar Email
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Hemos enviado un código de verificación a tu email
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleVerifyEmail} className="space-y-4">
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
                  placeholder="tu@email.com"
                  required
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="code"
                  className="text-sm font-medium text-gray-700"
                >
                  Código de Verificación
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  maxLength={6}
                  required
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? "Verificando..." : "Verificar Email"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                ¿No recibiste el código?
              </p>
              <Button
                variant="outline"
                onClick={handleResendCode}
                disabled={isResending || countdown > 0}
                className="text-blue-600 hover:text-blue-700"
              >
                {isResending
                  ? "Enviando..."
                  : countdown > 0
                  ? `Reenviar en ${countdown}s`
                  : "Reenviar código"}
              </Button>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Importante:</strong> Revisa tu carpeta de spam si no
                encuentras el email. El código expira en 15 minutos.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => router.push("/cliente/login")}
                className="text-gray-600 hover:text-gray-800"
              >
                Volver al Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
