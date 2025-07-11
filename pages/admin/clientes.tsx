import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Users,
  Star,
  Calendar,
  Mail,
  User,
  ArrowLeft,
  Search,
  Filter,
  TrendingUp,
  Award,
  Clock,
  Activity,
  Plus,
  RefreshCw,
  Grid3X3,
  List,
} from "lucide-react";

import { api } from "@/lib/api-client";
import { IBusinessClient } from "../../shared";

// Componentes shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ProtectedRoute } from "../../components/shared/ProtectedRoute";
import { AuthenticatedLayout } from "../../components/shared/AuthenticatedLayout";

export default function ClientesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<IBusinessClient[]>([]);
  const [filteredClients, setFilteredClients] = useState<IBusinessClient[]>([]);
  const [totalClients, setTotalClients] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const router = useRouter();

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    // Si no hay término de búsqueda, mostrar todos los clientes
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    // Filtrar clientes basado en el término de búsqueda
    const filtered = clients.filter(
      (client) =>
        client.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    console.log("filtered", filtered);
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const cargarClientes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.stamps.getBusinessClients();

      if (response.success && response.data) {
        // El endpoint devuelve directamente el array de clientes
        console.log("response.data", response.data);
        setClients(response.data.clients || []);
        setTotalClients(response.data.total || 0);
      } else {
        setError("Error al cargar los clientes");
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setError("Error al cargar los clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatearFechaCompleta = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerNivelColor = (level: number) => {
    if (level >= 5) return "bg-purple-100 text-purple-800";
    if (level >= 3) return "bg-blue-100 text-blue-800";
    if (level >= 2) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const obtenerNivelTexto = (level: number) => {
    if (level >= 5) return "VIP";
    if (level >= 3) return "Frecuente";
    if (level >= 2) return "Regular";
    return "Nuevo";
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={["admin"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedUserTypes={["admin"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error al cargar clientes
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={cargarClientes} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={["admin"]}>
      <Head>
        <title>Clientes - FirulApp Admin</title>
        <meta name="description" content="Gestión de clientes de tu negocio" />
      </Head>

      <AuthenticatedLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Mis Clientes
                </h1>
                <p className="text-gray-600">
                  Gestiona y visualiza todos tus clientes registrados
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={cargarClientes}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </Button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Clientes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {totalClients}
                </div>
                <p className="text-xs text-muted-foreground">
                  Clientes registrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sellos Totales
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {clients.reduce((sum, client) => sum + client.totalStamps, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sellos acumulados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Canjes Totales
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {clients.reduce((sum, client) => sum + client.usedStamps, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Códigos canjeados
                </p>
              </CardContent>
            </Card>

            {/* Ocultar por el momento para el MVP
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cliente VIP
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {clients.filter((client) => client.level >= 5).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Nivel 5 o superior
                </p>
              </CardContent>
            </Card>
            */}
          </div>

          {/* Búsqueda, filtros y controles de vista */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Buscar Clientes
              </CardTitle>
              <CardDescription>
                Encuentra clientes por nombre o email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 w-full sm:w-auto">
                  <div className="flex-1 sm:w-64">
                    <Input
                      placeholder="Buscar por nombre o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtros
                  </Button>
                </div>

                {/* Controles de vista */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    Vista:
                  </span>
                  <div className="flex border border-gray-300 rounded-md overflow-hidden">
                    <Button
                      variant={viewMode === "cards" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("cards")}
                      className="rounded-none border-0 h-9 px-3"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="rounded-none border-0 h-9 px-3"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de clientes */}
          {filteredClients.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm
                    ? "No se encontraron clientes"
                    : "No hay clientes aún"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? "Intenta con otros términos de búsqueda"
                    : "Los clientes aparecerán aquí cuando canjeen su primer código"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => router.push("/admin/dashboard")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generar Código
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : viewMode === "cards" ? (
            /* Vista de Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {client?.profilePicture ? (
                            <img
                              src={client.profilePicture}
                              alt={`${client.firstName} ${client.lastName}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            `${client.firstName.charAt(0) || ""}${
                              client.lastName.charAt(0) || ""
                            }`
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {client.firstName} {client.lastName}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                        </div>
                      </div>
                      {/* Ocultar por el momento para el MVP
                      <Badge className={obtenerNivelColor(client.level)}>
                        {obtenerNivelTexto(client.level)}
                      </Badge>
                      */}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Estadísticas del cliente */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {client.totalStamps}
                        </div>
                        <div className="text-xs text-gray-600">
                          Sellos Totales
                        </div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {client.availableStamps}
                        </div>
                        <div className="text-xs text-gray-600">Disponibles</div>
                      </div>
                    </div>

                    {/* Información adicional */}
                    <div className="space-y-2 text-sm">
                      {/* Ocultar por el momento para el MVP
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Nivel:</span>
                        <span className="font-medium">{client.level}</span>
                      </div>
                      */}
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Canjes:</span>
                        <span className="font-medium">{client.usedStamps}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Último canje:</span>
                        <span className="font-medium">
                          {client.lastStampDate
                            ? formatearFecha(client.lastStampDate.toString())
                            : "Nunca"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Registrado:</span>
                        <span className="font-medium">
                          {formatearFecha(client.createdAt?.toString() || "")}
                        </span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          // TODO: Implementar vista detallada del cliente
                          console.log("Ver detalles del cliente:", client.id);
                        }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Vista de Tabla */
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                      Cliente
                    </th>
                    {/* Ocultar por el momento para el MVP
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                      Nivel
                    </th>
                    */}
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                      Sellos Totales
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                      Disponibles
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                      Canjes
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                      Último Canje
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                      Registrado
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {filteredClients.map((client) => (
                    <tr
                      key={client.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {client?.profilePicture ? (
                              <img
                                src={client.profilePicture}
                                alt={`${client.firstName} ${client.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              `${client.firstName.charAt(0) || ""}${
                                client.lastName.charAt(0) || ""
                              }`
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {client.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Ocultar por el momento para el MVP
                      <td className="px-4 py-3 border-b border-gray-200">
                        <Badge className={obtenerNivelColor(client.level)}>
                          {obtenerNivelTexto(client.level)}
                        </Badge>
                      </td>
                      */}
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="text-center">
                          <div className="font-bold text-blue-600">
                            {client.totalStamps}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="text-center">
                          <div className="font-bold text-green-600">
                            {client.availableStamps}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="text-center">
                          <div className="font-bold text-purple-600">
                            {client.usedStamps}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <span className="text-sm text-gray-900">
                          {client.lastStampDate
                            ? formatearFecha(client.lastStampDate.toString())
                            : "Nunca"}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <span className="text-sm text-gray-900">
                          {formatearFecha(client.createdAt?.toString() || "")}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implementar vista detallada del cliente
                              console.log(
                                "Ver detalles del cliente:",
                                client.id
                              );
                            }}
                            title="Ver detalles del cliente"
                          >
                            <User className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
