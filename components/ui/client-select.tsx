import { useState, useEffect, useRef } from "react";
import { Input } from "./input";
import { Button } from "./button";
import { IClient } from "@shared";
import { Search, ChevronDown, X } from "lucide-react";

interface ClientSelectProps {
  clients: IClient[];
  selectedClientId?: string | number;
  onClientChange: (clientId: string | number | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function ClientSelect({
  clients,
  selectedClientId,
  onClientChange,
  placeholder = "Seleccionar cliente...",
  className = "",
}: ClientSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedClient = clients.find(
    (client) => client.id?.toString() === selectedClientId?.toString()
  );

  const filteredClients = clients.filter((client) =>
    `${client.firstName} ${client.lastName} ${client.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClientSelect = (client: IClient) => {
    onClientChange(client.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    onClientChange(undefined);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between text-left font-normal"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="truncate">
            {selectedClient
              ? `${selectedClient.firstName} ${selectedClient.lastName}`
              : placeholder}
          </span>
          <div className="flex items-center space-x-2">
            {selectedClientId && (
              <X
                className="h-4 w-4 text-gray-400 hover:text-gray-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm
                  ? "No se encontraron clientes"
                  : "No hay clientes disponibles"}
              </div>
            ) : (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => handleClientSelect(client)}
                >
                  <div className="font-medium">
                    {client.firstName} {client.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{client.email}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
