import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { BusinessType, IClientCardWithReward } from "@shared";
import {
  Search,
  MapPin,
  Calendar,
  Star,
  Coffee,
  Scissors,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";

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
}

export default function ClientCardsGrid({
  cards,
  onCardSelect,
  selectedCardId,
  showSelectionIndicator = true,
}: ClientCardsGridProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [particles, setParticles] = useState<BurstParticle[]>([]);
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

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCards.map((card) => {
          const isSelected = selectedCardId === card.id;
          const progressTarget = card.progressTarget || 10;
          const filled = Math.min(card.availableStamps, progressTarget);
          const BusinessIcon = getBusinessIcon(card.business?.type || "");
          const nearestReward = card.nearestReward;
          const stampsNeeded = nearestReward
            ? Math.max(0, nearestReward.stampsCost - card.availableStamps)
            : 0;

          return (
            <Card
              key={card.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 min-w-[340px] max-w-xl mx-auto ${
                isSelected
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : "hover:ring-2 hover:ring-blue-200"
              } ${onCardSelect ? "cursor-pointer" : ""}`}
              onClick={() => handleCardClick(card)}
            >
              <CardContent className="px-10 py-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                    {card.business?.logoPath ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${card.business.logoPath}`}
                        alt={card.business.businessName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {card.business?.businessName?.charAt(0) || "N"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        {card.business?.businessName || "Negocio"}
                      </h2>
                      <BusinessIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <p className="text-sm text-gray-600">
                      {card.business?.type === BusinessType.OTRO
                        ? card.business?.customType
                        : card.business?.type}
                    </p>
                  </div>
                </div>

                {/* Stamps Section */}
                <div className="text-center mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {filled} de {progressTarget} sellos
                  </p>

                  {/* Leyenda de recompensa */}
                  {nearestReward && stampsNeeded > 0 && (
                    <p className="text-xs text-purple-600 font-medium mb-4">
                      {stampsNeeded} sellos para "{nearestReward.name}"
                    </p>
                  )}
                  {nearestReward && stampsNeeded === 0 && (
                    <p className="text-xs text-green-600 font-medium mb-4">
                      ¡Puedes canjear "{nearestReward.name}"!
                    </p>
                  )}
                  {!nearestReward && (
                    <p className="text-xs text-gray-500 mb-4">
                      No hay recompensas disponibles
                    </p>
                  )}

                  {/* Stamps Grid */}
                  <div className="grid grid-cols-5 gap-3 justify-items-center mb-4">
                    {Array.from({ length: progressTarget }, (_, index) => (
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
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-gray-500">Total acumulado:</span>
                  <span className="font-bold text-purple-600">
                    {card.totalStamps} sellos
                  </span>
                </div>

                {/* Last stamp date */}
                {card.lastStampDate && (
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Último sello:</span>
                    <span className="font-medium">
                      {formatDate(card.lastStampDate)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
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
    </div>
  );
}
