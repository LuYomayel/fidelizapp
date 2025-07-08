import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "../ui/button";
import { Camera, X, AlertCircle, Loader2 } from "lucide-react";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const CAMERA_PERMISSION_KEY = "qr_camera_permission";

export function QRScanner({ onScan, onClose, isOpen }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<any[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [showCameraSelect, setShowCameraSelect] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Función para agregar logs de debug
  const addDebugLog = (message: string) => {
    console.log(`[QRScanner Debug] ${message}`);
    setDebugInfo(
      (prev) => `${new Date().toLocaleTimeString()}: ${message}\n${prev}`
    );
  };

  // Detectar permiso guardado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const permission =
        localStorage.getItem(CAMERA_PERMISSION_KEY) === "granted";
      setHasPermission(permission);
      addDebugLog(`Permiso guardado: ${permission}`);
    }
  }, [isOpen]);

  // Inicializar escáner cuando se abre
  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    addDebugLog("Iniciando inicialización del escáner");
    setError(null);
    setLoading(true);
    setShowCameraSelect(false);
    setCameraId(null);
    setCameras([]);

    // Pedir cámaras disponibles
    // @ts-ignore: método estático no tipado
    Html5Qrcode.getCameras()
      .then((devices: any[]) => {
        addDebugLog(`Cámaras encontradas: ${devices.length}`);
        devices.forEach((device, index) => {
          addDebugLog(`Cámara ${index}: ${device.label} (${device.id})`);
        });

        setCameras(devices);

        // Buscar cámara trasera
        const backCam = devices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("environment") ||
            d.label.toLowerCase().includes("trasera") ||
            d.label.toLowerCase().includes("posterior")
        );

        const selected = backCam || devices[0];
        if (selected) {
          addDebugLog(
            `Cámara seleccionada: ${selected.label} (${selected.id})`
          );
          setCameraId(selected.id);
          startScanner(selected.id);
        } else {
          addDebugLog("No se encontró ninguna cámara disponible");
          setError("No se encontró ninguna cámara disponible.");
        }
      })
      .catch((err: any) => {
        addDebugLog(`Error al obtener cámaras: ${err.message}`);
        setError("No se pudo acceder a la cámara: " + err.message);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [isOpen]);

  // Guardar permiso si se escanea correctamente
  const handleScanSuccess = (decodedText: string, decodedResult: any) => {
    addDebugLog(`QR detectado: ${decodedText}`);
    localStorage.setItem(CAMERA_PERMISSION_KEY, "granted");
    setHasPermission(true);
    onScan(decodedText);
    stopScanner();
  };

  // Iniciar escáner
  const startScanner = async (id: string) => {
    addDebugLog(`Iniciando escáner con cámara: ${id}`);
    setLoading(true);
    setError(null);

    try {
      if (html5QrCodeRef.current) {
        addDebugLog("Deteniendo escáner anterior");
        await html5QrCodeRef.current.stop();
      }

      const qr = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = qr;

      // Configuración mejorada para el escáner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        ...(id ? { deviceId: { exact: id } } : { facingMode: "environment" }),
      };

      addDebugLog(`Configuración del escáner: ${JSON.stringify(config)}`);

      await qr.start(config, handleScanSuccess, (err: any) => {
        addDebugLog(`Error de escaneo: ${err}`);
        if (
          err &&
          typeof err === "string" &&
          err.toLowerCase().includes("permission")
        ) {
          setError(
            "Acceso a la cámara denegado. Por favor, permite el acceso a la cámara."
          );
        }
      });

      addDebugLog("Escáner iniciado correctamente");
      setIsScanning(true);
    } catch (err: any) {
      addDebugLog(`Error al inicializar escáner: ${err?.message || err}`);
      setError("Error al inicializar el escáner QR: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  // Detener escáner
  const stopScanner = () => {
    addDebugLog("Deteniendo escáner");
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().catch((err) => {
        addDebugLog(`Error al detener escáner: ${err}`);
      });
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  // Cambiar cámara manualmente
  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    addDebugLog(`Cambiando a cámara: ${id}`);
    setCameraId(id);
    startScanner(id);
  };

  // Reintentar
  const retryScanner = () => {
    addDebugLog("Reintentando escáner");
    setError(null);
    if (cameraId) {
      startScanner(cameraId);
    } else if (cameras.length > 0) {
      startScanner(cameras[0].id);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    addDebugLog("Cerrando modal de escáner");
    stopScanner();
    setError(null);
    onClose();
  };

  // Mostrar selector de cámara si hay más de una
  useEffect(() => {
    if (cameras.length > 1) {
      setShowCameraSelect(true);
    } else {
      setShowCameraSelect(false);
    }
  }, [cameras]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 max-w-md w-full relative animate-fade-in">
        {/* Botón cerrar */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-blue-600"
          aria-label="Cerrar"
        >
          <X className="w-6 h-6" />
        </Button>
        <div className="flex flex-col items-center gap-2 mb-4">
          <Camera className="w-8 h-8 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">
            Escanear Código QR
          </h3>
        </div>

        {/* Información de debug */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-3 p-2 bg-gray-100 rounded text-xs">
            <div className="font-semibold mb-1">Debug Info:</div>
            <div className="max-h-20 overflow-y-auto whitespace-pre-wrap">
              {debugInfo || "Sin información de debug"}
            </div>
          </div>
        )}

        {/* Selector de cámara */}
        {showCameraSelect && (
          <div className="mb-3 flex items-center gap-2">
            <label
              htmlFor="camera-select"
              className="text-sm text-gray-700 font-medium"
            >
              Cámara:
            </label>
            <select
              id="camera-select"
              value={cameraId || ""}
              onChange={handleCameraChange}
              className="border rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {cameras.map((cam) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Estado de carga */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <span className="text-blue-600 font-medium">
              Cargando cámara...
            </span>
          </div>
        )}

        {/* Errores */}
        {error && !loading && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-semibold">Error</span>
            </div>
            <p className="text-sm text-red-700 mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={retryScanner}
              className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Área de escaneo */}
        <div
          className={`mb-4 ${
            loading || error ? "opacity-30 pointer-events-none" : ""
          }`}
        >
          <div
            id="qr-reader"
            className="w-full min-h-[260px] rounded-lg border border-blue-100 bg-blue-50 flex items-center justify-center"
          >
            {isScanning && !loading && !error && (
              <div className="text-center text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Escaneando...</p>
              </div>
            )}
          </div>
        </div>

        {/* Mensaje de ayuda */}
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            {error
              ? "Intenta permitir el acceso a la cámara o usa un dispositivo diferente."
              : "Posiciona el código QR dentro del marco para escanearlo. El escaneo es automático."}
          </p>
        </div>

        {/* Botón cancelar */}
        <Button
          variant="outline"
          onClick={handleClose}
          className="w-full border-green-500 text-green-700 hover:bg-green-50 font-semibold"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
