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
import { Filters } from "@/components/ui/filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Sparkles,
  Trophy,
  Clock,
  Package,
  Gift,
  CheckCircle,
  Store,
} from "lucide-react";
import { api } from "@/lib/api-client";
import {
  IReward,
  IClientCard,
  IRedemptionTicket,
  RewardType,
  IBusiness,
} from "@shared";
import { getImageUrl } from "@/hooks/useConfig";
import {
  isRewardActive,
  isRewardExpired,
  isRewardOutOfStock,
} from "@/utils/rewardUtils";
import RewardRedemptionDialog from "./RewardRedemptionDialog";
import RewardTicketDialog from "./RewardTicketDialog";

interface ClientRewardsListProps {
  businessId?: number;
  title?: string;
  description?: string;
  className?: string;
}

interface RewardFilters {
  search: string;
  businessId: string;
  rewardType: string;
  minStamps: string;
  maxStamps: string;
  availableOnly: boolean;
}

export default function ClientRewardsList({
  businessId,
  title = "Recompensas Disponibles",
  description = "Canjea tus sellos por increíbles recompensas",
  className = "",
}: ClientRewardsListProps) {
  const [rewards, setRewards] = useState<IReward[]>([]);
  const [allRewards, setAllRewards] = useState<IReward[]>([]);
  const [clientCards, setClientCards] = useState<IClientCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filtros
  const [filters, setFilters] = useState<RewardFilters>({
    search: "",
    businessId: "",
    rewardType: "",
    minStamps: "",
    maxStamps: "",
    availableOnly: false,
  });

  // Dialogs
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [redemptionTicket, setRedemptionTicket] = useState<any>(null);
  const [selectedReward, setSelectedReward] = useState<IReward | null>(null);
  const [selectedClientCard, setSelectedClientCard] =
    useState<IClientCard | null>(null);

  // Business selection
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

        // Cargar recompensas para cada negocio
        const allBusinessRewards: IReward[] = [];
        const rewardsCount: Record<number, number> = {};

        for (const card of cardsResponse.data) {
          try {
            const businessId = Number(card.businessId);
            const rewardsResponse = await api.rewards.getByBusiness(businessId);
            if (rewardsResponse.success && rewardsResponse.data) {
              const businessRewards = rewardsResponse.data.map((reward) => ({
                ...reward,
                businessId: businessId,
                business: card.business || ({} as IBusiness),
              }));
              allBusinessRewards.push(...businessRewards);
              rewardsCount[businessId] = rewardsResponse.data.length;
            } else {
              rewardsCount[businessId] = 0;
            }
          } catch (err) {
            rewardsCount[Number(card.businessId)] = 0;
          }
        }

        setAllRewards(allBusinessRewards);
        setBusinessRewardsCount(rewardsCount);

        // Si hay businessId específico, filtrar por ese negocio
        if (businessId) {
          const businessRewards = allBusinessRewards.filter(
            (reward) => reward.businessId === businessId
          );
          setRewards(businessRewards);
        } else if (cardsResponse.data.length > 0) {
          // Si no hay businessId específico, seleccionar el primer negocio
          const firstBusinessId = Number(cardsResponse.data[0].businessId);
          setSelectedBusiness(firstBusinessId);
          const businessRewards = allBusinessRewards.filter(
            (reward) => reward.businessId === firstBusinessId
          );
          setRewards(businessRewards);
        }
      }
    } catch (err) {
      setError("Error al cargar los datos");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [businessId]);

  // Filtrar recompensas cuando cambian los filtros
  useEffect(() => {
    let filtered = allRewards;

    // Filtrar por negocio seleccionado
    if (businessId) {
      filtered = filtered.filter((reward) => reward.businessId === businessId);
    } else if (selectedBusiness) {
      filtered = filtered.filter(
        (reward) => reward.businessId === selectedBusiness
      );
    }

    // Filtrar por negocio específico en filtros
    if (filters.businessId) {
      filtered = filtered.filter(
        (reward) => reward.businessId === Number(filters.businessId)
      );
    }

    // Filtrar por búsqueda
    if (filters.search) {
      filtered = filtered.filter(
        (reward) =>
          reward.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          reward.description
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // Filtrar por tipo de recompensa
    if (filters.rewardType) {
      filtered = filtered.filter(
        (reward) => reward.type === filters.rewardType
      );
    }

    // Filtrar por stamps mínimos
    if (filters.minStamps) {
      filtered = filtered.filter(
        (reward) => reward.stampsCost >= Number(filters.minStamps)
      );
    }

    // Filtrar por stamps máximos
    if (filters.maxStamps) {
      filtered = filtered.filter(
        (reward) => reward.stampsCost <= Number(filters.maxStamps)
      );
    }

    // Filtrar solo disponibles
    if (filters.availableOnly) {
      filtered = filtered.filter(
        (reward) =>
          canRedeemReward(reward) &&
          !isRewardExpired(reward) &&
          !isRewardOutOfStock(reward)
      );
    }

    setRewards(filtered);
    setCurrentPage(1);
  }, [filters, allRewards, selectedBusiness, businessId]);

  const handleRedemptionSuccess = async (ticket: IRedemptionTicket) => {
    console.log("🎯 ClientRewardsList handleRedemptionSuccess called");
    await loadData();

    setTimeout(() => {
      setRedemptionTicket(ticket);
      setIsTicketDialogOpen(true);
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

  const handleBusinessSelect = (businessId: number) => {
    setSelectedBusiness(businessId);
    setFilters((prev) => ({ ...prev, businessId: businessId.toString() }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      businessId: "",
      rewardType: "",
      minStamps: "",
      maxStamps: "",
      availableOnly: false,
    });
  };

  // Opciones para los filtros
  const businessOptions = clientCards.map((card) => ({
    value: card.businessId.toString(),
    label: card.business?.businessName || "Negocio",
    count: businessRewardsCount[Number(card.businessId)] || 0,
  }));

  const rewardTypeOptions = [
    { value: RewardType.DISCOUNT, label: "Descuento" },
    { value: RewardType.FREE_PRODUCT, label: "Producto Gratis" },
    { value: RewardType.OTHER, label: "Otro" },
  ];

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  // Paginación
  const totalItems = rewards.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRewards = rewards.slice(startIndex, endIndex);

  if (loading) {
    return (
      <LoadingState message="Cargando recompensas..." className={className} />
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <EmptyState
          icon={Gift}
          title="Error al cargar recompensas"
          description={error}
          action={{
            label: "Reintentar",
            onClick: loadData,
          }}
        />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Selector de negocio (solo si hay múltiples tarjetas y no hay businessId específico) */}
      {clientCards.length > 1 && !businessId && (
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
                  onClick={() => handleBusinessSelect(Number(card.businessId))}
                >
                  {selectedBusiness === Number(card.businessId) && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {businessRewardsCount[Number(card.businessId)] > 0 && (
                    <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {businessRewardsCount[Number(card.businessId)]}{" "}
                      recompensas
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {/* Logo del negocio */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                        {card.business?.logoPath ? (
                          <img
                            src={getImageUrl(card.business.logoPath) || ""}
                            alt={card.business.businessName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 font-bold text-lg">
                            {card.business?.businessName?.charAt(0) || "N"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {card.business?.businessName || "Negocio"}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {businessRewardsCount[Number(card.businessId)] || 0}{" "}
                          recompensas
                        </p>
                      </div>
                    </div>

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
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Filters
        searchTerm={filters.search}
        onSearchChange={(value) =>
          setFilters((prev) => ({ ...prev, search: value }))
        }
        businessFilter={filters.businessId}
        onBusinessChange={(value) =>
          setFilters((prev) => ({ ...prev, businessId: value }))
        }
        businessOptions={businessOptions}
        onRefresh={loadData}
        onClearFilters={handleClearFilters}
        isLoading={loading}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Lista de recompensas */}
      {!businessId && !selectedBusiness ? (
        <EmptyState
          icon={Store}
          title="Selecciona un negocio"
          description="Elige un negocio de la lista arriba para ver sus recompensas disponibles"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRewards.map((reward) => {
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
                        {!businessId && (
                          <div className="flex items-center gap-2 mb-2">
                            {/* Logo del negocio */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                              {reward.business?.logoPath ? (
                                <img
                                  src={
                                    getImageUrl(reward.business.logoPath) || ""
                                  }
                                  alt={reward.business.businessName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-blue-600 font-bold text-sm">
                                  {reward.business?.businessName?.charAt(0) ||
                                    "N"}
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-700">
                              {reward.business?.businessName}
                            </p>
                          </div>
                        )}
                        <CardTitle className="text-lg line-clamp-2">
                          {reward.name}
                        </CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {reward.description}
                        </CardDescription>
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
                      <div className="flex flex-wrap gap-1">
                        {isExpired && (
                          <Badge variant="destructive" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            Expirada
                          </Badge>
                        )}
                        {isOutOfStock && (
                          <Badge variant="destructive" className="text-xs">
                            <Package className="w-3 h-3 mr-1" />
                            Sin stock
                          </Badge>
                        )}
                        {!isExpired && !isOutOfStock && canRedeem && (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-100 text-green-800"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Disponible
                          </Badge>
                        )}
                      </div>

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

          {/* Paginación */}
          {totalItems > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              isLoading={loading}
            />
          )}

          {/* Estado vacío */}
          {currentRewards.length === 0 && (
            <EmptyState
              icon={Gift}
              title="No hay recompensas disponibles"
              description={
                filters.search
                  ? "No se encontraron recompensas con ese término de búsqueda"
                  : "Este negocio aún no tiene recompensas configuradas"
              }
            />
          )}
        </>
      )}

      {/* Dialogs */}
      <RewardRedemptionDialog
        isOpen={isRedeemDialogOpen}
        onClose={() => setIsRedeemDialogOpen(false)}
        reward={selectedReward}
        clientCard={selectedClientCard as any}
        onRedemptionSuccess={handleRedemptionSuccess}
      />

      <RewardTicketDialog
        isOpen={isTicketDialogOpen}
        onClose={() => setIsTicketDialogOpen(false)}
        ticket={redemptionTicket}
      />
    </div>
  );
}
