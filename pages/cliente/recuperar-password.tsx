import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Lock, ArrowLeft, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api-client";
import PublicRoute from "@/components/shared/PublicRoute";

export default function RecuperarPassword() {
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );

  const router = useRouter();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await api.clients.forgotPassword({ email });

      if (response.success) {
        setStep("code");
        setMessageType("success");
        setMessage("Código de recuperación enviado a tu email");
      } else {
        setMessageType("error");
        setMessage(response.message || "Error al enviar el código");
      }
    } catch (error: any) {
      setMessageType("error");
      setMessage(error.message || "Error al enviar el código");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !newPassword.trim() || !confirmPassword.trim()) return;

    if (newPassword !== confirmPassword) {
      setMessageType("error");
      setMessage("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setMessageType("error");
      setMessage("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await api.clients.resetPassword({
        email,
        code,
        newPassword,
      });

      if (response.success) {
        setStep("success");
        setMessageType("success");
        setMessage("Contraseña actualizada correctamente");
      } else {
        setMessageType("error");
        setMessage(response.message || "Código inválido o expirado");
      }
    } catch (error: any) {
      setMessageType("error");
      setMessage(error.message || "Error al restablecer la contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await api.clients.forgotPassword({ email });

      if (response.success) {
        setMessageType("success");
        setMessage("Código reenviado a tu email");
      } else {
        setMessageType("error");
        setMessage(response.message || "Error al reenviar el código");
      }
    } catch (error: any) {
      setMessageType("error");
      setMessage(error.message || "Error al reenviar el código");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "success") {
    return (
      <PublicRoute>
        <Head>
          <title>Contraseña Restablecida | FidelizApp</title>
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
                  ¡Contraseña Restablecida!
                </CardTitle>

                <p className="text-gray-600 mb-6">
                  Tu contraseña ha sido actualizada correctamente. Ya puedes
                  iniciar sesión con tu nueva contraseña.
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
        <title>Recuperar Contraseña | FidelizApp</title>
        <meta
          name="description"
          content="Recupera tu contraseña de FidelizApp"
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
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              {step === "email"
                ? "Recuperar Contraseña"
                : "Restablecer Contraseña"}
            </h1>
            <p className="mt-2 text-gray-600">
              {step === "email"
                ? "Ingresa tu email para recibir un código de recuperación"
                : "Ingresa el código y tu nueva contraseña"}
            </p>
          </div>

          {/* Formulario */}
          <Card>
            <CardContent className="pt-6">
              {step === "email" ? (
                <form onSubmit={handleRequestCode} className="space-y-6">
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

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    {isLoading ? "Enviando..." : "Enviar Código"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
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
                      Código enviado a: <strong>{email}</strong>
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="newPassword"
                      className="text-sm font-medium text-gray-700"
                    >
                      Nueva contraseña
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña"
                      minLength={6}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-700"
                    >
                      Confirmar contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirma tu contraseña"
                      minLength={6}
                      required
                      disabled={isLoading}
                    />
                  </div>

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

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      disabled={isLoading || code.length !== 6}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {isLoading
                        ? "Restableciendo..."
                        : "Restablecer Contraseña"}
                    </Button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        ¿No recibiste el código?
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendCode}
                        disabled={isLoading}
                        className="w-full"
                      >
                        Reenviar código
                      </Button>
                    </div>
                  </div>
                </form>
              )}
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
                <li>• Usa una contraseña segura con al menos 6 caracteres</li>
                <li>• Esta funcionalidad está en desarrollo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
}
