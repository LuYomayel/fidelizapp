import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { AlertCircle, Home, RotateCcw } from "lucide-react";

export default function AuthError() {
  const router = useRouter();
  const { message } = router.query;

  const errorMessage =
    (message as string) || "Error de autenticación desconocido";

  return (
    <>
      <Head>
        <title>Error de autenticación | FirulApp</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Error de autenticación
            </h2>

            <p className="text-gray-600 mb-6">{errorMessage}</p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">
                No se pudo completar la autenticación con Google. Por favor,
                intenta nuevamente o contacta soporte si el problema persiste.
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Intentar nuevamente
              </button>

              <Link
                href="/"
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-5 h-5 mr-2" />
                Ir al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
