import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "@/lib/toast";
import PublicRoute from "@/components/shared/PublicRoute";
import LandingHeader from "@/components/landing/header";

export default function VerificarCodigoRecuperacion() {
  const router = useRouter();
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

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validar el código de recuperación
      const response = await api.clients.validateRecoveryCode({
        email,
        code,
      });

      if (response.success) {
        toast.success("Código verificado correctamente");

        // Redirigir a cambiar contraseña
        setTimeout(() => {
          router.push(
            `/cliente/cambiar-password-recuperacion?email=${encodeURIComponent(
              email
            )}`
          );
        }, 1500);
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
      const response = await api.clients.forgotPassword({
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
    <PublicRoute>
      <Head>
        <title>Verificar Código | Stampia</title>
        <meta
          name="description"
          content="Verifica el código de recuperación de contraseña"
        />
      </Head>
      <LandingHeader />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Verificar Código
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Hemos enviado un código de recuperación a tu email
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleVerifyCode} className="space-y-4">
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
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email para recuperación
                </p>
              </div>

              <div>
                <Label
                  htmlFor="code"
                  className="text-sm font-medium text-gray-700"
                >
                  Código de Recuperación
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
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                disabled={isLoading || code.length !== 6}
              >
                {isLoading ? "Verificando..." : "Verificar Código"}
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
                className="text-orange-600 hover:text-orange-700"
              >
                {isResending
                  ? "Enviando..."
                  : countdown > 0
                  ? `Reenviar en ${countdown}s`
                  : "Reenviar código"}
              </Button>
            </div>

            <Alert className="bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Importante:</strong> Revisa tu carpeta de spam si no
                encuentras el email. El código expira en 15 minutos.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </PublicRoute>
  );
}
