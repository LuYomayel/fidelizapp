import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Filters } from "../ui/filters";
import { Pagination } from "../ui/pagination";
import { EmptyState } from "../ui/empty-state";
import { LoadingState } from "../ui/loading-state";
import {
  History,
  Package,
  Calendar,
  Clock,
  Gift,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { api } from "../../lib/api-client";
import { IRedemptionFilters, IStampRedemption, StampType } from "@shared";
import { useConfig, getImageUrl } from "@/hooks/useConfig";
interface ClientRedemptionHistoryProps {
  businessId?: string;
  businessName?: string;
  title?: string;
  description?: string;
  className?: string;
}

interface RedemptionFilters {
  search: string;
  businessId: string;
  stampType: string;
  dateRange: { from?: Date; to?: Date };
}

export default function ClientRedemptionHistory({
  businessId,
  businessName,
  title = "Historial de Canjes",
  description = "Historial de códigos de sellos que has canjeado",
  className = "",
}: ClientRedemptionHistoryProps) {
  const { API_BASE_URL } = useConfig();
  const [history, setHistory] = useState<IStampRedemption[]>([]);
  const [allHistory, setAllHistory] = useState<IStampRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtros
  const [filters, setFilters] = useState<RedemptionFilters>({
    search: "",
    businessId: businessId || "",
    stampType: "",
    dateRange: {},
  });

  // Opciones para filtros
  const [businessOptions, setBusinessOptions] = useState<
    { value: string; label: string; count?: number }[]
  >([]);

  useEffect(() => {
    loadHistory();
  }, [
    businessId,
    currentPage,
    itemsPerPage,
    filters.businessId,
    filters.stampType,
    filters.dateRange,
  ]);

  useEffect(() => {
    if (filters.search) {
      const timeoutId = setTimeout(() => {
        filterHistory();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      filterHistory();
    }
  }, [filters.search, allHistory]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError("");

    try {
      const apiFilters: IRedemptionFilters = {
        page: currentPage,
        limit: itemsPerPage,
        ...(filters.dateRange.from && { dateFrom: filters.dateRange.from }),
        ...(filters.dateRange.to && { dateTo: filters.dateRange.to }),
      };

      const response = await api.clientCards.getHistory(apiFilters);

      if (response.success && response.data) {
        setAllHistory(response.data.redemptions || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);

        // Generar opciones de negocio
        const businessSet = new Set<string>();
        response.data.redemptions?.forEach((redemption) => {
          if (redemption.stamp?.business?.businessName) {
            businessSet.add(redemption.stamp.business.businessName);
          }
        });

        setBusinessOptions(
          Array.from(businessSet).map((name) => ({
            value: name,
            label: name,
          }))
        );

        filterHistory();
      } else {
        throw new Error(response.message || "Error al cargar el historial");
      }
    } catch (err) {
      console.error("Error cargando historial:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = [...allHistory];

    // Filtrar por negocio específico
    if (filters.businessId) {
      filtered = filtered.filter(
        (redemption) =>
          redemption.stamp?.business?.businessName === filters.businessId
      );
    }

    // Filtrar por tipo de sello
    if (filters.stampType) {
      filtered = filtered.filter(
        (redemption) => redemption.stamp?.stampType === filters.stampType
      );
    }

    // Filtrar por búsqueda
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (redemption) =>
          redemption.stamp?.description?.toLowerCase().includes(searchLower) ||
          redemption.stamp?.code?.toLowerCase().includes(searchLower) ||
          redemption.stamp?.business?.businessName
            ?.toLowerCase()
            .includes(searchLower)
      );
    }

    setHistory(filtered);
    setCurrentPage(1);
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

  const getBusinessName = (redemption: IStampRedemption) => {
    return (
      redemption.stamp?.business?.businessName || businessName || "Negocio"
    );
  };

  const getStampTypeColor = (stampType: StampType) => {
    switch (stampType) {
      case StampType.PURCHASE:
        return "bg-green-100 text-green-800";
      case StampType.VISIT:
        return "bg-blue-100 text-blue-800";
      case StampType.REFERRAL:
        return "bg-purple-100 text-purple-800";
      case StampType.BONUS:
        return "bg-yellow-100 text-yellow-800";
      case StampType.SPECIAL:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStampTypeIcon = (stampType: StampType) => {
    switch (stampType) {
      case StampType.PURCHASE:
        return <Package className="w-3 h-3" />;
      case StampType.VISIT:
        return <CheckCircle className="w-3 h-3" />;
      case StampType.REFERRAL:
        return <Gift className="w-3 h-3" />;
      case StampType.BONUS:
        return <AlertTriangle className="w-3 h-3" />;
      case StampType.SPECIAL:
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStampTypeText = (stampType: StampType) => {
    switch (stampType) {
      case StampType.PURCHASE:
        return "Compra";
      case StampType.VISIT:
        return "Visita";
      case StampType.REFERRAL:
        return "Referencia";
      case StampType.BONUS:
        return "Bonus";
      case StampType.SPECIAL:
        return "Especial";
      default:
        return stampType;
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      businessId: businessId || "",
      stampType: "",
      dateRange: {},
    });
  };

  const stampTypeOptions = [
    { value: StampType.PURCHASE, label: "Compra" },
    { value: StampType.VISIT, label: "Visita" },
    { value: StampType.REFERRAL, label: "Referencia" },
    { value: StampType.BONUS, label: "Bonus" },
    { value: StampType.SPECIAL, label: "Especial" },
  ];

  const activeFiltersCount = [
    filters.search,
    filters.businessId && filters.businessId !== (businessId || ""),
    filters.stampType,
    filters.dateRange.from,
    filters.dateRange.to,
  ].filter(Boolean).length;

  // Paginación del lado del cliente
  const totalItemsFiltered = history.length;
  const totalPagesFiltered = Math.ceil(totalItemsFiltered / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHistory = history.slice(startIndex, endIndex);

  if (isLoading) {
    return (
      <LoadingState message="Cargando historial..." className={className} />
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <EmptyState
          icon={History}
          title="Error al cargar el historial"
          description={error}
          action={{
            label: "Reintentar",
            onClick: loadHistory,
          }}
        />
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5" />
              {title}
            </h3>
            <p className="text-gray-600 mt-1">
              {description}
              {businessName && ` • ${businessName}`}
              {totalItems > 0 && ` • ${totalItems} canjes totales`}
            </p>
          </div>

          {!businessName && (
            <Badge variant="outline" className="text-sm">
              Todos los negocios
            </Badge>
          )}
        </div>

        {/* Filtros */}
        <div className="mb-6">
          <Filters
            searchTerm={filters.search}
            onSearchChange={(value) =>
              setFilters((prev) => ({ ...prev, search: value }))
            }
            statusFilter={filters.stampType}
            onStatusChange={(value) =>
              setFilters((prev) => ({ ...prev, stampType: value }))
            }
            statusOptions={stampTypeOptions}
            businessFilter={filters.businessId}
            onBusinessChange={(value) =>
              setFilters((prev) => ({ ...prev, businessId: value }))
            }
            businessOptions={businessOptions}
            dateRange={filters.dateRange}
            onDateRangeChange={(range) =>
              setFilters((prev) => ({ ...prev, dateRange: range }))
            }
            onRefresh={loadHistory}
            onClearFilters={handleClearFilters}
            isLoading={isLoading}
            activeFiltersCount={activeFiltersCount}
          />
        </div>

        {/* Lista de canjes */}
        <div className="space-y-4">
          {currentHistory.map((redemption) => (
            <div
              key={redemption.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center space-x-4">
                {/* Logo del negocio */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden">
                  {redemption.stamp?.business?.logoPath ? (
                    <img
                      src={
                        getImageUrl(redemption.stamp.business.logoPath) || ""
                      }
                      alt={redemption.stamp.business.businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-blue-600 font-bold text-lg">
                      {redemption.stamp?.business?.businessName?.charAt(0) ||
                        "N"}
                    </span>
                  )}
                </div>

                {/* Información del canje */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-base">
                      {getBusinessName(redemption)}
                    </h4>
                    {redemption.stamp?.stampType && (
                      <Badge
                        className={`text-xs ${getStampTypeColor(
                          redemption.stamp.stampType
                        )}`}
                      >
                        {getStampTypeIcon(redemption.stamp.stampType)}
                        <span className="ml-1">
                          {getStampTypeText(redemption.stamp.stampType)}
                        </span>
                      </Badge>
                    )}
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                      +{redemption.stamp?.stampValue || 1} sellos
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    {redemption.stamp?.description || "Canje de sello"}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Código: {redemption.stamp?.code}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(redemption.redeemedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(redemption.redeemedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">
                  {redemption.stamp?.stampType === StampType.PURCHASE
                    ? "Compra"
                    : redemption.stamp?.stampType === StampType.VISIT
                    ? "Visita"
                    : "Otro"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío */}
        {currentHistory.length === 0 && (
          <div className="mt-6">
            <EmptyState
              icon={History}
              title={
                filters.search
                  ? "No se encontraron canjes"
                  : "No hay canjes registrados"
              }
              description={
                filters.search
                  ? "No se encontraron canjes con los filtros aplicados"
                  : businessName
                  ? `Aún no has canjeado códigos en ${businessName}`
                  : "Aún no has canjeado códigos en ningún negocio"
              }
            />
          </div>
        )}

        {/* Paginación */}
        {totalItemsFiltered > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPagesFiltered}
              totalItems={totalItemsFiltered}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              isLoading={isLoading}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
