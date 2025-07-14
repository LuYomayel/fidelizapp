import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { BusinessType, IClientCardWithReward, IReward } from "@shared";
import {
  Search,
  Star,
  Coffee,
  Scissors,
  UtensilsCrossed,
  Sparkles,
  Gift,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShoppingBag,
  Store,
} from "lucide-react";
import { isRewardActive } from "@/utils/rewardUtils";
import RewardRedemptionDialog from "./RewardRedemptionDialog";
import RewardTicketDialog from "./RewardTicketDialog";
import BusinessInfoDialog from "./BusinessInfoDialog";

interface BurstParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface ClientCardsGridProps {
  cards: IClientCardWithReward[];
  onCardSelect?: (card: IClientCardWithReward) => void;
  selectedCardId?: string | number;
  showSelectionIndicator?: boolean;
  onRewardRedeemed?: () => void;
}

export default function ClientCardsGrid({
  cards,
  onCardSelect,
  selectedCardId,
  showSelectionIndicator = true,
  onRewardRedeemed,
}: ClientCardsGridProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [particles, setParticles] = useState<BurstParticle[]>([]);
  const [flippedCards, setFlippedCards] = useState<Set<string | number>>(
    new Set()
  );
  const [activeRewardIndex, setActiveRewardIndex] = useState<{
    [key: string]: number;
  }>({});
  const [selectedReward, setSelectedReward] = useState<IReward | null>(null);
  const [selectedCard, setSelectedCard] =
    useState<IClientCardWithReward | null>(null);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState(false);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [redemptionTicket, setRedemptionTicket] = useState<any>(null);
  const [isBusinessInfoOpen, setIsBusinessInfoOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(
    null
  );

  useEffect(() => {}, [
    isRedeemDialogOpen,
    isTicketDialogOpen,
    redemptionTicket,
    selectedReward,
    selectedCard,
  ]);

  const filteredCards = useMemo(() => {
    if (!searchTerm.trim()) return cards;

    return cards.filter(
      (card) =>
        card.business?.businessName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        card.business?.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cards, searchTerm]);

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getBusinessIcon = (type: string) => {
    switch (type) {
      case BusinessType.CAFETERIA:
        return Coffee;
      case BusinessType.PELUQUERIA:
        return Scissors;
      case BusinessType.RESTAURANT:
        return UtensilsCrossed;
      case BusinessType.MANICURA:
        return Sparkles;
      default:
        return Star;
    }
  };

  const getActiveRewards = (card: IClientCardWithReward) => {
    if (!card.availableRewards) return [];
    return card.availableRewards.filter((reward) => isRewardActive(reward));
  };

  const canRedeemReward = (reward: IReward, card: IClientCardWithReward) => {
    return card.availableStamps >= reward.stampsCost;
  };

  const createBurstEffect = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const newParticles: BurstParticle[] = [];

    // Create 12 particles for the burst effect
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;

      newParticles.push({
        id: Date.now() + i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 60,
        maxLife: 60,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);

    // Animate particles
    const animateParticles = () => {
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1, // gravity
            life: particle.life - 1,
          }))
          .filter((particle) => particle.life > 0)
      );
    };

    const interval = setInterval(() => {
      animateParticles();
    }, 16);

    setTimeout(() => {
      clearInterval(interval);
    }, 1000);
  };

  const handleStampClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number,
    filled: number
  ) => {
    if (index < filled) {
      createBurstEffect(event);
    }
  };

  const handleCardClick = (card: IClientCardWithReward) => {
    if (onCardSelect) {
      onCardSelect(card);
    }
  };

  const handleFlipCard = (cardId: string | number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newFlippedCards = new Set(flippedCards);
    if (newFlippedCards.has(cardId)) {
      newFlippedCards.delete(cardId);
    } else {
      newFlippedCards.add(cardId);
      // Inicializar el índice de recompensa activa si no existe
      if (!activeRewardIndex[cardId]) {
        setActiveRewardIndex((prev) => ({ ...prev, [cardId]: 0 }));
      }
    }
    setFlippedCards(newFlippedCards);
  };

  const handleRewardNavigation = (
    cardId: string | number,
    direction: "prev" | "next",
    totalRewards: number
  ) => {
    setActiveRewardIndex((prev) => {
      const currentIndex = prev[cardId] || 0;
      let newIndex;

      if (direction === "next") {
        newIndex = currentIndex + 1 >= totalRewards ? 0 : currentIndex + 1;
      } else {
        newIndex = currentIndex - 1 < 0 ? totalRewards - 1 : currentIndex - 1;
      }

      return { ...prev, [cardId]: newIndex };
    });
  };

  const openRedeemDialog = (reward: IReward, card: IClientCardWithReward) => {
    setSelectedReward(reward);
    setSelectedCard(card);
    setIsRedeemDialogOpen(true);
  };

  const openBusinessInfo = (businessId: number) => {
    setSelectedBusinessId(businessId);
    setIsBusinessInfoOpen(true);
  };

  const handleRedemptionSuccess = (ticket: any) => {
    setTimeout(() => {
      setRedemptionTicket(ticket);
      setIsTicketDialogOpen(true);
    }, 100);
  };

  const renderStampsGrid = (
    progressTarget: number,
    filled: number,
    BusinessIcon: any
  ) => {
    const stampsPerRow = 5; // Máximo 5 sellos por fila
    const rows = Math.ceil(progressTarget / stampsPerRow);

    return (
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, rowIndex) => {
          const stampsInThisRow = Math.min(
            stampsPerRow,
            progressTarget - rowIndex * stampsPerRow
          );

          return (
            <div key={rowIndex} className="flex justify-center gap-3">
              {Array.from({ length: stampsInThisRow }, (_, colIndex) => {
                const index = rowIndex * stampsPerRow + colIndex;
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStampClick(e, index, filled);
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      index < filled
                        ? "bg-purple-600 text-white shadow-lg hover:bg-purple-700 hover:scale-110 cursor-pointer"
                        : "bg-gray-200 text-gray-400 cursor-default"
                    }`}
                    disabled={index >= filled}
                  >
                    <BusinessIcon className="w-6 h-6" />
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎫</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No tienes tarjetas aún
        </h3>
        <p className="text-gray-600">
          Comienza canjeando tu primer código para crear tu primera tarjeta
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6">
      {/* Burst particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="fixed w-2 h-2 bg-purple-500 rounded-full pointer-events-none z-50"
          style={{
            left: particle.x - 4,
            top: particle.y - 4,
            opacity: particle.life / particle.maxLife,
            transform: `scale(${particle.life / particle.maxLife})`,
          }}
        />
      ))}

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Buscar por nombre del negocio o tipo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contador de resultados */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {filteredCards.length} de {cards.length} tarjetas
        </p>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchTerm("")}
            className="text-blue-600 hover:text-blue-700"
          >
            Limpiar búsqueda
          </Button>
        )}
      </div>

      {/* Grid de tarjetas - Mobile first: 1 columna, md: 2 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {filteredCards.map((card) => {
          const cardId = card.id || 0;
          const isSelected = selectedCardId === cardId;
          const isFlipped = flippedCards.has(cardId);
          const progressTarget = card.progressTarget || 10;
          const filled = Math.min(card.availableStamps, progressTarget);
          const BusinessIcon = getBusinessIcon(card.business?.type || "");
          const nearestReward = card.nearestReward;
          const stampsNeeded = nearestReward
            ? Math.max(0, nearestReward.stampsCost - card.availableStamps)
            : 0;

          const activeRewards = getActiveRewards(card);
          const currentRewardIndex = activeRewardIndex[cardId] || 0;
          const currentReward = activeRewards[currentRewardIndex];

          return (
            <div
              key={cardId}
              className="perspective-1000 w-full mx-auto h-[600px]"
              style={{ perspective: "1000px" }}
            >
              <div
                className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Parte frontal de la tarjeta */}
                <Card
                  className={`absolute inset-0 w-full h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backface-hidden border-2 ${
                    isSelected
                      ? "ring-2 ring-blue-500 shadow-lg border-blue-200"
                      : "hover:ring-2 hover:ring-blue-200 border-gray-200"
                  } ${onCardSelect ? "cursor-pointer" : ""}`}
                  onClick={() => handleCardClick(card)}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                        {card.business?.logoPath ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${card.business.logoPath}`}
                            alt={card.business.businessName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-xl">
                            {card.business?.businessName?.charAt(0) || "N"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold text-gray-900 truncate">
                            {card.business?.businessName || "Negocio"}
                          </h2>
                          <BusinessIcon className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openBusinessInfo(
                                Number(card.business?.id || card.businessId)
                              );
                            }}
                            className="p-1 h-auto text-blue-600 hover:text-blue-700"
                            title="Ver información del negocio"
                          >
                            <Store className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {card.business?.type === BusinessType.OTRO
                            ? card.business?.customType
                            : card.business?.type}
                        </p>
                      </div>
                    </div>

                    {/* Progress info */}
                    <div className="text-center mb-6">
                      <p className="text-lg font-semibold text-gray-700 mb-2">
                        {filled} de {progressTarget} sellos
                      </p>

                      {/* Leyenda de recompensa */}
                      {nearestReward && stampsNeeded > 0 && (
                        <p className="text-sm text-purple-600 font-medium">
                          {stampsNeeded} sellos para "{nearestReward.name}"
                        </p>
                      )}
                      {nearestReward && stampsNeeded === 0 && (
                        <p className="text-sm text-green-600 font-medium">
                          ¡Puedes canjear "{nearestReward.name}"!
                        </p>
                      )}
                      {!nearestReward && (
                        <p className="text-sm text-gray-500">
                          No hay recompensas disponibles
                        </p>
                      )}
                    </div>

                    {/* Stamps Grid - Centrado y con espacio flex */}
                    <div className="flex-1 flex items-center justify-center mb-6">
                      {renderStampsGrid(progressTarget, filled, BusinessIcon)}
                    </div>

                    {/* Stats - Compactas */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Total acumulado:</span>
                        <span className="font-bold text-purple-600">
                          {card.totalStamps} sellos
                        </span>
                      </div>

                      {card.lastStampDate && (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Último sello:</span>
                          <span className="font-medium">
                            {formatDate(card.lastStampDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botón para ver recompensas */}
                    <Button
                      onClick={(e) => handleFlipCard(cardId, e)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                      disabled={activeRewards.length === 0}
                    >
                      <Gift className="w-5 h-5" />
                      {activeRewards.length === 0
                        ? "Sin recompensas"
                        : "Ver Recompensas"}
                      {activeRewards.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 bg-white/20 text-white border-0"
                        >
                          {activeRewards.length}
                        </Badge>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Parte trasera de la tarjeta */}
                <Card
                  className={`absolute inset-0 w-full h-full overflow-hidden transition-all duration-300 hover:shadow-xl backface-hidden border-2 ${
                    isSelected
                      ? "ring-2 ring-blue-500 shadow-lg border-blue-200"
                      : "hover:ring-2 hover:ring-blue-200 border-gray-200"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <CardContent className="p-6 h-full flex flex-col">
                    {/* Header de la parte trasera */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                          <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            Recompensas
                          </h2>
                          <p className="text-sm text-gray-500 truncate">
                            {card.business?.businessName}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={(e) => handleFlipCard(cardId, e)}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 p-2 h-auto"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </Button>
                    </div>

                    {activeRewards.length > 0 ? (
                      <div className="flex-1 flex flex-col">
                        {/* Indicador de recompensa actual */}
                        <div className="text-center mb-4">
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {currentRewardIndex + 1} de {activeRewards.length}
                          </span>
                        </div>

                        {/* Recompensa actual - Contenido principal */}
                        <div className="flex-1 flex flex-col relative">
                          <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                              <ShoppingBag className="w-10 h-10 text-white" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {currentReward?.name}
                            </h3>

                            <p className="text-sm text-gray-600 leading-relaxed">
                              {currentReward?.description}
                            </p>
                          </div>

                          {/* Navegación del carousel - Posicionada en el medio */}
                          {activeRewards.length > 1 && (
                            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
                              <Button
                                onClick={() =>
                                  handleRewardNavigation(
                                    cardId,
                                    "prev",
                                    activeRewards.length
                                  )
                                }
                                variant="outline"
                                size="sm"
                                className="w-10 h-10 p-0 rounded-full bg-white/90 border-gray-300 shadow-lg pointer-events-auto z-10"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </Button>

                              <Button
                                onClick={() =>
                                  handleRewardNavigation(
                                    cardId,
                                    "next",
                                    activeRewards.length
                                  )
                                }
                                variant="outline"
                                size="sm"
                                className="w-10 h-10 p-0 rounded-full bg-white/90 border-gray-300 shadow-lg pointer-events-auto z-10"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {/* Información de sellos */}
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Tus sellos
                                </p>
                                <p className="text-2xl font-bold text-purple-600">
                                  {card.availableStamps}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">
                                  Necesitas
                                </p>
                                <p className="text-2xl font-bold text-orange-600">
                                  {currentReward?.stampsCost || 0}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                  Estado:
                                </span>
                                <Badge
                                  variant={
                                    currentReward &&
                                    canRedeemReward(currentReward, card)
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={
                                    currentReward &&
                                    canRedeemReward(currentReward, card)
                                      ? "bg-green-100 text-green-800 border-green-300"
                                      : "bg-red-100 text-red-800 border-red-300"
                                  }
                                >
                                  {currentReward &&
                                  canRedeemReward(currentReward, card)
                                    ? "¡Disponible!"
                                    : `Faltan ${
                                        (currentReward?.stampsCost || 0) -
                                        card.availableStamps
                                      }`}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* Botón de canje */}
                          {currentReward &&
                            canRedeemReward(currentReward, card) && (
                              <Button
                                onClick={() =>
                                  openRedeemDialog(currentReward, card)
                                }
                                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                              >
                                <Gift className="w-5 h-5" />
                                Canjear Recompensa
                              </Button>
                            )}

                          {/* Indicadores de puntos - Solo si hay más de una recompensa */}
                          {activeRewards.length > 1 && (
                            <div className="flex justify-center gap-2 mt-4">
                              {activeRewards.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                    index === currentRewardIndex
                                      ? "bg-purple-600"
                                      : "bg-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <div className="text-6xl mb-4">🎁</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Sin recompensas disponibles
                        </h3>
                        <p className="text-gray-600">
                          Este negocio aún no ha configurado recompensas
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredCards.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No se encontraron resultados
          </h3>
          <p className="text-gray-600">
            No hay tarjetas que coincidan con "{searchTerm}"
          </p>
        </div>
      )}

      {/* Dialog de confirmación de canje */}
      <RewardRedemptionDialog
        isOpen={isRedeemDialogOpen}
        onClose={() => setIsRedeemDialogOpen(false)}
        reward={selectedReward}
        clientCard={selectedCard}
        onRedemptionSuccess={handleRedemptionSuccess}
      />

      {/* Dialog del ticket de recompensa */}
      <RewardTicketDialog
        isOpen={isTicketDialogOpen}
        onClose={() => {
          setIsTicketDialogOpen(false);
          // Primero actualizar las tarjetas para reflejar los nuevos sellos
          if (onRewardRedeemed) {
            onRewardRedeemed();
          }
        }}
        ticket={redemptionTicket}
      />

      {/* Dialog de información del negocio */}
      {selectedBusinessId && (
        <BusinessInfoDialog
          isOpen={isBusinessInfoOpen}
          onClose={() => setIsBusinessInfoOpen(false)}
          businessId={selectedBusinessId}
        />
      )}
    </div>
  );
}
