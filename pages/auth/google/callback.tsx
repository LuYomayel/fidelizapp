import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import Head from "next/head";

export default function GoogleCallback() {
  const router = useRouter();
  const { login } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Evitar procesamiento múltiple
    if (hasProcessed.current || isProcessing) {
      return;
    }

    const { token, user } = router.query;

    if (
      token &&
      user &&
      typeof token === "string" &&
      typeof user === "string"
    ) {
      hasProcessed.current = true;
      setIsProcessing(true);

      try {
        console.log("🔄 Procesando callback de Google OAuth...");

        // Parsear los datos del usuario
        const userData = JSON.parse(decodeURIComponent(user));

        console.log("👤 Datos del usuario:", userData);

        // Iniciar sesión con los datos recibidos
        login({
          userType: "client", // o 'admin' según corresponda
          user: userData,
          tokens: {
            accessToken: token,
            refreshToken: token, // Por ahora usar el mismo token
          },
        });

        // Guardar en localStorage para persistencia
        localStorage.setItem("google_token", token);
        localStorage.setItem("google_user", JSON.stringify(userData));

        console.log("✅ Login exitoso, redirigiendo...");

        // Pequeña pausa antes de redirigir para evitar problemas
        setTimeout(() => {
          // Redirigir según el tipo de usuario
          if (userData.provider === "google") {
            router.replace("/cliente/mi-tarjeta");
          } else {
            router.replace("/admin/dashboard");
          }
        }, 500);
      } catch (error) {
        console.error("❌ Error al procesar callback de Google:", error);
        setIsProcessing(false);
        hasProcessed.current = false;
        router.replace("/auth/error?message=Error al procesar autenticación");
      }
    }
  }, [router.query.token, router.query.user]); // Solo depender de los valores específicos

  return (
    <>
      <Head>
        <title>Procesando autenticación... | FirulApp</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <div className="loading-spinner w-8 h-8 border-white"></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isProcessing
                ? "Procesando autenticación..."
                : "Conectando con Google..."}
            </h2>

            <p className="text-gray-600 mb-6">
              Estamos completando tu inicio de sesión con Google. Serás
              redirigido automáticamente.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Si no eres redirigido automáticamente, por favor cierra esta
                ventana y vuelve a intentar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
