import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Filters } from "@/components/ui/filters";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { EmployeeSelect } from "@/components/ui/employee-select";
import {
  Gift,
  Clock,
  CheckCircle,
  Timer,
  User,
  Package,
  AlertTriangle,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import {
  IRedemptionDashboard,
  IRewardRedemption,
  RedemptionStatus,
  IEmployee,
} from "@shared";

interface PendingRedemptionsProps {
  dashboard: IRedemptionDashboard | null;
  onRefresh: () => void;
}

export function PendingRedemptions({
  dashboard,
  onRefresh,
}: PendingRedemptionsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRedemption, setSelectedRedemption] =
    useState<IRewardRedemption | null>(null);
  const [showDeliverDialog, setShowDeliverDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );
  const [notes, setNotes] = useState("");
  const [isDelivering, setIsDelivering] = useState(false);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [defaultEmployee, setDefaultEmployee] = useState<IEmployee | null>(
    null
  );

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados para filtros
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

  const handleDeliverRedemption = async () => {
    if (!selectedRedemption || !selectedEmployeeId) {
      toast.error("Por favor selecciona un empleado");
      return;
    }

    try {
      setIsDelivering(true);
      const response = await api.rewards.deliverRedemption(
        selectedRedemption.id,
        selectedEmployeeId,
        notes.trim() || undefined
      );

      if (response.success) {
        toast.success("Recompensa marcada como entregada");
        setShowDeliverDialog(false);
        setSelectedRedemption(null);
        setSelectedEmployeeId(null);
        setNotes("");
        onRefresh(); // Recargar datos
      } else {
        toast.error(response.error || "Error al marcar como entregada");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar la entrega");
    } finally {
      setIsDelivering(false);
    }
  };

  const openDeliverDialog = async (redemption: IRewardRedemption) => {
    try {
      setSelectedRedemption(redemption);

      // Cargar todos los empleados
      const employeesResponse = await api.employees.getAll();
      if (employeesResponse.success && employeesResponse.data) {
        setEmployees(employeesResponse.data.employees);

        // Buscar el empleado por defecto
        const defaultEmp = employeesResponse.data.employees.find(
          (emp) => emp.isDefault
        );
        if (defaultEmp) {
          setDefaultEmployee(defaultEmp);
          setSelectedEmployeeId(defaultEmp.id);
        } else {
          setDefaultEmployee(null);
          setSelectedEmployeeId(null);
        }
      } else {
        setEmployees([]);
        setDefaultEmployee(null);
        setSelectedEmployeeId(null);
      }

      setShowDeliverDialog(true);
    } catch (error) {
      console.error("Error loading employees:", error);
      setEmployees([]);
      setDefaultEmployee(null);
      setSelectedEmployeeId(null);
      setShowDeliverDialog(true);
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

  const filteredPendingRedemptions =
    dashboard?.pendingRedemptions.filter(
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
          .includes(searchTerm.toLowerCase())
    ) || [];

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

      {/* Lista de canjes pendientes */}
      <div className="space-y-4">
        {filteredPendingRedemptions.map((redemption) => (
          <Card
            key={redemption.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Información principal */}
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Gift className="w-6 h-6 text-blue-600" />
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
                          {redemption.client.firstName}{" "}
                          {redemption.client.lastName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatTimeAgo(redemption.redeemedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Código de reclamo */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Código de reclamo
                        </p>
                        <p className="text-xl font-mono font-bold tracking-wider">
                          {redemption.redemptionCode}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Expira en</p>
                        <p
                          className={`text-sm font-semibold ${
                            redemption.expiresAt &&
                            new Date(redemption.expiresAt) < new Date()
                              ? "text-red-600"
                              : "text-orange-600"
                          }`}
                        >
                          {redemption.expiresAt ? (
                            <span className="flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {formatTimeRemaining(
                                new Date(redemption.expiresAt)
                              )}
                            </span>
                          ) : (
                            "Sin expiración"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Package className="w-4 h-4" />
                      {redemption.stampsSpent} sellos gastados
                    </span>
                    <Badge
                      className={`text-xs ${getStatusColor(redemption.status)}`}
                    >
                      {getStatusIcon(redemption.status)}
                      <span className="ml-1 capitalize">
                        {redemption.status}
                      </span>
                    </Badge>
                  </div>
                </div>

                {/* Botón de entrega */}
                <div className="ml-4">
                  <Button
                    onClick={() => openDeliverDialog(redemption)}
                    disabled={redemption.status !== RedemptionStatus.PENDING}
                    className="whitespace-nowrap"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Entregada
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPendingRedemptions.length === 0 && (
          <EmptyState
            icon={Clock}
            title="No hay canjes pendientes"
            description={
              searchTerm
                ? "No se encontraron canjes con ese término de búsqueda"
                : "Todos los canjes han sido procesados"
            }
          />
        )}

        {/* Paginación */}
        {filteredPendingRedemptions.length > 0 && (
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

      {/* Dialog para marcar como entregada */}
      <Dialog open={showDeliverDialog} onOpenChange={setShowDeliverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar recompensa como entregada</DialogTitle>
            <DialogDescription>
              Confirma que has entregado la recompensa al cliente
            </DialogDescription>
          </DialogHeader>

          {selectedRedemption && (
            <div className="space-y-4">
              {/* Información de la recompensa */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">
                  {selectedRedemption.reward.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Cliente: {selectedRedemption.client.firstName}{" "}
                  {selectedRedemption.client.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Código: {selectedRedemption.redemptionCode}
                </p>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee">Entregada por *</Label>
                  <EmployeeSelect
                    employees={employees}
                    selectedEmployeeId={selectedEmployeeId}
                    onEmployeeChange={setSelectedEmployeeId}
                    placeholder="Seleccionar empleado"
                    disabled={isDelivering}
                  />
                  {defaultEmployee &&
                    selectedEmployeeId === defaultEmployee.id && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Se ha pre-seleccionado el empleado por defecto
                      </p>
                    )}
                </div>

                <div>
                  <Label htmlFor="notes">Notas adicionales (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Cualquier observación sobre la entrega..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeliverDialog(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeliverRedemption}
                  disabled={!selectedEmployeeId || isDelivering}
                  className="flex-1"
                >
                  {isDelivering ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Entrega
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
