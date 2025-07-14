import React from "react";
import { Input } from "./input";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  Search,
  Filter,
  RefreshCw,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  businessFilter?: string;
  onBusinessChange?: (value: string) => void;
  businessOptions?: FilterOption[];
  onRefresh?: () => void;
  onClearFilters?: () => void;
  isLoading?: boolean;
  activeFiltersCount?: number;
  className?: string;
}

export function Filters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  statusOptions = [],
  dateRange,
  onDateRangeChange,
  businessFilter,
  onBusinessChange,
  businessOptions = [],
  onRefresh,
  onClearFilters,
  isLoading = false,
  activeFiltersCount = 0,
  className = "",
}: FiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateFromChange = (value: string) => {
    if (onDateRangeChange) {
      onDateRangeChange({
        ...dateRange,
        from: value ? new Date(value) : undefined,
      });
    }
  };

  const handleDateToChange = (value: string) => {
    if (onDateRangeChange) {
      onDateRangeChange({
        ...dateRange,
        to: value ? new Date(value) : undefined,
      });
    }
  };

  const handleStatusChange = (value: string) => {
    if (onStatusChange) {
      onStatusChange(value === "all" ? "" : value);
    }
  };

  const handleBusinessChange = (value: string) => {
    if (onBusinessChange) {
      onBusinessChange(value === "all" ? "" : value);
    }
  };

  const hasAdvancedFilters =
    statusOptions.length > 0 || businessOptions.length > 0 || onDateRangeChange;

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4 space-y-4">
        {/* Fila principal con búsqueda y botones */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 sm:pl-10 text-sm sm:text-base"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            {hasAdvancedFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 sm:gap-2"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-1 sm:gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
            )}

            {onClearFilters && activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-1 sm:gap-2"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Limpiar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filtros avanzados expandibles */}
        {isExpanded && hasAdvancedFilters && (
          <div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Filtro de estado */}
              {statusOptions.length > 0 && onStatusChange && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Estado
                  </label>
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {option.count}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtro de negocio */}
              {businessOptions.length > 0 && onBusinessChange && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Negocio
                  </label>
                  <Select
                    value={businessFilter || "all"}
                    onValueChange={handleBusinessChange}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Todos los negocios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los negocios</SelectItem>
                      {businessOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            {option.count !== undefined && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {option.count}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtro de fecha desde */}
              {onDateRangeChange && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fecha desde
                  </label>
                  <Input
                    type="date"
                    value={dateRange?.from ? formatDate(dateRange.from) : ""}
                    onChange={(e) => handleDateFromChange(e.target.value)}
                    className="text-sm"
                  />
                </div>
              )}

              {/* Filtro de fecha hasta */}
              {onDateRangeChange && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fecha hasta
                  </label>
                  <Input
                    type="date"
                    value={dateRange?.to ? formatDate(dateRange.to) : ""}
                    onChange={(e) => handleDateToChange(e.target.value)}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
