import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Alert } from "../../components/ui/alert";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { api } from "../../lib/api-client";
import { IClientCard, IStampRedemption, PaginatedResponse } from "@shared";

export default function MiTarjetaPage() {
  const router = useRouter();
  const [clientCards, setClientCards] = useState<IClientCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<IClientCard | null>(null);
  const [history, setHistory] = useState<IStampRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClientCards();
  }, []);

  const loadClientCards = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.clientCards.getAll();

      if (response.success && response.data) {
        setClientCards(response.data);
        if (response.data.length > 0) {
          setSelectedCard(response.data[0]);
        }
      } else {
        throw new Error(response.message || "Error al cargar las tarjetas");
      }
    } catch (err) {
      console.error("Error cargando tarjetas:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCardHistory = async (businessId: string) => {
    setIsHistoryLoading(true);

    try {
      const response = await api.clientCards.getHistory(businessId);

      if (response.success && response.data) {
        setHistory(response.data); // El backend retorna directamente el array
      } else {
        throw new Error(response.message || "Error al cargar el historial");
      }
    } catch (err) {
      console.error("Error cargando historial:", err);
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleCardSelect = (card: IClientCard) => {
    setSelectedCard(card);
    if (card.businessId) {
      loadCardHistory(card.businessId.toString());
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return "from-purple-500 to-pink-600";
    if (level >= 5) return "from-blue-500 to-purple-600";
    if (level >= 3) return "from-green-500 to-blue-600";
    return "from-yellow-500 to-green-600";
  };

  const getLevelIcon = (level: number) => {
    if (level >= 10) return "👑";
    if (level >= 5) return "🎯";
    if (level >= 3) return "⭐";
    return "🥉";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus tarjetas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
          <Button onClick={loadClientCards} className="w-full">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  if (clientCards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No tienes tarjetas aún
          </h2>
          <p className="text-gray-600 mb-6">
            Comienza canjeando tu primer código para crear tu primera tarjeta
          </p>
          <Button
            onClick={() => router.push("/cliente/canjear-codigo")}
            className="w-full"
            size="lg"
          >
            Canjear Código
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Mis Tarjetas de Fidelización
          </h1>
          <p className="text-gray-600">
            Gestiona tus sellos y recompensas en todos los negocios
          </p>
        </div>

        <Tabs defaultValue="cards" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cards">🎫 Mis Tarjetas</TabsTrigger>
            <TabsTrigger value="history">📜 Historial</TabsTrigger>
            <TabsTrigger value="rewards">🎁 Recompensas</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clientCards.map((card) => (
                <Card
                  key={card.id}
                  className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedCard?.id === card.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleCardSelect(card)}
                >
                  <div
                    className={`bg-gradient-to-br ${getLevelColor(
                      card.level
                    )} text-white rounded-lg p-6 mb-4`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">
                          {card.business?.businessName || "Negocio"}
                        </h3>
                        <p className="text-sm opacity-90">
                          Nivel {card.level} {getLevelIcon(card.level)}
                        </p>
                      </div>
                      {card.business?.logoPath && (
                        <img
                          src={card.business.logoPath}
                          alt="Logo"
                          className="w-12 h-12 rounded-full bg-white/20 p-1"
                        />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-2xl font-bold">
                          {card.totalStamps}
                        </div>
                        <div className="text-xs opacity-75">Total Sellos</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {card.availableStamps}
                        </div>
                        <div className="text-xs opacity-75">Disponibles</div>
                      </div>
                    </div>

                    {card.business?.stampsForReward && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progreso a recompensa</span>
                          <span>
                            {card.availableStamps}/
                            {card.business.stampsForReward}
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-white h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${calculateProgress(
                                card.availableStamps,
                                card.business.stampsForReward
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {card.business?.rewardDescription && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-yellow-800">
                          🎁 {card.business.rewardDescription}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {card.lastStampDate && (
                        <span>
                          Último sello: {formatDate(card.lastStampDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <div className="space-y-4">
              {selectedCard && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">
                    Historial de{" "}
                    {selectedCard.business?.businessName || "Negocio"}
                  </h3>

                  {isHistoryLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-gray-600">Cargando historial...</p>
                    </div>
                  ) : history.length > 0 ? (
                    <div className="space-y-3">
                      {history.map((redemption) => (
                        <div
                          key={redemption.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-green-600 font-bold">
                                +{redemption.stamp?.stampValue || 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">
                                {redemption.stamp?.description}
                              </p>
                              <p className="text-sm text-gray-500">
                                Código: {redemption.stamp?.code}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {formatDate(redemption.redeemedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No hay historial para este negocio
                    </div>
                  )}
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="mt-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Recompensas Disponibles
              </h3>
              <p className="text-gray-600 mb-6">
                Funcionalidad próximamente disponible
              </p>
              <Button onClick={() => router.push("/cliente/canjear-codigo")}>
                Canjear Más Códigos
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex justify-center space-x-4">
          <Button
            onClick={() => router.push("/cliente/canjear-codigo")}
            size="lg"
          >
            Canjear Código
          </Button>
          <Button onClick={() => router.push("/")} variant="outline" size="lg">
            Inicio
          </Button>
        </div>
      </div>
    </div>
  );
}
