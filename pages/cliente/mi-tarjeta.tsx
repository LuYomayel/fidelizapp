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
import { ProtectedRoute } from "../../components/shared/ProtectedRoute";
import { AuthenticatedLayout } from "../../components/shared/AuthenticatedLayout";

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
      <ProtectedRoute allowedUserTypes={["client"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus tarjetas...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedUserTypes={["client"]}>
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
      </ProtectedRoute>
    );
  }

  if (clientCards.length === 0) {
    return (
      <ProtectedRoute allowedUserTypes={["client"]}>
        <AuthenticatedLayout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No tienes tarjetas aún
              </h2>
              <p className="text-gray-600 mb-6">
                Comienza canjeando tu primer código para crear tu primera
                tarjeta
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
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={["client"]}>
      <AuthenticatedLayout>
        <div className="p-4">
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
                      className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                        selectedCard?.id === card.id
                          ? "ring-2 ring-blue-500 shadow-lg"
                          : "hover:ring-2 hover:ring-blue-200"
                      }`}
                      onClick={() => handleCardSelect(card)}
                    >
                      {/* Indicador de selección */}
                      {selectedCard?.id === card.id && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Header con logo y nivel */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {/*}
                          {card.business?.logoPath ? (
                            <div className="relative">
                              <img
                                src={card.business.logoPath}
                                alt="Logo"
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">
                                  {card.level}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {card.business?.businessName?.charAt(0) || "N"}
                              </span>
                            </div>
                          )}
                          */}
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {card.business?.businessName?.charAt(0) || "N"}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">
                              {card.business?.businessName || "Negocio"}
                            </h3>
                            <div className="flex items-center space-x-1">
                              <span className="text-sm text-gray-600">
                                Nivel {card.level}
                              </span>
                              <span className="text-lg">
                                {getLevelIcon(card.level)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Estadísticas de sellos */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {card.totalStamps}
                          </div>
                          <div className="text-xs text-blue-700 font-medium">
                            Total Sellos
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {card.availableStamps}
                          </div>
                          <div className="text-xs text-green-700 font-medium">
                            Disponibles
                          </div>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      {card.business?.stampsForReward && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Progreso a recompensa
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {card.availableStamps}/
                              {card.business.stampsForReward}
                            </Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500 ease-out"
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

                      {/* Descripción de recompensa */}
                      {card.business?.rewardDescription && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">🎁</span>
                            <p className="text-sm font-medium text-yellow-800">
                              {card.business.rewardDescription}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Información adicional */}
                      <div className="border-t border-gray-100 pt-3">
                        {card.lastStampDate && (
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Último sello:</span>
                            <span className="font-medium">
                              {formatDate(card.lastStampDate)}
                            </span>
                          </div>
                        )}
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
                  <Button
                    onClick={() => router.push("/cliente/canjear-codigo")}
                  >
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
              <Button
                onClick={() => router.push("/")}
                variant="outline"
                size="lg"
              >
                Inicio
              </Button>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
