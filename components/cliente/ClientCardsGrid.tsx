import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { IClientCard } from "@shared";
import { Search, MapPin, Calendar, Star } from "lucide-react";

interface ClientCardsGridProps {
  cards: IClientCard[];
  onCardSelect?: (card: IClientCard) => void;
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

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100);
  };

  const getLevelIcon = (level: number) => {
    if (level >= 10) return "👑";
    if (level >= 5) return "🎯";
    if (level >= 3) return "⭐";
    return "🥉";
  };

  const getLevelColor = (level: number) => {
    if (level >= 10) return "from-purple-500 to-pink-600";
    if (level >= 5) return "from-blue-500 to-purple-600";
    if (level >= 3) return "from-green-500 to-blue-600";
    return "from-yellow-500 to-green-600";
  };

  const handleCardClick = (card: IClientCard) => {
    if (onCardSelect) {
      onCardSelect(card);
    }
  };

  const handleVerMas = (e: React.MouseEvent, card: IClientCard) => {
    e.stopPropagation();
    // Aquí puedes navegar a una página de detalles del negocio
    // router.push(`/cliente/negocio/${card.businessId}`);
    console.log("Ver más detalles del negocio:", card.business?.businessName);
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
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => {
          const isSelected = selectedCardId === card.id;
          const hasStampsToRedeem =
            card.availableStamps >= (card.business?.stampsForReward || 0);

          return (
            <Card
              key={card.id}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-1 ${
                isSelected
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : "hover:ring-2 hover:ring-blue-200"
              } ${onCardSelect ? "cursor-pointer" : ""}`}
              onClick={() => handleCardClick(card)}
            >
              {/* Indicador de selección */}
              {isSelected && showSelectionIndicator && (
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

              {/* Header con foto del lugar y nivel */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {/* Foto del lugar */}
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                      {card.business?.logoPath ? (
                        <img
                          src={card.business.logoPath}
                          alt={card.business.businessName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-xl">
                          {card.business?.businessName?.charAt(0) || "N"}
                        </span>
                      )}
                    </div>
                    {/* Badge de nivel */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {card.level}
                      </span>
                    </div>
                  </div>

                  {/* Información del negocio */}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {card.business?.businessName || "Negocio"}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span>{card.business?.type || "Sin categoría"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-600">Nivel</span>
                      <span className="text-lg">
                        {getLevelIcon(card.level)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas de sellos */}
              <div className="grid grid-cols-2 gap-3 mb-4">
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

              {/* Indicador de sellos para canjear */}
              {hasStampsToRedeem && (
                <div className="mb-4">
                  <Badge className="w-full justify-center bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                    🎁 ¡Tienes sellos para canjear!
                  </Badge>
                </div>
              )}

              {/* Barra de progreso */}
              {card.business?.stampsForReward && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progreso a recompensa
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {card.availableStamps}/{card.business.stampsForReward}
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
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎁</span>
                    <p className="text-sm font-medium text-yellow-800">
                      {card.business.rewardDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="border-t border-gray-100 pt-3 mb-4">
                {card.lastStampDate && (
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Último sello:</span>
                    </div>
                    <span className="font-medium">
                      {formatDate(card.lastStampDate)}
                    </span>
                  </div>
                )}
              </div>

              {/* Botón Ver Más */}
              <Button
                onClick={(e) => handleVerMas(e, card)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Ver Más
              </Button>
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
