import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Gift,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api-client";
import {
  IRewardRedemption,
  RedemptionStatus,
  IRedemptionFilters,
} from "@shared";

const statusConfig = {
  [RedemptionStatus.PENDING]: {
    label: "Pendiente",
    variant: "secondary" as const,
    icon: Clock,
    color: "text-yellow-600",
  },
  [RedemptionStatus.DELIVERED]: {
    label: "Entregada",
    variant: "default" as const,
    icon: CheckCircle,
    color: "text-green-600",
  },
  [RedemptionStatus.EXPIRED]: {
    label: "Expirada",
    variant: "destructive" as const,
    icon: XCircle,
    color: "text-red-600",
  },
  [RedemptionStatus.CANCELLED]: {
    label: "Cancelada",
    variant: "destructive" as const,
    icon: XCircle,
    color: "text-red-600",
  },
};

export default function ClientRedemptionHistory() {
  const [redemptions, setRedemptions] = useState<IRewardRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IRedemptionFilters>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.rewards.getMyHistory(filters);
      if (response.success && response.data) {
        setRedemptions(response.data.redemptions);
        setTotal(response.data.total);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.error || "Error al cargar el historial");
      }
    } catch (err) {
      setError("Error al cargar el historial");
      console.error("Error loading redemption history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [filters]);

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : (status as RedemptionStatus),
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleRefresh = () => {
    loadHistory();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: RedemptionStatus) => {
    return statusConfig[status] || statusConfig[RedemptionStatus.PENDING];
  };

  const filteredRedemptions = redemptions.filter((redemption) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      redemption.reward.name.toLowerCase().includes(searchLower) ||
      redemption.reward.business.businessName
        .toLowerCase()
        .includes(searchLower) ||
      redemption.redemptionCode.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Cargando historial...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar el historial
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Mi Historial de Reclamos
          </h2>
          <p className="text-gray-600">
            Revisa el estado de todas tus recompensas reclamadas
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por recompensa, negocio o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro por estado */}
            <div className="sm:w-48">
              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusFilter}
              >
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value={RedemptionStatus.PENDING}>
                    Pendientes
                  </SelectItem>
                  <SelectItem value={RedemptionStatus.DELIVERED}>
                    Entregadas
                  </SelectItem>
                  <SelectItem value={RedemptionStatus.EXPIRED}>
                    Expiradas
                  </SelectItem>
                  <SelectItem value={RedemptionStatus.CANCELLED}>
                    Canceladas
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de reclamos */}
      <div className="space-y-4">
        {filteredRedemptions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes reclamos aún
              </h3>
              <p className="text-gray-600">
                {searchTerm || filters.status
                  ? "No se encontraron reclamos con los filtros aplicados"
                  : "Cuando reclames recompensas, aparecerán aquí"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRedemptions.map((redemption) => {
            const statusInfo = getStatusConfig(redemption.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={redemption.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">
                          {redemption.reward.name}
                        </CardTitle>
                        <Badge variant={statusInfo.variant} className="text-xs">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {redemption.reward.description}
                      </p>
                    </div>
                    {redemption.reward.image && (
                      <img
                        src={redemption.reward.image}
                        alt={redemption.reward.name}
                        className="w-16 h-16 rounded-lg object-cover ml-4"
                      />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Información del negocio */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {redemption.reward.business.businessName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          Reclamado:{" "}
                          {formatDate(redemption.redeemedAt.toString())}
                        </span>
                      </div>

                      {redemption.deliveredAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>
                            Entregado:{" "}
                            {formatDate(redemption.deliveredAt.toString())}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Información del reclamo */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Código:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                          {redemption.redemptionCode}
                        </code>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Costo:</span>
                        <span>{redemption.stampsSpent} sellos</span>
                      </div>

                      {redemption.notes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-medium">Notas:</span>{" "}
                          {redemption.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Acciones según el estado */}
                  {redemption.status === RedemptionStatus.PENDING && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Pendiente de entrega:</strong> Muestra este
                          código al negocio para recibir tu recompensa.
                        </p>
                      </div>
                    </div>
                  )}

                  {redemption.status === RedemptionStatus.DELIVERED && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>¡Entregada!</strong> Ya recibiste tu
                          recompensa.
                        </p>
                      </div>
                    </div>
                  )}

                  {redemption.status === RedemptionStatus.EXPIRED && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Expirada:</strong> Este reclamo ya no es
                          válido.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {(filters.page - 1) * filters.limit + 1} a{" "}
                {Math.min(filters.page * filters.limit, total)} de {total}{" "}
                reclamos
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Página {filters.page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
