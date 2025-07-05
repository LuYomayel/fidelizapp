import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Alert } from "../../components/ui/alert";
import { api } from "../../lib/api-client";
import { IStamp } from "@shared";

const SALE_PRESETS = [
  {
    name: "Café Chico",
    value: 500,
    emoji: "☕",
    color: "bg-amber-50 border-amber-200",
  },
  {
    name: "Café Grande",
    value: 800,
    emoji: "☕",
    color: "bg-amber-50 border-amber-200",
  },
  {
    name: "Desayuno",
    value: 1500,
    emoji: "🍳",
    color: "bg-orange-50 border-orange-200",
  },
  {
    name: "Almuerzo",
    value: 2500,
    emoji: "🍽️",
    color: "bg-green-50 border-green-200",
  },
  {
    name: "Combo Especial",
    value: 3500,
    emoji: "🎯",
    color: "bg-purple-50 border-purple-200",
  },
  {
    name: "Cena",
    value: 4500,
    emoji: "🍽️",
    color: "bg-blue-50 border-blue-200",
  },
];

const QUICK_PRESETS = [
  { name: "Venta Pequeña", value: 1000, emoji: "💰", stamps: "1-2 sellos" },
  { name: "Venta Mediana", value: 2500, emoji: "💎", stamps: "2-3 sellos" },
  { name: "Venta Grande", value: 5000, emoji: "👑", stamps: "3-5 sellos" },
  { name: "Venta Especial", value: 10000, emoji: "🎯", stamps: "5+ sellos" },
];

export default function GenerarCodigoRapidoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedCode, setGeneratedCode] = useState<IStamp | null>(null);
  const [customValue, setCustomValue] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [activeTab, setActiveTab] = useState<"presets" | "quick">("presets");

  const generateCode = async (saleValue: number, description?: string) => {
    setIsLoading(true);
    setError("");

    try {
      console.log("saleValue", saleValue);
      const response = await api.stamps.generateQuick(saleValue);

      if (response.success && response.data) {
        setGeneratedCode(response.data);
      } else {
        throw new Error(response.message || "Error al generar el código");
      }
    } catch (err) {
      console.error("Error generando código:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (preset: (typeof SALE_PRESETS)[0]) => {
    generateCode(preset.value, preset.name);
  };

  const handleQuickPresetClick = (preset: (typeof QUICK_PRESETS)[0]) => {
    generateCode(preset.value, preset.name);
  };

  const handleCustomValue = () => {
    const value = parseInt(customValue);
    if (value > 0) {
      generateCode(value, `Venta personalizada por $${value}`);
      setCustomValue("");
      setShowCustom(false);
    }
  };

  const copyCode = async () => {
    if (generatedCode) {
      try {
        await navigator.clipboard.writeText(generatedCode.code);
        // Mostrar feedback visual
        const button = document.querySelector(".copy-button");
        if (button) {
          button.textContent = "✅ ¡Copiado!";
          setTimeout(() => {
            button.textContent = "📋 Copiar Código";
          }, 2000);
        }
      } catch (err) {
        console.error("Error al copiar:", err);
        alert("Error al copiar el código");
      }
    }
  };

  const getStampCount = (value: number) => {
    if (value >= 5000) return Math.floor(value / 1000);
    if (value >= 2000) return 3;
    if (value >= 1000) return 2;
    return 1;
  };

  const formatExpirationTime = (expiresAt: Date) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (minutes <= 0 && seconds <= 0) {
      return "¡Expirado!";
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (generatedCode) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <div className="text-6xl mb-2">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900">
              ¡Código Generado!
            </h1>
          </div>

          <Card className="p-6 text-center mb-4">
            <div className="text-6xl font-mono font-bold text-blue-600 mb-4 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              {generatedCode.code}
            </div>

            <Badge className="mb-4 text-lg px-4 py-2">
              {generatedCode.stampValue} sello
              {generatedCode.stampValue > 1 ? "s" : ""}
            </Badge>

            <p className="text-gray-600 mb-4 text-lg">
              {generatedCode.description}
            </p>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-600 font-semibold">
                ⏰ Expira en:{" "}
                {formatExpirationTime(
                  new Date(
                    generatedCode.expiresAt ||
                      new Date(Date.now() + 5 * 60 * 1000)
                  )
                )}
              </p>
            </div>

            {generatedCode.qrCode && (
              <div className="mb-6">
                <img
                  src={generatedCode.qrCode}
                  alt="Código QR"
                  className="w-40 h-40 mx-auto border-2 border-gray-200 rounded-lg shadow-md"
                />
                <p className="text-sm text-gray-500 mt-2">
                  El cliente puede escanear este código QR
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={copyCode}
                className="w-full copy-button"
                size="lg"
              >
                📋 Copiar Código
              </Button>

              <Button
                onClick={() => setGeneratedCode(null)}
                variant="outline"
                className="w-full"
              >
                Generar Otro Código
              </Button>
            </div>
          </Card>

          <div className="text-center">
            <Button
              onClick={() => router.push("/admin/dashboard")}
              variant="ghost"
              className="text-gray-500"
            >
              ← Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Generar Código
          </h1>
          <p className="text-gray-600">
            Selecciona el tipo de venta para generar un código rápido
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <div className="flex mb-6 bg-white rounded-lg p-1 shadow-sm">
          <Button
            variant={activeTab === "presets" ? "default" : "ghost"}
            onClick={() => setActiveTab("presets")}
            className="flex-1"
            size="sm"
          >
            🍽️ Productos
          </Button>
          <Button
            variant={activeTab === "quick" ? "default" : "ghost"}
            onClick={() => setActiveTab("quick")}
            className="flex-1"
            size="sm"
          >
            💰 Valores
          </Button>
        </div>

        {/* Presets por productos */}
        {activeTab === "presets" && (
          <div className="space-y-3 mb-6">
            {SALE_PRESETS.map((preset) => (
              <Card key={preset.name} className={`p-4 ${preset.color}`}>
                <Button
                  onClick={() => handlePresetClick(preset)}
                  disabled={isLoading}
                  variant="ghost"
                  className="w-full h-auto p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{preset.emoji}</div>
                    <div className="text-left">
                      <div className="font-semibold">{preset.name}</div>
                      <div className="text-sm text-gray-500">
                        ${preset.value}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {getStampCount(preset.value)} sello
                      {getStampCount(preset.value) > 1 ? "s" : ""}
                    </Badge>
                  </div>
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Presets rápidos */}
        {activeTab === "quick" && (
          <div className="space-y-3 mb-6">
            {QUICK_PRESETS.map((preset) => (
              <Card key={preset.name} className="p-4">
                <Button
                  onClick={() => handleQuickPresetClick(preset)}
                  disabled={isLoading}
                  variant="ghost"
                  className="w-full h-auto p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{preset.emoji}</div>
                    <div className="text-left">
                      <div className="font-semibold">{preset.name}</div>
                      <div className="text-sm text-gray-500">
                        ${preset.value}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{preset.stamps}</Badge>
                  </div>
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Valor personalizado */}
        <Card className="p-4">
          <Button
            onClick={() => setShowCustom(!showCustom)}
            variant="outline"
            className="w-full mb-4"
          >
            💰 Valor Personalizado
          </Button>

          {showCustom && (
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Valor de la venta en pesos"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                min="1"
                className="text-center text-lg"
              />
              <div className="text-center text-sm text-gray-500">
                Recibirá: {getStampCount(parseInt(customValue) || 0)} sello
                {getStampCount(parseInt(customValue) || 0) > 1 ? "s" : ""}
              </div>
              <Button
                onClick={handleCustomValue}
                disabled={
                  isLoading || !customValue || parseInt(customValue) <= 0
                }
                className="w-full"
              >
                {isLoading ? "Generando..." : "Generar Código"}
              </Button>
            </div>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Button
            onClick={() => router.push("/admin/dashboard")}
            variant="ghost"
            className="text-gray-500"
          >
            ← Volver al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
