import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Alert } from "../../components/ui/alert";
import { api } from "../../lib/api-client";
import { StampType, PurchaseType, IStamp, CreateStampDto } from "@shared";

export default function GenerarCodigoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedStamp, setGeneratedStamp] = useState<IStamp | null>(null);
  const [formData, setFormData] = useState<CreateStampDto>({
    stampType: StampType.PURCHASE,
    purchaseType: PurchaseType.MEDIUM,
    stampValue: 1,
    description: "",
  });

  const handleGenerateCode = async () => {
    if (!formData.description.trim()) {
      setError("Por favor ingresa una descripción");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.stamps.create(formData);

      if (response.success && response.data) {
        setGeneratedStamp(response.data);
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

  const handleCopyCode = async () => {
    if (generatedStamp) {
      try {
        await navigator.clipboard.writeText(generatedStamp.code);
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

  const handleNewCode = () => {
    setGeneratedStamp(null);
    setFormData({
      stampType: StampType.PURCHASE,
      purchaseType: PurchaseType.MEDIUM,
      stampValue: 1,
      description: "",
    });
    setError("");
  };

  const stampTypeOptions = [
    { value: StampType.PURCHASE, label: "Compra", emoji: "🛒" },
    { value: StampType.VISIT, label: "Visita", emoji: "🚪" },
    { value: StampType.REFERRAL, label: "Referencia", emoji: "👥" },
    { value: StampType.BONUS, label: "Bonus", emoji: "🎁" },
    { value: StampType.SPECIAL, label: "Especial", emoji: "⭐" },
  ];

  const purchaseTypeOptions = [
    { value: PurchaseType.SMALL, label: "Pequeña", emoji: "🥉" },
    { value: PurchaseType.MEDIUM, label: "Mediana", emoji: "🥈" },
    { value: PurchaseType.LARGE, label: "Grande", emoji: "🥇" },
    { value: PurchaseType.SPECIAL, label: "Especial", emoji: "💎" },
  ];

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

  if (generatedStamp) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Código Generado!
            </h1>
            <p className="text-gray-600">
              Comparte este código con tu cliente para que pueda obtener sellos
            </p>
          </div>

          <Card className="p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl font-mono font-bold text-blue-600 mb-4 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                {generatedStamp.code}
              </div>
              <Badge className="mb-4 text-lg px-4 py-2">
                {generatedStamp.stampValue} sello
                {generatedStamp.stampValue > 1 ? "s" : ""}
              </Badge>
              <p className="text-gray-600 mb-4 text-lg">
                {generatedStamp.description}
              </p>

              <div className="flex justify-center space-x-4 mb-4">
                <Badge variant="outline">
                  {
                    stampTypeOptions.find(
                      (t) => t.value === generatedStamp.stampType
                    )?.emoji
                  }{" "}
                  {generatedStamp.stampType}
                </Badge>
                {generatedStamp.purchaseType && (
                  <Badge variant="outline">
                    {
                      purchaseTypeOptions.find(
                        (p) => p.value === generatedStamp.purchaseType
                      )?.emoji
                    }{" "}
                    {generatedStamp.purchaseType}
                  </Badge>
                )}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-red-600 font-semibold">
                  ⏰ Expira en:{" "}
                  {formatExpirationTime(
                    new Date(
                      generatedStamp.expiresAt ||
                        new Date(Date.now() + 5 * 60 * 1000)
                    )
                  )}
                </p>
              </div>
            </div>

            {generatedStamp.qrCode && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-4">
                  O escanea el código QR:
                </p>
                <div className="flex justify-center">
                  <img
                    src={generatedStamp.qrCode}
                    alt="Código QR"
                    className="w-48 h-48 border-2 border-gray-200 rounded-lg shadow-md"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Button
                onClick={handleCopyCode}
                className="w-full copy-button"
                size="lg"
              >
                📋 Copiar Código
              </Button>

              <Button
                onClick={handleNewCode}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Generar Nuevo Código
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push("/admin/generar-codigo-rapido")}
                  variant="ghost"
                  className="w-full"
                >
                  ← Código Rápido
                </Button>
                <Button
                  onClick={() => router.push("/admin/historial-sellos")}
                  variant="ghost"
                  className="w-full"
                >
                  Ver Historial →
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generar Código de Sello
          </h1>
          <p className="text-gray-600">
            Crea un código personalizado que el cliente puede usar para obtener
            sellos
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="stampType">Tipo de Sello</Label>
              <select
                id="stampType"
                value={formData.stampType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stampType: e.target.value as StampType,
                  })
                }
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {stampTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.emoji} {option.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.stampType === StampType.PURCHASE && (
              <div>
                <Label htmlFor="purchaseType">Tipo de Compra</Label>
                <select
                  id="purchaseType"
                  value={formData.purchaseType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purchaseType: e.target.value as PurchaseType,
                    })
                  }
                  className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {purchaseTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.emoji} {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label htmlFor="stampValue">Cantidad de Sellos</Label>
              <select
                id="stampValue"
                value={formData.stampValue.toString()}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stampValue: parseInt(e.target.value),
                  })
                }
                className="w-full mt-2 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num.toString()}>
                    {num} sello{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                type="text"
                placeholder="Ej: Compra de café grande con medialunas"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-2"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Describe la acción que genera este sello
              </p>
            </div>

            {/* Previsualización */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Previsualización:</h3>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">
                    +{formData.stampValue}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    {formData.description || "Descripción del sello"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {
                      stampTypeOptions.find(
                        (t) => t.value === formData.stampType
                      )?.label
                    }
                    {formData.purchaseType &&
                      formData.stampType === StampType.PURCHASE &&
                      ` • ${
                        purchaseTypeOptions.find(
                          (p) => p.value === formData.purchaseType
                        )?.label
                      }`}
                  </p>
                </div>
              </div>
            </div>

            {error && <Alert variant="destructive">{error}</Alert>}

            <Button
              onClick={handleGenerateCode}
              disabled={isLoading || !formData.description.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Generando..." : "Generar Código Personalizado"}
            </Button>
          </div>
        </Card>

        <div className="mt-8 flex justify-center space-x-4">
          <Button
            onClick={() => router.push("/admin/generar-codigo-rapido")}
            variant="outline"
          >
            ← Código Rápido
          </Button>
          <Button
            onClick={() => router.push("/admin/dashboard")}
            variant="ghost"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
