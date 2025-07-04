import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Alert } from "../../components/ui/alert";
import { api } from "../../lib/api-client";
import { IClientCard, IStamp, IStampRedemption } from "@shared";

interface RedeemResult {
  clientCard: IClientCard;
  stamp: IStamp;
  redemption?: IStampRedemption;
}

export default function CanjearCodigoPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<RedeemResult | null>(null);

  const handleRedeemCode = async () => {
    if (!code.trim()) {
      setError("Por favor ingresa un código");
      return;
    }

    // Validar formato del código
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setError("El código debe tener exactamente 6 dígitos");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(null);

    try {
      const response = await api.clientCards.redeem({ code: cleanCode });

      if (response.success && response.data) {
        setSuccess(response.data);
        setCode("");
      } else {
        throw new Error(response.message || "Error al canjear el código");
      }
    } catch (err) {
      console.error("Error canjeando código:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewCode = () => {
    setSuccess(null);
    setError("");
    setCode("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading && code.trim()) {
      handleRedeemCode();
    }
  };

  const formatInput = (value: string) => {
    // Solo permitir números y máximo 6 dígitos
    const cleaned = value.replace(/\D/g, "");
    return cleaned.slice(0, 6);
  };

  if (success) {
    const { clientCard, stamp, redemption } = success;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              ¡Código Canjeado!
            </h1>
            <p className="text-gray-600">
              Has obtenido {stamp.stampValue} sello
              {stamp.stampValue > 1 ? "s" : ""} nuevos
            </p>
          </div>

          <Card className="p-8 text-center mb-6">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <div className="text-3xl font-bold text-green-600">
                  +{stamp.stampValue}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {clientCard.business?.businessName || "Negocio"}
              </h2>
              <p className="text-gray-600 mb-4">{stamp.description}</p>
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                {stamp.stampValue} sello{stamp.stampValue > 1 ? "s" : ""} ganado
                {stamp.stampValue > 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">
                Tu Tarjeta Actualizada
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {clientCard.totalStamps}
                  </div>
                  <div className="text-sm text-gray-600">Sellos Totales</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {clientCard.availableStamps}
                  </div>
                  <div className="text-sm text-gray-600">Disponibles</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {clientCard.level}
                  </div>
                  <div className="text-sm text-gray-600">Nivel</div>
                </div>
              </div>

              {/* Mostrar progreso hacia el siguiente nivel */}
              {clientCard.business?.stampsForReward && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600 mb-2">
                    Progreso hacia recompensa:
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (clientCard.availableStamps /
                            clientCard.business.stampsForReward) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {clientCard.availableStamps}/
                    {clientCard.business.stampsForReward} sellos
                  </div>
                  {clientCard.business.rewardDescription && (
                    <p className="text-sm text-gray-600 mt-2">
                      🎁 {clientCard.business.rewardDescription}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Código usado:</strong> {stamp.code}
              </p>
              {redemption?.redeemedAt && (
                <p className="text-xs text-blue-600 mt-1">
                  Canjeado el{" "}
                  {new Date(redemption.redeemedAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <Button onClick={handleNewCode} className="w-full" size="lg">
              Canjear Otro Código
            </Button>

            <Button
              onClick={() => router.push("/cliente/mi-tarjeta")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Ver Mis Tarjetas
            </Button>
          </div>
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
            Canjear Código
          </h1>
          <p className="text-gray-600">
            Ingresa el código que te dio el negocio para obtener sellos
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <Label htmlFor="code">Código de Sello</Label>
              <Input
                id="code"
                type="text"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(formatInput(e.target.value))}
                onKeyPress={handleKeyPress}
                className="text-center text-3xl font-mono tracking-widest"
                maxLength={6}
                autoComplete="off"
              />
              <p className="text-sm text-gray-500 mt-2">
                El código tiene exactamente 6 dígitos numéricos
              </p>
            </div>

            {error && <Alert variant="destructive">{error}</Alert>}

            <Button
              onClick={handleRedeemCode}
              disabled={isLoading || !code.trim() || code.length !== 6}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Canjeando..." : "Canjear Código"}
            </Button>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            También puedes escanear un código QR
          </p>
          <Button
            onClick={() => {
              // Aquí se podría integrar una librería para escanear QR
              alert("Funcionalidad de escaneo QR próximamente");
            }}
            variant="outline"
            className="w-full"
          >
            📱 Escanear Código QR
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push("/cliente/mi-tarjeta")}
            variant="ghost"
            className="text-gray-500"
          >
            ← Ver Mis Tarjetas
          </Button>
        </div>
      </div>
    </div>
  );
}
