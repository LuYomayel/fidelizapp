import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filters } from "@/components/ui/filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import {
  Gift,
  Clock,
  CheckCircle,
  Timer,
  Calendar,
  AlertTriangle,
  Package,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import {
  IRewardRedemption,
  RedemptionStatus,
  IRedemptionFilters,
} from "@shared";
import { getImageUrl } from "@/hooks/useConfig";

interface ClientClaimsProps {
  businessId?: number;
  title?: string;
  description?: string;
  className?: string;
}

export default function ClientClaims({
  businessId,
  title = "Mis Reclamos",
  description = "Historial de recompensas que has canjeado",
  className = "",
}: ClientClaimsProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [claims, setClaims] = useState<IRewardRedemption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [businessOptions, setBusinessOptions] = useState<
    { value: string; label: string; count?: number }[]
  >([]);

  useEffect(() => {
    loadClaims();
  }, [businessId, currentPage, itemsPerPage, statusFilter, dateRange]);

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        loadClaims();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setCurrentPage(1);
      loadClaims();
    }
  }, [searchTerm]);

  const loadClaims = async () => {
    try {
      setIsLoading(true);

      const filters: IRedemptionFilters = {
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter && { status: statusFilter as RedemptionStatus }),
        ...(dateRange.from && { dateFrom: dateRange.from }),
        ...(dateRange.to && { dateTo: dateRange.to }),
      };

      const response = await api.rewards.getMyHistory(filters);

      if (response.success && response.data) {
        setClaims(response.data.redemptions || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);

        // Generar opciones de negocio para el filtro
        const businessSet = new Set<string>();
        response.data.redemptions?.forEach((claim) => {
          if (claim.reward.business?.businessName) {
            businessSet.add(claim.reward.business.businessName);
          }
        });
        setBusinessOptions(
          Array.from(businessSet).map((name) => ({
            value: name,
            label: name,
          }))
        );
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

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.redemptionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.reward.business?.businessName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setDateRange({});
    setCurrentPage(1);
  };

  const statusOptions = [
    { value: RedemptionStatus.PENDING, label: "Pendiente" },
    { value: RedemptionStatus.DELIVERED, label: "Entregado" },
    { value: RedemptionStatus.EXPIRED, label: "Expirado" },
    { value: RedemptionStatus.CANCELLED, label: "Cancelado" },
  ];

  const activeFiltersCount = [
    searchTerm,
    statusFilter,
    dateRange.from,
    dateRange.to,
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <LoadingState message="Cargando reclamos..." className={className} />
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Filters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={statusOptions}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={loadClaims}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Lista de reclamos */}
      <div className="space-y-3 sm:space-y-4">
        {filteredClaims.map((claim) => (
          <Card key={claim.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Información principal */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Logo del negocio */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {claim.reward.business?.logoPath ? (
                        <img
                          src={
                            getImageUrl(claim.reward.business.logoPath) || ""
                          }
                          alt={claim.reward.business.businessName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-bold text-lg">
                          {claim.reward.business?.businessName?.charAt(0) ||
                            "N"}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="font-semibold text-base sm:text-lg">
                          {claim.reward.business?.businessName || "Negocio"}
                        </h3>
                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                          {claim.stampsSpent} sellos
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {claim.reward.name}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {claim.reward.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Código: {claim.redemptionCode}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
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
          <EmptyState
            icon={Gift}
            title={
              searchTerm
                ? "No se encontraron reclamos"
                : "No tienes reclamos aún"
            }
            description={
              searchTerm
                ? "No se encontraron reclamos con ese término de búsqueda"
                : "Cuando canjees recompensas, aparecerán aquí"
            }
          />
        )}
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
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
