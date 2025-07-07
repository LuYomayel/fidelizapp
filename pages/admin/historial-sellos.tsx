import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Alert } from "../../components/ui/alert";
import { Select } from "../../components/ui/select";
import { api } from "../../lib/api-client";
import {
  IStamp,
  StampStatus,
  StampType,
  PurchaseType,
  StampSummaryDto,
  StampFilters,
} from "@shared";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";

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

export default function HistorialSellosPage() {
  const router = useRouter();
  const [stamps, setStamps] = useState<IStamp[]>([]);
  const [statistics, setStatistics] = useState<StampSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStamps();
    fetchStatistics();
  }, [page, statusFilter, typeFilter, searchTerm]);

  const fetchStamps = async () => {
    setIsLoading(true);
    setError("");

    try {
      const filters: StampFilters = {
        page: page,
        limit: 10,
        search: searchTerm || undefined,
        status: (statusFilter as StampStatus) || undefined,
        stampType: (typeFilter as StampType) || undefined,
      };

      const response = await api.stamps.getHistory(filters);
      console.log("response", response);
      if (response.success) {
        setStamps(response.data?.stamps || []);
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
        fetchStatistics();
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

  return (
    <ProtectedRoute allowedUserTypes={["admin"]}>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Historial de Sellos
              </h1>
              <p className="text-gray-600">
                Gestiona y revisa todos los códigos generados
              </p>
            </div>

            {/* Estadísticas */}
            {statistics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
            <Card className="p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Button onClick={fetchStamps} disabled={isLoading}>
                  {isLoading ? "Buscando..." : "Buscar"}
                </Button>
              </div>
            </Card>

            {error && (
              <Alert variant="destructive" className="mb-4">
                {error}
              </Alert>
            )}

            {/* Lista de sellos */}
            <div className="space-y-4">
              {stamps.map((stamp) => (
                <Card key={stamp.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-mono font-bold text-blue-600">
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
                        <p className="text-sm text-gray-600 mb-1">
                          {stamp.description}
                        </p>
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
                          onClick={() =>
                            handleCancelStamp(stamp.id!.toString())
                          }
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {stamps.length === 0 && !isLoading && (
                <Card className="p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <div className="text-6xl mb-2">🎫</div>
                    <h3 className="text-lg font-semibold">No hay sellos</h3>
                    <p className="text-sm">
                      {searchTerm || statusFilter || typeFilter
                        ? "No se encontraron sellos con los filtros aplicados"
                        : "Aún no has generado ningún sello"}
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push("/admin/generar-codigo-rapido")}
                    className="mt-4"
                  >
                    Generar Primer Sello
                  </Button>
                </Card>
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

            {/* Botones de navegación */}
            <div className="flex justify-between mt-8">
              <Button
                onClick={() => router.push("/admin/dashboard")}
                variant="ghost"
              >
                ← Dashboard
              </Button>
              <Button
                onClick={() => router.push("/admin/generar-codigo-rapido")}
              >
                Generar Nuevo Sello
              </Button>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
