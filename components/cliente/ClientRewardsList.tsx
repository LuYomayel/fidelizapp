import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Trophy,
  Clock,
  Package,
  Gift,
  Search,
  Copy,
  CheckCircle,
  Store,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { IReward, IClientCard, IRedemptionTicket } from "@shared";
import {
  isRewardActive,
  isRewardExpired,
  isRewardOutOfStock,
} from "@/utils/rewardUtils";
import RewardRedemptionDialog from "./RewardRedemptionDialog";
import RewardTicketDialog from "./RewardTicketDialog";

interface ClientRewardsListProps {
  businessId?: number;
}

export default function ClientRewardsList({
  businessId,
}: ClientRewardsListProps) {
  const [rewards, setRewards] = useState<IReward[]>([]);
  const [clientCards, setClientCards] = useState<IClientCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [redemptionTicket, setRedemptionTicket] = useState<any>(null);
  const [selectedReward, setSelectedReward] = useState<IReward | null>(null);
  const [selectedClientCard, setSelectedClientCard] =
    useState<IClientCard | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<number | null>(null);
  const [businessRewardsCount, setBusinessRewardsCount] = useState<
    Record<number, number>
  >({});

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar tarjetas del cliente
      const cardsResponse = await api.clientCards.getAll();
      if (cardsResponse.success && cardsResponse.data) {
        setClientCards(cardsResponse.data);

        // Cargar conteo de recompensas para cada negocio
        const rewardsCount: Record<number, number> = {};
        for (const card of cardsResponse.data) {
          try {
            const businessId = Number(card.businessId);
            const rewardsResponse = await api.rewards.getByBusiness(businessId);
            if (rewardsResponse.success && rewardsResponse.data) {
              rewardsCount[businessId] = rewardsResponse.data.length;
            } else {
              rewardsCount[businessId] = 0;
            }
          } catch (err) {
            rewardsCount[Number(card.businessId)] = 0;
          }
        }
        setBusinessRewardsCount(rewardsCount);

        // Si no hay businessId específico y hay tarjetas, seleccionar el primer negocio
        if (!businessId && cardsResponse.data.length > 0) {
          const firstBusinessId = Number(cardsResponse.data[0].businessId);
          setSelectedBusiness(firstBusinessId);
          await loadRewardsForBusiness(firstBusinessId);
        }
      }

      // Cargar recompensas del negocio específico
      if (businessId) {
        await loadRewardsForBusiness(businessId);
      }
    } catch (err) {
      setError("Error al cargar los datos");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRewardsForBusiness = async (businessId: number) => {
    try {
      const response = await api.rewards.getByBusiness(businessId);
      if (response.success && response.data) {
        setRewards(response.data);
      }
    } catch (err) {
      console.error("Error loading rewards for business:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  // Efecto para recargar datos cuando cambie el negocio seleccionado
  useEffect(() => {
    if (selectedBusiness && !businessId) {
      loadRewardsForBusiness(selectedBusiness);
    }
  }, [selectedBusiness, businessId]);

  const handleRedemptionSuccess = async (ticket: IRedemptionTicket) => {
    console.log("🎯 ClientRewardsList handleRedemptionSuccess called");
    console.log("🎫 Ticket received:", ticket);

    // Primero recargar datos para actualizar sellos disponibles
    console.log("🔄 Reloading data first...");
    await loadData();

    // DESPUÉS mostrar el ticket en el nuevo dialog (con delay para que termine la recarga)
    setTimeout(() => {
      console.log("📋 Setting redemption ticket after reload...");
      setRedemptionTicket(ticket);

      console.log("🔓 Opening ticket dialog after reload...");
      setIsTicketDialogOpen(true);

      console.log("🎫 Ticket dialog should be open now");
    }, 100);
  };

  const openRedeemDialog = (reward: IReward) => {
    const clientCard = getClientCardForBusiness(reward.businessId);
    setSelectedReward(reward);
    setSelectedClientCard(clientCard || null);
    setIsRedeemDialogOpen(true);
  };

  const getClientCardForBusiness = (businessId: number) => {
    return clientCards.find((card) => card.businessId === businessId);
  };

  const canRedeemReward = (reward: IReward) => {
    const clientCard = getClientCardForBusiness(reward.businessId);
    return clientCard && clientCard.availableStamps >= reward.stampsCost;
  };

  // Filtrar recompensas por término de búsqueda y negocio seleccionado
  const filteredRewards = rewards.filter((reward) => {
    // Solo mostrar recompensas activas
    if (!isRewardActive(reward)) {
      return false;
    }

    // Si no hay businessId específico, filtrar por negocio seleccionado
    if (!businessId && selectedBusiness) {
      if (reward.businessId !== selectedBusiness) return false;
    }

    // Filtrar por término de búsqueda
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      reward.name.toLowerCase().includes(searchLower) ||
      reward.description.toLowerCase().includes(searchLower) ||
      reward.business.businessName.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Cargando recompensas...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar las recompensas
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadData} variant="outline">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {clientCards.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5" />
              Seleccionar Negocio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientCards.map((card) => (
                <div
                  key={card.id}
                  className={`relative cursor-pointer rounded-lg border-2 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
                    selectedBusiness === Number(card.businessId)
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                  onClick={() => {
                    setSelectedBusiness(Number(card.businessId));
                    loadRewardsForBusiness(Number(card.businessId));
                  }}
                >
                  {/* Indicador de selección */}
                  {selectedBusiness === Number(card.businessId) && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Badge de recompensas disponibles */}
                  {businessRewardsCount[Number(card.businessId)] > 0 && (
                    <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {businessRewardsCount[Number(card.businessId)]}{" "}
                      recompensas
                    </div>
                  )}

                  <div className="p-4">
                    {/* Header con logo y nombre */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        {/*
                        {card.business?.logoPath ? (
                          <img
                            src={`http://localhost:4000${card.business.logoPath}`}
                            alt={card.business.businessName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <Store className="w-6 h-6 text-white" />
                          </div>
                        )}
                        */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <Store className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {card.business?.businessName || "Negocio"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          Nivel {card.level} •{" "}
                          {businessRewardsCount[Number(card.businessId)] || 0}{" "}
                          recompensas
                        </p>
                      </div>
                    </div>

                    {/* Información de sellos */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Sellos disponibles:
                        </span>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold text-blue-600">
                            {card.availableStamps}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Total acumulados:
                        </span>
                        <span className="font-medium text-gray-900">
                          {card.totalStamps}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Usados:</span>
                        <span className="font-medium text-gray-900">
                          {card.usedStamps}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso visual */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progreso</span>
                        <span>
                          {Math.round(
                            (card.usedStamps / card.totalStamps) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              (card.usedStamps / card.totalStamps) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {businessId ? "Recompensas Disponibles" : "Recompensas del Negocio"}
        </h2>
        <p className="text-gray-600">
          {businessId
            ? "Canjea tus sellos por increíbles recompensas"
            : selectedBusiness
            ? `Recompensas de ${
                clientCards.find(
                  (card) => Number(card.businessId) === selectedBusiness
                )?.business?.businessName || "este negocio"
              }`
            : "Selecciona un negocio para ver sus recompensas"}
        </p>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Buscar recompensas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de recompensas */}
      {!businessId && !selectedBusiness ? (
        <Card className="text-center py-12">
          <CardContent>
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Selecciona un negocio
            </h3>
            <p className="text-gray-600">
              Elige un negocio de la lista arriba para ver sus recompensas
              disponibles
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => {
            const clientCard = getClientCardForBusiness(reward.businessId);
            const canRedeem = canRedeemReward(reward);
            const isExpired = isRewardExpired(reward);
            const isOutOfStock = isRewardOutOfStock(reward);

            return (
              <Card
                key={reward.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {reward.name}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {reward.description}
                      </CardDescription>
                      {!businessId && (
                        <p className="text-xs text-gray-500 mt-1">
                          {reward.business.businessName}
                        </p>
                      )}
                    </div>
                    {reward.image && (
                      <img
                        src={reward.image}
                        alt={reward.name}
                        className="w-16 h-16 rounded-lg object-cover ml-4"
                      />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Costo en sellos */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Sellos requeridos:
                      </span>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold">
                          {reward.stampsCost} sellos
                        </span>
                      </div>
                    </div>

                    {/* Sellos disponibles */}
                    {clientCard && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Tienes:</span>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-blue-500" />
                          <span
                            className={`font-semibold ${
                              canRedeem ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {clientCard.availableStamps} sellos
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Estados */}
                    <div className="flex gap-2 flex-wrap">
                      {isExpired && (
                        <Badge variant="destructive" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Expirada
                        </Badge>
                      )}
                      {isOutOfStock && (
                        <Badge variant="secondary" className="text-xs">
                          <Package className="w-3 h-3 mr-1" />
                          Sin stock
                        </Badge>
                      )}
                      {reward.stock !== undefined &&
                        reward.stock !== null &&
                        reward.stock > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Stock: {reward.stock}
                          </Badge>
                        )}
                    </div>

                    {/* Condiciones especiales */}
                    {reward.specialConditions && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        {reward.specialConditions}
                      </div>
                    )}

                    {/* Botón de canje */}
                    <Button
                      onClick={() => openRedeemDialog(reward)}
                      disabled={!canRedeem || isExpired || isOutOfStock}
                      className="w-full"
                      variant={
                        canRedeem && !isExpired && !isOutOfStock
                          ? "default"
                          : "outline"
                      }
                    >
                      {!clientCard ? (
                        "No tienes tarjeta"
                      ) : !canRedeem ? (
                        `Necesitas ${
                          reward.stampsCost - clientCard.availableStamps
                        } sellos más`
                      ) : isExpired ? (
                        "Expirada"
                      ) : isOutOfStock ? (
                        "Sin stock"
                      ) : (
                        <>
                          <Gift className="w-4 h-4 mr-2" />
                          Canjear
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Mensaje si no hay recompensas */}
      {filteredRewards.length === 0 && (businessId || selectedBusiness) && (
        <Card className="text-center py-12">
          <CardContent>
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay recompensas disponibles
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "No se encontraron recompensas con ese término de búsqueda"
                : !selectedBusiness
                ? "Selecciona un negocio para ver sus recompensas"
                : "Este negocio aún no tiene recompensas configuradas"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmación de canje */}
      <RewardRedemptionDialog
        isOpen={isRedeemDialogOpen}
        onClose={() => setIsRedeemDialogOpen(false)}
        reward={selectedReward}
        clientCard={selectedClientCard as any}
        onRedemptionSuccess={handleRedemptionSuccess}
      />

      {/* Dialog del ticket de recompensa */}
      <RewardTicketDialog
        isOpen={isTicketDialogOpen}
        onClose={() => setIsTicketDialogOpen(false)}
        ticket={redemptionTicket}
      />
    </div>
  );
}
