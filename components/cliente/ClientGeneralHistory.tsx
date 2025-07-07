import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { api } from "../../lib/api-client";
import { IRedemptionFilters, IStampRedemption, StampType } from "@shared";

interface ClientGeneralHistoryProps {
  className?: string;
}

export default function ClientGeneralHistory({
  className = "",
}: ClientGeneralHistoryProps) {
  const [history, setHistory] = useState<IStampRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadHistory();
  }, [currentPage]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError("");

    try {
      const filters: IRedemptionFilters = {
        page: currentPage,
        limit: itemsPerPage,
      };

      const response = await api.clientCards.getHistory(filters);

      if (response.success && response.data) {
        setHistory(response.data.redemptions || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.total || 0);
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Botón anterior
    if (currentPage > 1) {
      pages.push(
        <Button
          key="prev"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={isLoading}
        >
          ← Anterior
        </Button>
      );
    }

    // Primera página
    if (startPage > 1) {
      pages.push(
        <Button
          key="1"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={isLoading}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
    }

    // Páginas del medio
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          disabled={isLoading}
        >
          {i}
        </Button>
      );
    }

    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 text-gray-500">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={isLoading}
        >
          {totalPages}
        </Button>
      );
    }

    // Botón siguiente
    if (currentPage < totalPages) {
      pages.push(
        <Button
          key="next"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={isLoading}
        >
          Siguiente →
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
        {pages}
      </div>
    );
  };

  const renderHistoryItem = (redemption: IStampRedemption) => (
    <div
      key={redemption.id}
      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-center space-x-4">
        {/* Icono de sello */}
        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
          <span className="text-green-600 font-bold text-lg">
            +{redemption.stamp?.stampValue || 1}
          </span>
        </div>

        {/* Información del canje */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-semibold text-gray-900">
              {redemption.stamp?.description || "Canje de sello"}
            </h4>
            <Badge variant="secondary" className="text-xs">
              {redemption.stamp?.business?.businessName || "Negocio"}
            </Badge>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Código: {redemption.stamp?.code}</span>
            <span>•</span>
            <span>{formatDate(redemption.redeemedAt)}</span>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="text-right">
        <div className="text-sm text-gray-500">
          {redemption.stamp?.stampType === StampType.PURCHASE
            ? "Compra"
            : "Promoción"}
        </div>
      </div>
    </div>
  );

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Historial General de Canjes
          </h3>
          <p className="text-gray-600 mt-1">
            Todos los negocios • {totalItems} canjes totales
          </p>
        </div>

        <Badge variant="outline" className="text-sm">
          Todos los negocios
        </Badge>
      </div>

      {/* Estado de carga */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadHistory} variant="outline">
            Reintentar
          </Button>
        </div>
      )}

      {/* Lista de canjes */}
      {!isLoading && !error && (
        <>
          {history.length > 0 ? (
            <div className="space-y-4">{history.map(renderHistoryItem)}</div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No hay canjes registrados
              </h4>
              <p className="text-gray-600">
                Aún no has canjeado códigos en ningún negocio
              </p>
            </div>
          )}
        </>
      )}

      {/* Paginación */}
      {!isLoading && !error && totalPages > 1 && renderPagination()}

      {/* Información de paginación */}
      {!isLoading && !error && totalItems > 0 && (
        <div className="text-center text-sm text-gray-500 mt-4">
          Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}{" "}
          canjes
        </div>
      )}
    </Card>
  );
}
