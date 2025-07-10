import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { IClientCard } from "@shared";

interface ClientCardProps {
  card: IClientCard;
  isSelected?: boolean;
  onCardSelect?: (card: IClientCard) => void;
  showSelectionIndicator?: boolean;
}

export default function ClientCard({
  card,
  isSelected = false,
  onCardSelect,
  showSelectionIndicator = true,
}: ClientCardProps) {
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

  const getLevelIcon = (level: number) => {
    if (level >= 10) return "👑";
    if (level >= 5) return "🎯";
    if (level >= 3) return "⭐";
    return "🥉";
  };

  const handleClick = () => {
    if (onCardSelect) {
      onCardSelect(card);
    }
  };
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 p-1 ${
        isSelected
          ? "ring-2 ring-blue-500 shadow-lg"
          : "hover:ring-2 hover:ring-blue-200"
      } ${onCardSelect ? "cursor-pointer" : ""}`}
      onClick={handleClick}
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

      {/* Header con logo y nivel */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {card.business?.businessName?.charAt(0) || "N"}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              {card.business?.businessName || "Negocio"}
              <p className="text-xs italic mt-0 pt-0">
                {card.business?.type || "N"}
              </p>
            </h3>
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-600">Nivel {card.level}</span>
              <span className="text-lg">{getLevelIcon(card.level)}</span>
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
          <div className="text-xs text-blue-700 font-medium">Total Sellos</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">
            {card.availableStamps}
          </div>
          <div className="text-xs text-green-700 font-medium">Disponibles</div>
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
  );
}
