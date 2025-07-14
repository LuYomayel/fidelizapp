import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Alert } from "../ui/alert";
import { ClientSelect } from "../ui/client-select";
import { api } from "../../lib/api-client";
import {
  IStamp,
  StampStatus,
  StampType,
  StampSummaryDto,
  StampFilters,
  IStampHistory,
  IClient,
} from "@shared";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: StampStatus.ACTIVE, label: "Activos" },
  { value: StampStatus.USED, label: "Usados" },
  { value: StampStatus.EXPIRED, label: "Expirados" },
  { value: StampStatus.CANCELLED, label: "Cancelados" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Todos los tipos" },
  { value: StampType.PURCHASE, label: "Compra" },
  { value: StampType.VISIT, label: "Visita" },
  { value: StampType.REFERRAL, label: "Referencia" },
  { value: StampType.BONUS, label: "Bonus" },
  { value: StampType.SPECIAL, label: "Especial" },
];

const getStatusColor = (status: StampStatus) => {
  switch (status) {
    case StampStatus.ACTIVE:
      return "bg-green-100 text-green-800";
    case StampStatus.USED:
      return "bg-blue-100 text-blue-800";
    case StampStatus.EXPIRED:
      return "bg-red-100 text-red-800";
    case StampStatus.CANCELLED:
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: StampStatus) => {
  switch (status) {
    case StampStatus.ACTIVE:
      return "🟢";
    case StampStatus.USED:
      return "✅";
    case StampStatus.EXPIRED:
      return "⏰";
    case StampStatus.CANCELLED:
      return "❌";
    default:
      return "❓";
  }
};

interface HistorialSellosProps {
  limit?: number;
  showFilters?: boolean;
  showStatistics?: boolean;
}

export default function HistorialSellos({
  limit = 5,
  showFilters = false,
  showStatistics = false,
}: HistorialSellosProps) {
  const [stamps, setStamps] = useState<IStampHistory[]>([]);
  const [clients, setClients] = useState<IClient[]>([]);
  const [statistics, setStatistics] = useState<StampSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [clientFilter, setClientFilter] = useState<
    string | number | undefined
  >();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStamps();
    if (showStatistics) {
      fetchStatistics();
    }
    // eslint-disable-next-line
  }, [page, statusFilter, typeFilter, searchTerm, clientFilter]);

  const fetchStamps = async () => {
    setIsLoading(true);
    setError("");

    try {
      const filters: StampFilters = {
        page: page,
        limit: limit,
        search: searchTerm || undefined,
        status: (statusFilter as StampStatus) || undefined,
        stampType: (typeFilter as StampType) || undefined,
        clientId: clientFilter,
      };

      const response = await api.stamps.getHistory(filters);

      if (response.success) {
        //console.log(response.data);
        setStamps(response.data?.stamps || []);
        setClients(response.data?.clients || []);
        setTotalPages(response.data?.totalPages || 1);
      } else {
        throw new Error(response.message || "Error al cargar el historial");
      }
    } catch (err) {
      console.error("Error cargando historial:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.stamps.getStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (err) {
      console.error("Error cargando estadísticas:", err);
    }
  };

  const handleCancelStamp = async (stampId: string) => {
    if (!confirm("¿Estás seguro de que quieres cancelar este sello?")) {
      return;
    }

    try {
      const response = await api.stamps.cancel(stampId);
      if (response.success) {
        fetchStamps();
        if (showStatistics) {
          fetchStatistics();
        }
      } else {
        throw new Error(response.message || "Error al cancelar el sello");
      }
    } catch (err) {
      console.error("Error cancelando sello:", err);
      setError(err instanceof Error ? err.message : "Error al cancelar sello");
    }
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

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // Mostrar feedback visual
      const button = document.querySelector(`[data-code="${code}"]`);
      if (button) {
        const originalText = button.textContent;
        button.textContent = "✅";
        setTimeout(() => {
          button.textContent = originalText;
        }, 2000);
      }
    } catch (err) {
      console.error("Error al copiar:", err);
      alert("Error al copiar el código");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setTypeFilter("");
    setClientFilter(undefined);
    setPage(1);
  };

  const hasActiveFilters =
    searchTerm || statusFilter || typeFilter || clientFilter;

  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      {showStatistics && statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.totalGenerated}
            </div>
            <div className="text-sm text-gray-500">Total Generados</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {statistics.totalUsed}
            </div>
            <div className="text-sm text-gray-500">Usados</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {statistics.totalActive}
            </div>
            <div className="text-sm text-gray-500">Activos</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {statistics.totalExpired}
            </div>
            <div className="text-sm text-gray-500">Expirados</div>
          </Card>
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input
              placeholder="Buscar por código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ClientSelect
              clients={clients}
              selectedClientId={clientFilter}
              onClientChange={setClientFilter}
              placeholder="Filtrar por cliente..."
              className="w-full"
            />
            <Button onClick={fetchStamps} disabled={isLoading}>
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Indicador de filtros activos */}
      {showFilters && hasActiveFilters && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 font-medium">
                Filtros activos:
              </span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Código: {searchTerm}
                </Badge>
              )}
              {statusFilter && (
                <Badge variant="secondary" className="text-xs">
                  Estado:{" "}
                  {
                    STATUS_OPTIONS.find((opt) => opt.value === statusFilter)
                      ?.label
                  }
                </Badge>
              )}
              {typeFilter && (
                <Badge variant="secondary" className="text-xs">
                  Tipo:{" "}
                  {TYPE_OPTIONS.find((opt) => opt.value === typeFilter)?.label}
                </Badge>
              )}
              {clientFilter && (
                <Badge variant="secondary" className="text-xs">
                  Cliente:{" "}
                  {
                    clients.find(
                      (c) => c.id?.toString() === clientFilter?.toString()
                    )?.firstName
                  }{" "}
                  {
                    clients.find(
                      (c) => c.id?.toString() === clientFilter?.toString()
                    )?.lastName
                  }
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800"
            >
              Limpiar todo
            </Button>
          </div>
        </div>
      )}

      {/* Contador de resultados y paginación */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando {stamps.length} sellos
          {totalPages > 1 && ` (página ${page} de ${totalPages})`}
        </p>
        {hasActiveFilters && (
          <p className="text-sm text-blue-600">Filtros aplicados</p>
        )}
      </div>

      {/* Lista de sellos */}
      <div className="space-y-4">
        {stamps.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎫</div>
            <p className="text-gray-500">No hay sellos registrados aún</p>
            <p className="text-sm text-gray-400 mt-2">
              Los códigos generados aparecerán aquí
            </p>
          </div>
        ) : (
          stamps.map((stamp) => (
            <Card key={stamp.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-lg font-mono font-bold text-blue-600">
                      {stamp.code}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyCode(stamp.code)}
                      data-code={stamp.code}
                      className="text-xs"
                      title="Copiar código"
                    >
                      📋
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getStatusColor(stamp.status)}>
                        {getStatusIcon(stamp.status)} {stamp.status}
                      </Badge>
                      <Badge variant="outline">
                        {stamp.stampValue} sello
                        {stamp.stampValue > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    {stamp.client && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-600 mb-1">
                          Usado por:{" "}
                          <span className="font-medium text-gray-900">
                            {stamp.client.firstName} {stamp.client.lastName}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {stamp.client.email}
                        </p>
                      </div>
                    )}
                    {/* Esto muestra Venta por y no me interesa ahora. MVP
                    <p className="text-sm text-gray-600 mb-1">
                      {stamp.description}
                    </p>
                    */}
                    <div className="text-xs text-gray-500">
                      Creado: {formatDate(stamp.createdAt!)}
                      {stamp.expiresAt && (
                        <span className="ml-2">
                          • Expira: {formatDate(stamp.expiresAt)}
                        </span>
                      )}
                      {stamp.usedAt && (
                        <span className="ml-2">
                          • Usado: {formatDate(stamp.usedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {stamp.qrCode && (
                    <img
                      src={stamp.qrCode}
                      alt="QR Code"
                      className="w-12 h-12 border border-gray-200 rounded"
                    />
                  )}

                  {stamp.status === StampStatus.ACTIVE && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelStamp(stamp.id!.toString())}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            ← Anterior
          </Button>
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  onClick={() => setPage(pageNum)}
                  size="sm"
                >
                  {pageNum}
                </Button>
              )
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Siguiente →
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Cargando sellos...</p>
        </div>
      )}
    </div>
  );
}
