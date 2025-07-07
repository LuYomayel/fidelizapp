import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "../ui/button";
import { Camera, X, AlertCircle } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !scannerRef.current) {
      try {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            qrbox: {
              width: 250,
              height: 250,
            },
            fps: 10,
          },
          false
        );

        scanner.render(
          (decodedText) => {
            onScan(decodedText);
            stopScanner();
          },
          (error) => {
            // Solo mostrar errores críticos
            if (error.name === "NotAllowedError") {
              setError(
                "Acceso a la cámara denegado. Por favor, permite el acceso a la cámara."
              );
            } else if (error.name === "NotFoundError") {
              setError("No se encontró ninguna cámara en tu dispositivo.");
            } else if (error.name === "NotSupportedError") {
              setError("Tu navegador no soporta el acceso a la cámara.");
            }
          }
        );

        scannerRef.current = scanner;
        setIsScanning(true);
        setError(null);
      } catch (err: any) {
        setError("Error al inicializar el escáner QR: " + err.message);
      }
    }

    return () => {
      if (scannerRef.current) {
        stopScanner();
      }
    };
  }, [isOpen, onScan]);

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const handleClose = () => {
    stopScanner();
    setError(null);
    onClose();
  };

  const retryScanner = () => {
    setError(null);
    if (scannerRef.current) {
      stopScanner();
    }
    // Forzar re-render del scanner
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 10,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        (error) => {
          if (error.name === "NotAllowedError") {
            setError(
              "Acceso a la cámara denegado. Por favor, permite el acceso a la cámara."
            );
          } else if (error.name === "NotFoundError") {
            setError("No se encontró ninguna cámara en tu dispositivo.");
          } else if (error.name === "NotSupportedError") {
            setError("Tu navegador no soporta el acceso a la cámara.");
          }
        }
      );

      scannerRef.current = scanner;
      setIsScanning(true);
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Escanear Código QR
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {error ? (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={retryScanner}
              className="w-full"
            >
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="mb-4">
            <div id="qr-reader" className="w-full"></div>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            {error
              ? "Intenta permitir el acceso a la cámara o usa un dispositivo diferente"
              : "Posiciona el código QR dentro del marco para escanearlo"}
          </p>
          <Button variant="outline" onClick={handleClose} className="w-full">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
