import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Clock,
  CheckCircle,
  Search,
  Timer,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Package,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import { IRewardRedemption, RedemptionStatus } from "@shared";

export default function ClientClaims() {
  const [isLoading, setIsLoading] = useState(true);
  const [claims, setClaims] = useState<IRewardRedemption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setIsLoading(true);
      const response = await api.rewards.getMyHistory();

      if (response.success && response.data) {
        setClaims(response.data.redemptions || []);
      } else {
        toast.error("Error al cargar tus reclamos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return `Hace ${diffDays}d`;
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const timeLeft = new Date(expiresAt).getTime() - now.getTime();

    if (timeLeft <= 0) return "Expirado";

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStatusColor = (status: RedemptionStatus) => {
    switch (status) {
      case RedemptionStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case RedemptionStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case RedemptionStatus.EXPIRED:
        return "bg-red-100 text-red-800";
      case RedemptionStatus.CANCELLED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: RedemptionStatus) => {
    switch (status) {
      case RedemptionStatus.PENDING:
        return <Clock className="w-3 h-3" />;
      case RedemptionStatus.DELIVERED:
        return <CheckCircle className="w-3 h-3" />;
      case RedemptionStatus.EXPIRED:
        return <AlertTriangle className="w-3 h-3" />;
      case RedemptionStatus.CANCELLED:
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: RedemptionStatus) => {
    switch (status) {
      case RedemptionStatus.PENDING:
        return "Pendiente";
      case RedemptionStatus.DELIVERED:
        return "Entregado";
      case RedemptionStatus.EXPIRED:
        return "Expirado";
      case RedemptionStatus.CANCELLED:
        return "Cancelado";
      default:
        return status;
    }
  };

  const filteredClaims = claims.filter(
    (claim) =>
      claim.reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.redemptionCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Mis Reclamos
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Historial de recompensas que has canjeado
          </p>
        </div>
        <button
          onClick={loadClaims}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
          Actualizar
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <Input
          placeholder="Buscar por recompensa o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 sm:pl-10 text-sm sm:text-base"
        />
      </div>

      {/* Lista de reclamos */}
      <div className="space-y-3 sm:space-y-4">
        {filteredClaims.map((claim) => (
          <Card key={claim.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Información principal */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0">
                      <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg">
                        {claim.reward.name}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        {claim.reward.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                          {claim.reward.business?.businessName || "Negocio"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {formatTimeAgo(claim.redeemedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Código de reclamo */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Código de reclamo
                        </p>
                        <p className="text-lg sm:text-xl font-mono font-bold tracking-wider break-all">
                          {claim.redemptionCode}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          Estado
                        </p>
                        <Badge
                          className={`text-xs ${getStatusColor(claim.status)}`}
                        >
                          {getStatusIcon(claim.status)}
                          <span className="ml-1">
                            {getStatusText(claim.status)}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                      {claim.stampsSpent} sellos gastados
                    </span>
                    {claim.expiresAt && (
                      <span className="flex items-center gap-1 text-gray-600">
                        <Timer className="w-3 h-3 sm:w-4 sm:h-4" />
                        {claim.status === RedemptionStatus.PENDING ? (
                          <span
                            className={
                              new Date(claim.expiresAt) < new Date()
                                ? "text-red-600"
                                : "text-orange-600"
                            }
                          >
                            {formatTimeRemaining(new Date(claim.expiresAt))}
                          </span>
                        ) : (
                          "Sin expiración"
                        )}
                      </span>
                    )}
                    {claim.status === RedemptionStatus.DELIVERED &&
                      claim.deliveredAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          Entregado {formatTimeAgo(claim.deliveredAt)}
                        </span>
                      )}
                  </div>

                  {/* Información de entrega si fue entregado */}
                  {claim.status === RedemptionStatus.DELIVERED &&
                    claim.deliveredBy && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs sm:text-sm text-green-800">
                          <span className="font-medium">Entregado por:</span>{" "}
                          {claim.deliveredBy}
                          {claim.notes && (
                            <>
                              <br />
                              <span className="font-medium">Notas:</span>{" "}
                              {claim.notes}
                            </>
                          )}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredClaims.length === 0 && (
          <Card className="text-center py-8 sm:py-12">
            <CardContent>
              <Gift className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                {searchTerm
                  ? "No se encontraron reclamos"
                  : "No tienes reclamos aún"}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {searchTerm
                  ? "No se encontraron reclamos con ese término de búsqueda"
                  : "Cuando canjees recompensas, aparecerán aquí"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
