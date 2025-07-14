import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Filters } from "@/components/ui/filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { CheckCircle, User, Calendar, Package, Gift } from "lucide-react";
import { IRedemptionDashboard, RedemptionStatus } from "@shared";

interface DeliveredRedemptionsProps {
  dashboard: IRedemptionDashboard | null;
  onRefresh: () => void;
}

export function DeliveredRedemptions({
  dashboard,
  onRefresh,
}: DeliveredRedemptionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setDateRange({});
    setCurrentPage(1);
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

  const filteredDeliveredRedemptions =
    dashboard?.recentDeliveries.filter(
      (redemption) =>
        redemption.client.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        redemption.client.lastName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        redemption.reward.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        redemption.redemptionCode
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        redemption.deliveredBy?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const statusOptions = [
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

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Filters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        //statusFilter={statusFilter}
        //onStatusChange={setStatusFilter}
        //statusOptions={statusOptions}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={onRefresh}
        //onClearFilters={handleClearFilters}
        isLoading={false}
        //activeFiltersCount={activeFiltersCount}
      />

      {/* Lista de canjes entregados */}
      <div className="space-y-4">
        {filteredDeliveredRedemptions.map((redemption) => (
          <Card
            key={redemption.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {redemption.reward.name}
                    </h3>
                    <p className="text-gray-600">
                      {redemption.reward.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Cliente: {redemption.client.firstName}{" "}
                        {redemption.client.lastName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {redemption.stampsSpent} sellos
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatTimeAgo(redemption.redeemedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Entregada por: {redemption.deliveredBy} •{" "}
                      {redemption.deliveredAt &&
                        formatTimeAgo(redemption.deliveredAt)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Entregada
                  </Badge>
                  <div className="text-xs text-gray-500 text-right">
                    Código: {redemption.redemptionCode}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredDeliveredRedemptions.length === 0 && (
          <EmptyState
            icon={CheckCircle}
            title="No hay canjes entregados"
            description={
              searchTerm
                ? "No se encontraron canjes con ese término de búsqueda"
                : "Los canjes entregados aparecerán aquí"
            }
          />
        )}

        {/* Paginación */}
        {filteredDeliveredRedemptions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            isLoading={false}
          />
        )}
      </div>
    </div>
  );
}
