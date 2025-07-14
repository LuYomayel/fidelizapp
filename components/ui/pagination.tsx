import React from "react";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isLoading?: boolean;
  showItemsPerPage?: boolean;
  showInfo?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  isLoading = false,
  showItemsPerPage = true,
  showInfo = true,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
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
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
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
          onClick={() => onPageChange(1)}
          disabled={isLoading}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span
            key="ellipsis1"
            className="flex items-center px-2 text-gray-500"
          >
            <MoreHorizontal className="w-4 h-4" />
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
          onClick={() => onPageChange(i)}
          disabled={isLoading}
          className={i === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          {i}
        </Button>
      );
    }

    // Última página
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span
            key="ellipsis2"
            className="flex items-center px-2 text-gray-500"
          >
            <MoreHorizontal className="w-4 h-4" />
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
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
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      );
    }

    return pages;
  };

  const getDisplayRange = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return { start, end };
  };

  const { start, end } = getDisplayRange();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Información y controles superiores */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Información de elementos */}
        {showInfo && (
          <div className="text-sm text-gray-600 order-2 sm:order-1">
            Mostrando {start} - {end} de {totalItems} elementos
          </div>
        )}

        {/* Selector de elementos por página */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <span className="text-sm text-gray-600">Mostrar:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">por página</span>
          </div>
        )}
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {generatePageNumbers()}
      </div>

      {/* Información adicional mobile */}
      <div className="text-center text-xs text-gray-500 sm:hidden">
        Página {currentPage} de {totalPages}
      </div>
    </div>
  );
}

export default Pagination;
