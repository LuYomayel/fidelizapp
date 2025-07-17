import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Mail, ArrowLeft, Check, RefreshCw } from "lucide-react";

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

export default function VerificarEmail() {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const router = useRouter();

  // Obtener email de query params si existe
  useEffect(() => {
    if (router.query.email) {
      setEmail(router.query.email as string);
    }
  }, [router.query.email]);

  // Countdown para reenvío
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.businesses.verifyEmail({
        email,
        verificationCode,
      });

      if (response.success) {
        setSuccess(true);
        toast.success(
          "Email verificado exitosamente. Ahora puedes cambiar tu contraseña."
        );
        router.push(
          `/admin/cambiar-password?email=${encodeURIComponent(email)}`
        );
      } else {
        setError(response.message || "Error al verificar el código");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Error al verificar el código");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setError("");
    setIsResending(true);
    setCanResend(false);

    try {
      const response = await api.businesses.resendVerificationCode({
        email,
      });

      if (response.success) {
        setCountdown(60); // 60 segundos de cooldown
        setError("");
        // Mostrar mensaje de éxito temporalmente
        setError("Código reenviado exitosamente");
        setTimeout(() => setError(""), 3000);
      } else {
        setError(response.message || "Error al reenviar el código");
        setCanResend(true);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Error al reenviar el código");
      setCanResend(true);
    } finally {
      setIsResending(false);
    }
  };

  /*
  if (success) {
    return (
      <>
        <Head>
          <title>Email Verificado | Stampia</title>
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                </div>

                <CardTitle className="text-2xl mb-4">
                  ¡Email Verificado!
                </CardTitle>

                <CardDescription className="mb-6">
                  Tu email ha sido verificado exitosamente. Ahora puedes iniciar
                  sesión y acceder a todas las funcionalidades de Stampia.
                </CardDescription>

                <Button asChild className="w-full">
                  <Link href="/admin/login">Iniciar Sesión</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }
  */

  return (
    <>
      <Head>
        <title>Verificar Email | Stampia</title>
        <meta
          name="description"
          content="Verifica tu email para completar el registro de tu negocio"
        />
      </Head>

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
              Verificar Email
            </h1>
            <p className="mt-2 text-gray-600">
              Ingresa el código de verificación que enviamos a tu email
            </p>
          </div>

          {/* Formulario */}
          <Card>
            <CardHeader>
              <CardTitle>Código de Verificación</CardTitle>
              <CardDescription>
                Revisa tu bandeja de entrada y spam
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

                <div>
                  <Label htmlFor="verificationCode">
                    Código de Verificación
                  </Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    required
                  />
                </div>

                {error && (
                  <Alert
                    variant={
                      error.includes("exitosamente") ? "default" : "destructive"
                    }
                  >
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Verificando..." : "Verificar Email"}
                </Button>

                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    ¿No recibiste el código?
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResendCode}
                    disabled={!canResend || isResending}
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Reenviando...
                      </>
                    ) : canResend ? (
                      "Reenviar Código"
                    ) : (
                      `Reenviar en ${countdown}s`
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <Button variant="ghost" asChild>
                    <Link href="/admin/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al Login
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
