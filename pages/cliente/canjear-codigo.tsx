import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { QrCode, CheckCircle, AlertCircle, Camera, Plus } from "lucide-react";
import { ProtectedRoute } from "../../components/shared/ProtectedRoute";
import { AuthenticatedLayout } from "../../components/shared/AuthenticatedLayout";
import { api } from "@/lib/api-client";
import { QRScanner } from "../../components/cliente/QRScanner";
import { QRCodeGenerator } from "../../components/cliente/QRCodeGenerator";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

export default function CanjearCodigoPage() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [resultado, setResultado] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent, scannedCode?: string) => {
    e.preventDefault();

    if (!scannedCode && !codigo.trim()) {
      setResultado({
        success: false,
        message: "No se ha escaneado ningún código",
      });
      return;
    }

    setIsLoading(true);
    setResultado(null);

    // Simular llamada a API
    try {
      const response = await api.clientCards.redeem({
        code: scannedCode || codigo,
      });

      if (response.success) {
        setResultado({
          success: true,
          message: `¡Código canjeado exitosamente! Has ganado ${
            response.data?.stampsEarned || 0
          } ${
            response.data?.stampsEarned && response.data?.stampsEarned > 1
              ? "sellos"
              : "sello"
          }.`,
        });
        setCodigo(""); // Limpiar el campo después del éxito
        showToast.success(
          `Código canjeado exitosamente. Has ganado ${
            response.data?.stampsEarned || 0
          } ${
            response.data?.stampsEarned && response.data?.stampsEarned > 1
              ? "sellos"
              : "sello"
          }.`
        );
      } else {
        setResultado({
          success: false,
          message: "Código inválido o ya utilizado.",
        });
      }
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setResultado({
        success: false,
        message: error.message || "Error al canjear el sello.",
      });
      setIsLoading(false);
    } finally {
      router.push("/cliente/mi-tarjeta");
    }
  };

  const handleQRScan = (scannedCode: string) => {
    console.log("scannedCode", scannedCode);
    setCodigo(scannedCode);
    setIsScannerOpen(false);
    // Automáticamente procesar el código escaneado
    setTimeout(() => {
      handleSubmit(new Event("submit") as any, scannedCode);
    }, 100);
  };

  return (
    <ProtectedRoute allowedUserTypes={["client"]}>
      <AuthenticatedLayout>
        <div className="p-4">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Canjear Código
              </h1>
              <p className="text-gray-600">
                Ingresa el código que recibiste del negocio o escanéalo con tu
                cámara
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-500" />
                  Ingresa tu código
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Ej: ABC123"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                      className="text-center text-lg font-mono flex-1"
                      maxLength={10}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsScannerOpen(true)}
                      disabled={isLoading}
                      className="px-4"
                    >
                      <Camera className="w-5 h-5" />
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !codigo.trim()}
                  >
                    {isLoading ? "Canjeando..." : "Canjear Código"}
                  </Button>
                </form>

                {resultado && (
                  <div
                    className={`mt-4 p-4 rounded-lg ${
                      resultado.success
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {resultado.success ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span
                        className={
                          resultado.success ? "text-green-800" : "text-red-800"
                        }
                      >
                        {resultado.message}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    💡 Consejos:
                  </h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Ingresa el código exactamente como te lo dieron</li>
                    <li>
                      • Los códigos son sensibles a mayúsculas y minúsculas
                    </li>
                    <li>• Cada código solo se puede usar una vez</li>
                    <li>• Usa el botón de cámara para escanear códigos QR</li>
                    <li>
                      • Prueba con códigos que contengan "test" para simular
                      éxito
                    </li>
                  </ul>
                </div>

                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsGeneratorOpen(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generar QR de Prueba
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <QRScanner
          isOpen={isScannerOpen}
          onScan={handleQRScan}
          onClose={() => setIsScannerOpen(false)}
        />

        <QRCodeGenerator
          isOpen={isGeneratorOpen}
          onClose={() => setIsGeneratorOpen(false)}
        />
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
