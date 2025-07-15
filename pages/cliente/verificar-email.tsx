import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api-client";
import PublicRoute from "@/components/shared/PublicRoute";

export default function VerificarEmail() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [verified, setVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const router = useRouter();

  useEffect(() => {
    // Obtener email de la query string
    if (router.query.email) {
      setEmail(router.query.email as string);
    }
  }, [router.query]);

  useEffect(() => {
    // Countdown para reenvío
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !email.trim()) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await api.clients.verifyEmail({ email, code });

      if (response.success) {
        setVerified(true);
        setMessageType("success");
        setMessage("¡Email verificado correctamente! Redirigiendo al login...");

        setTimeout(() => {
          router.push("/cliente/login");
        }, 3000);
      } else {
        setMessageType("error");
        setMessage(response.message || "Código inválido o expirado");
      }
    } catch (error: any) {
      setMessageType("error");
      setMessage(error.message || "Error al verificar el email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;

    setIsResending(true);
    setMessage("");

    try {
      const response = await api.clients.resendVerification({ email });

      if (response.success) {
        setMessageType("success");
        setMessage("Código de verificación reenviado");
        setCountdown(60); // 60 segundos de espera
      } else {
        setMessageType("error");
        setMessage(response.message || "Error al reenviar el código");
      }
    } catch (error: any) {
      setMessageType("error");
      setMessage(error.message || "Error al reenviar el código");
    } finally {
      setIsResending(false);
    }
  };

  if (verified) {
    return (
      <PublicRoute>
        <Head>
          <title>Email Verificado | Stampia</title>
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>

                <CardTitle className="text-2xl mb-4">
                  ¡Email Verificado!
                </CardTitle>

                <p className="text-gray-600 mb-6">
                  Tu cuenta ha sido verificada correctamente. Serás redirigido
                  al login en unos segundos...
                </p>

                <Button asChild>
                  <Link href="/cliente/login">Ir al Login</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PublicRoute>
    );
  }

  return (
    <PublicRoute>
      <Head>
        <title>Verificar Email | Stampia</title>
        <meta
          name="description"
          content="Verifica tu email para completar el registro"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <Button variant="ghost" asChild className="mb-8">
              <Link href="/cliente/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al login
              </Link>
            </Button>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Verificar Email
            </h1>
            <p className="mt-2 text-gray-600">
              Ingresa el código de 6 dígitos que enviamos a tu email
            </p>
            {email && (
              <p className="mt-1 text-sm text-gray-500">
                Código enviado a: <strong>{email}</strong>
              </p>
            )}
          </div>

          {/* Formulario */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleVerify} className="space-y-6">
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
                    placeholder="tu@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Código */}
                <div>
                  <Label
                    htmlFor="code"
                    className="text-sm font-medium text-gray-700"
                  >
                    Código de verificación
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="123456"
                    className="text-center text-lg font-mono"
                    maxLength={6}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ingresa el código de 6 dígitos
                  </p>
                </div>

                {/* Mensaje */}
                {message && (
                  <Alert
                    variant={
                      messageType === "error" ? "destructive" : "default"
                    }
                  >
                    <div className="flex items-center gap-2">
                      {messageType === "success" && (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {messageType === "error" && (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      {messageType === "info" && <Mail className="w-4 h-4" />}
                      <AlertDescription>{message}</AlertDescription>
                    </div>
                  </Alert>
                )}

                {/* Botones */}
                <div className="space-y-4">
                  <Button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isLoading ? "Verificando..." : "Verificar Email"}
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      ¿No recibiste el código?
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResend}
                      disabled={isResending || countdown > 0}
                      className="w-full"
                    >
                      <RefreshCw
                        className={`w-4 h-4 mr-2 ${
                          isResending ? "animate-spin" : ""
                        }`}
                      />
                      {countdown > 0
                        ? `Reenviar en ${countdown}s`
                        : isResending
                        ? "Reenviando..."
                        : "Reenviar código"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">
                💡 Consejos:
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Revisa tu carpeta de spam</li>
                <li>• El código expira en 15 minutos</li>
                <li>• Puedes solicitar un nuevo código si es necesario</li>
                <li>• Esta funcionalidad está en desarrollo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
