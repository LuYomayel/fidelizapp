import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import {
  QrCode,
  Download,
  Copy,
  RefreshCw,
  Smartphone,
  Users,
  TrendingUp,
  Info,
  CheckCircle,
  Printer,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { IBusinessQRData, IBusinessProfile } from "@/shared";

export default function QRNegocioPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [qrData, setQrData] = useState<IBusinessQRData | null>(null);
  const [business, setBusiness] = useState<IBusinessProfile | null>(null);

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      const response = await api.business.getProfile();
      if (response.success) {
        setBusiness(response.data || null);
      }
    } catch (error) {
      console.error("Error cargando negocio:", error);
    }
  };

  const handleGenerateQR = async () => {
    setIsLoading(true);
    setError("");
    setResult("");

    try {
      const response = await api.business.generateQR();

      if (response.success && response.data) {
        setQrData(response.data);
        setResult("¡Código QR generado exitosamente!");
        setTimeout(() => {
          setResult("");
        }, 3000);
      } else {
        setError(response.message || "Error al generar el código QR");
      }
    } catch (error: any) {
      console.error("Error generando QR:", error);
      setError(
        error instanceof Error ? error.message : "Error al generar el código QR"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (qrData?.qrCode) {
      const link = document.createElement("a");
      link.download = `qr-negocio-${
        business?.businessName || "stampia"
      }.png`;
      link.href = qrData.qrCode;
      link.click();
    }
  };

  const handleCopyQRUrl = () => {
    if (qrData?.qrUrl) {
      navigator.clipboard.writeText(qrData.qrUrl);
      setResult("URL copiada al portapapeles");
      setTimeout(() => {
        setResult("");
      }, 2000);
    }
  };

  const handlePrintQR = () => {
    if (qrData?.qrCode) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Código QR - ${business?.businessName || "Negocio"}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 20px;
                  margin: 0;
                }
                .qr-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 20px;
                  max-width: 400px;
                  margin: 0 auto;
                }
                .qr-image {
                  width: 300px;
                  height: 300px;
                  border: 2px solid #333;
                  border-radius: 8px;
                }
                .business-name {
                  font-size: 24px;
                  font-weight: bold;
                  color: #333;
                }
                .instructions {
                  font-size: 14px;
                  color: #666;
                  line-height: 1.5;
                }
                @media print {
                  body { margin: 0; }
                  .qr-container { page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <div class="business-name">${
                  business?.businessName || "Mi Negocio"
                }</div>
                <img src="${qrData.qrCode}" alt="Código QR" class="qr-image" />
                <div class="instructions">
                  <p><strong>¡Escanea este código QR para registrarte!</strong></p>
                  <p>• Abre la cámara de tu celular</p>
                  <p>• Apunta al código QR</p>
                  <p>• ¡Listo! Ya estás registrado</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <ProtectedRoute>
      <AuthenticatedLayout title="Código QR del Negocio">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Código QR del Negocio
            </h1>
            <p className="text-gray-600">
              Genera y gestiona el código QR para que los clientes se registren
              en tu negocio
            </p>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && (
            <Alert className="mb-6">
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            {/* Información del negocio */}
            {business && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Información del Negocio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Nombre del Negocio
                      </p>
                      <p className="font-semibold">{business.businessName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Negocio</p>
                      <p className="font-semibold">{business.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">
                        Sellos para Recompensa
                      </p>
                      <p className="font-semibold">
                        {business.stampsForReward} sellos
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Recompensa</p>
                      <p className="font-semibold">
                        {business.rewardDescription || "No especificada"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Beneficios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Beneficios del Código QR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-blue-900">
                      Fácil Registro
                    </h4>
                    <p className="text-sm text-blue-700">
                      Los clientes se registran con un simple escaneo
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-900">
                      Más Clientes
                    </h4>
                    <p className="text-sm text-green-700">
                      Atrae nuevos clientes con tecnología moderna
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-purple-900">
                      Fidelización
                    </h4>
                    <p className="text-sm text-purple-700">
                      Sistema automático de sellos y recompensas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generación de QR */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Generar Código QR
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!qrData ? (
                  <div className="text-center py-12">
                    <QrCode className="mx-auto h-20 w-20 text-gray-300 mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Genera tu código QR único
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Crea un código QR personalizado para tu negocio que los
                      clientes pueden escanear para registrarse automáticamente
                      y comenzar a acumular sellos.
                    </p>
                    <Button
                      onClick={handleGenerateQR}
                      disabled={isLoading}
                      size="lg"
                      className="px-8"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <QrCode className="mr-2 h-5 w-5" />
                          Generar Código QR
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* QR Code Display */}
                    <div className="flex flex-col items-center">
                      <div className="w-80 h-80 bg-white rounded-xl flex items-center justify-center overflow-hidden border-4 border-gray-300 shadow-2xl">
                        <img
                          src={qrData.qrCode}
                          alt="Código QR del negocio"
                          className="w-full h-full object-contain p-6"
                        />
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mt-4">
                        Código QR de {business?.businessName || "tu negocio"}
                      </p>
                    </div>

                    {/* URL Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        🔗 URL del Negocio
                      </h4>
                      <div className="flex items-center gap-3">
                        <Input
                          value={qrData.qrUrl}
                          readOnly
                          className="font-mono text-sm flex-1"
                        />
                        <Button
                          onClick={handleCopyQRUrl}
                          size="sm"
                          variant="outline"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Esta URL se abre cuando los clientes escanean el QR
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={handleDownloadQR}
                        className="h-12"
                        size="lg"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Descargar QR
                      </Button>
                      <Button
                        onClick={handlePrintQR}
                        variant="outline"
                        className="h-12"
                        size="lg"
                      >
                        <Printer className="mr-2 h-5 w-5" />
                        Imprimir QR
                      </Button>
                      <Button
                        onClick={handleGenerateQR}
                        variant="outline"
                        className="h-12"
                        size="lg"
                      >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Regenerar QR
                      </Button>
                    </div>

                    {/* Instructions */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <h4 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
                        📋 Instrucciones de Uso
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-medium text-green-800 mb-2">
                            Para el Negocio:
                          </h5>
                          <ol className="text-sm text-green-700 space-y-1">
                            <li>1. Descarga o imprime el código QR</li>
                            <li>
                              2. Colócalo en un lugar visible del mostrador
                            </li>
                            <li>3. Asegúrate de que esté bien iluminado</li>
                            <li>
                              4. Recomienda a los clientes que lo escaneen
                            </li>
                          </ol>
                        </div>
                        <div>
                          <h5 className="font-medium text-green-800 mb-2">
                            Para los Clientes:
                          </h5>
                          <ol className="text-sm text-green-700 space-y-1">
                            <li>1. Abre la cámara de tu celular</li>
                            <li>2. Apunta al código QR</li>
                            <li>3. Toca la notificación que aparece</li>
                            <li>4. ¡Listo! Ya estás registrado</li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h4 className="font-semibold text-blue-900 mb-3">
                        💡 Consejos para Mejor Resultado
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li>
                          • Imprime el QR en tamaño A4 o más grande para mejor
                          visibilidad
                        </li>
                        <li>• Colócalo en un lugar con buena iluminación</li>
                        <li>• Asegúrate de que no esté arrugado o dañado</li>
                        <li>
                          • Considera usar un soporte o marco para protegerlo
                        </li>
                        <li>
                          • Entrena a tu personal para explicar el proceso a los
                          clientes
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
