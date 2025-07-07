import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { QrCode, Download } from "lucide-react";

interface QRCodeGeneratorProps {
  onClose: () => void;
  isOpen: boolean;
}

export function QRCodeGenerator({ onClose, isOpen }: QRCodeGeneratorProps) {
  const [codigo, setCodigo] = useState("TEST123");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    if (isOpen && codigo) {
      generateQRCode();
    }
  }, [isOpen, codigo]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(codigo, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("Error generando QR:", error);
    }
  };

  const downloadQR = () => {
    if (qrDataUrl) {
      const link = document.createElement("a");
      link.download = `qr-${codigo}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Generar Código QR de Prueba
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
            ✕
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código para generar QR:
            </label>
            <Input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ej: TEST123"
              className="text-center font-mono"
            />
          </div>

          {qrDataUrl && (
            <div className="text-center">
              <div className="mb-4">
                <img
                  src={qrDataUrl}
                  alt="Código QR"
                  className="mx-auto border border-gray-200 rounded-lg"
                />
              </div>
              <Button variant="outline" onClick={downloadQR} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Descargar QR
              </Button>
            </div>
          )}

          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Instrucciones:</p>
            <ul className="space-y-1">
              <li>• Ingresa el código que quieres convertir a QR</li>
              <li>• Descarga la imagen del QR</li>
              <li>• Usa el escáner QR en la página de canjear código</li>
              <li>• Prueba escaneando este QR generado</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
