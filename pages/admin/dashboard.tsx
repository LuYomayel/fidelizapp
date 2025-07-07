import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  BarChart3,
  Users,
  Gift,
  Plus,
  Search,
  Filter,
  Settings,
  LogOut,
  TrendingUp,
  TrendingDown,
  Award,
  Clock,
  Star,
  CreditCard,
  Activity,
  Ticket,
  Zap,
  History,
  QrCode,
} from "lucide-react";

import { BusinessStatistics, Client, IClientCard } from "../../shared";
import { formatearNombreCompleto } from "@/utils";
import { api, apiClient } from "@/lib/api-client";

// Componentes shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProtectedRoute } from "../../components/shared/ProtectedRoute";
import { AuthenticatedLayout } from "../../components/shared/AuthenticatedLayout";

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<BusinessStatistics | null>(null);
  const [recentClients, setRecentClients] = useState<IClientCard[]>([]);

  //Statistics
  const [totalStamps, setTotalStamps] = useState(0);
  const [activeClients, setActiveClients] = useState(0);
  const [rewardsExchanged, setRewardsExchanged] = useState(0);
  const [clientRetention, setClientRetention] = useState(0);
  // Growth percentages
  const [stampsGrowth, setStampsGrowth] = useState(0);
  const [clientsGrowth, setClientsGrowth] = useState(0);
  const [rewardsGrowth, setRewardsGrowth] = useState(0);
  const [retentionGrowth, setRetentionGrowth] = useState(0);

  //Recent Clients
  const router = useRouter();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);

      // TODO: Reemplazar con llamadas reales a API
      //await simularRespuestaAPI(null, 1000);
      const { data, success } = await api.businesses.getDashboard();
      if (success && data) {
        setActiveClients(data.activeClients || 0);
        setTotalStamps(data.totalStamps || 0);
        setRewardsExchanged(data.rewardsExchanged || 0);
        setClientRetention(data.clientRetention || 0);
        setRecentClients(data.recentClients || []);
        // Set growth percentages
        setStampsGrowth(data.stampsGrowth || 0);
        setClientsGrowth(data.clientsGrowth || 0);
        setRewardsGrowth(data.rewardsGrowth || 0);
        setRetentionGrowth(data.retentionGrowth || 0);
        console.log("response", data.totalStamps);
      }

      //setStatistics(ESTADISTICAS_MOCK);
      //setRecentClients(CLIENTES_MOCK.slice(0, 5));
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // TODO: Implementar logout real
    router.push("/admin/login");
  };

  const formatGrowthPercentage = (growth: number) => {
    const isPositive = growth >= 0;
    const sign = isPositive ? "+" : "";
    const color = isPositive ? "text-green-600" : "text-red-600";
    const icon = isPositive ? (
      <TrendingUp className="w-3 h-3 mr-1" />
    ) : (
      <TrendingDown className="w-3 h-3 mr-1" />
    );

    return {
      text: `${sign}${growth.toFixed(1)}% vs mes anterior`,
      color,
      icon,
    };
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={["admin"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  /*
  if (!statistics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Error al cargar estadísticas</p>
          <Button onClick={cargarDatos}>Reintentar</Button>
        </div>
      </div>
    );
  }
  */
  return (
    <ProtectedRoute allowedUserTypes={["admin"]}>
      <Head>
        <title>Dashboard - FirulApp Admin</title>
        <meta
          name="description"
          content="Panel de administración de FirulApp"
        />
      </Head>

      <AuthenticatedLayout>
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sellos Emitidos
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {/* TODO: Agregar sellos emitidos */}
                  {/* {statistics.totalStamps || 124} */}
                  {totalStamps}
                </div>
                <div
                  className={`flex items-center text-xs ${
                    formatGrowthPercentage(stampsGrowth).color
                  }`}
                >
                  {formatGrowthPercentage(stampsGrowth).icon}
                  {formatGrowthPercentage(stampsGrowth).text}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Clientes Activos
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {/* TODO: Agregar clientes activos */}
                  {/* {statistics.activeClients || 45} */}
                  {activeClients}
                </div>
                <div
                  className={`flex items-center text-xs ${
                    formatGrowthPercentage(clientsGrowth).color
                  }`}
                >
                  {formatGrowthPercentage(clientsGrowth).icon}
                  {formatGrowthPercentage(clientsGrowth).text}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Recompensas Canjeadas
                </CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {/* TODO: Agregar recompensas canjeadas */}
                  {/* {statistics.rewardsExchanged || 12} */}
                  {rewardsExchanged}
                </div>
                <div
                  className={`flex items-center text-xs ${
                    formatGrowthPercentage(rewardsGrowth).color
                  }`}
                >
                  {formatGrowthPercentage(rewardsGrowth).icon}
                  {formatGrowthPercentage(rewardsGrowth).text}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retención</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {/* TODO: Agregar retención de clientes */}
                  {/* {statistics.clientRetention || 78.5}% */}
                  {clientRetention}%
                </div>
                <div
                  className={`flex items-center text-xs ${
                    formatGrowthPercentage(retentionGrowth).color
                  }`}
                >
                  {formatGrowthPercentage(retentionGrowth).icon}
                  {formatGrowthPercentage(retentionGrowth).text}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nueva sección de gestión de sellos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-purple-500" />
                  Sistema de Sellos
                </CardTitle>
                <CardDescription>
                  Genera códigos y gestiona sellos para tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/admin/generar-codigo-rapido">
                    <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 text-left">
                      <Zap className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">Código Rápido</div>
                        <div className="text-xs opacity-90">
                          Genera instantáneamente
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/admin/generar-codigo">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <QrCode className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">
                          Código Personalizado
                        </div>
                        <div className="text-xs opacity-70">
                          Con opciones avanzadas
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Link href="/admin/historial-sellos">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                    >
                      <History className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-semibold">Historial</div>
                        <div className="text-xs opacity-70">
                          Ver todos los sellos
                        </div>
                      </div>
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col items-center justify-center space-y-2"
                    disabled
                  >
                    <BarChart3 className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">Estadísticas</div>
                      <div className="text-xs opacity-70">Próximamente</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Acciones Rápidas
                </CardTitle>
                <CardDescription>
                  Gestiona tu programa de fidelización
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/clientes")}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Gestionar Clientes
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/recompensas")}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Configurar Premios
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Cliente
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Ver Reportes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sección de clientes recientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  Clientes Recientes
                </CardTitle>
                <CardDescription>Últimos clientes registrados</CardDescription>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin/clientes")}
                  className="w-fit"
                >
                  Ver Todos
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {client.client?.firstName?.charAt(0) || ""}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {formatearNombreCompleto(
                              client.client?.firstName || "",
                              client.client?.lastName || ""
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {/* TODO: Agregar fecha de creación del cliente */}
                            {/* {formatearFecha(client.createdAt)} */}
                          </p>
                        </div>
                      </div>
                      {/* TODO: Agregar puntos del cliente 
                      <Badge variant="secondary" className="text-xs">
                        {client.points || 0} pts
                      </Badge>
                      */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-500" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>
                  Últimas acciones en tu negocio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Ticket className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Código canjeado</p>
                      <p className="text-xs text-gray-500">Hace 5 minutos</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nuevo cliente</p>
                      <p className="text-xs text-gray-500">Hace 1 hora</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Gift className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Recompensa canjeada</p>
                      <p className="text-xs text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen de actividad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Estado del Programa de Fidelización
              </CardTitle>
              <CardDescription>
                Resumen del rendimiento y próximos pasos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Programa Activo
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tu programa de fidelización está funcionando correctamente
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Ticket className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Sellos Activos
                  </h3>
                  <p className="text-sm text-gray-600">
                    Los clientes están canjeando códigos activamente
                  </p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Crecimiento Constante
                  </h3>
                  <p className="text-sm text-gray-600">
                    El engagement de clientes está en aumento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nueva sección de Reclamos Pendientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-orange-600" />
                Reclamos Pendientes
              </CardTitle>
              <CardDescription>
                Recompensas canjeadas esperando entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Aquí irían los reclamos pendientes - implementar cuando se tenga el endpoint */}
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No hay reclamos pendientes</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => router.push("/admin/reclamos")}
                  >
                    Ver todos los reclamos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
