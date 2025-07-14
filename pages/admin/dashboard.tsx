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
  RefreshCw,
  CheckCircle,
  Copy,
} from "lucide-react";

import {
  BusinessStatistics,
  Client,
  IClientCard,
  IStampHistory,
  IRewardRedemption,
  IRedemptionDashboard,
} from "@shared";
import { formatearNombreCompleto } from "@/utils";
import { api, apiClient } from "@/lib/api-client";
import { showToast, toast } from "@/lib/toast";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "../../components/shared/ProtectedRoute";
import { AuthenticatedLayout } from "../../components/shared/AuthenticatedLayout";
import HistorialSellos from "../../components/admin/HistorialSellos";
import { DeliveredRedemptions } from "@/components/admin/DeliveredRedemptions";

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string | null>(
    null
  );
  const [lastGeneratedQR, setLastGeneratedQR] = useState<string | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<
    IRewardRedemption[]
  >([]);

  // Estadísticas para MVP
  const [totalClients, setTotalClients] = useState(0);
  const [retentionRate, setRetentionRate] = useState(0);
  const [totalRedemptions, setTotalRedemptions] = useState(0);
  const [totalStamps, setTotalStamps] = useState(0);
  const [stampsGrowth, setStampsGrowth] = useState(0);
  const [clientsGrowth, setClientsGrowth] = useState(0);
  const [rewardsGrowth, setRewardsGrowth] = useState(0);
  const [retentionGrowth, setRetentionGrowth] = useState(0);

  const router = useRouter();

  const [dashboard, setDashboard] = useState<IRedemptionDashboard | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async (reload: boolean = false) => {
    try {
      const response = await api.rewards.getRedemptionDashboard();

      if (response.success && response.data) {
        setDashboard(response.data);
        if (reload) {
          toast.success("Historial de canjes cargado correctamente");
        }
      } else {
        toast.error("Error al cargar el dashboard de reclamos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los datos");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);

      // Cargar estadísticas básicas
      const [clientsResponse, redemptionsResponse, dashboardResponse] =
        await Promise.all([
          api.stamps.getBusinessClients(),
          api.rewards.getRedemptions({ page: 1, limit: 10 }),
          api.businesses.getDashboard(),
        ]);

      if (clientsResponse.success) {
        setTotalClients(clientsResponse.data?.total || 0);
      }

      if (redemptionsResponse.success) {
        setRecentRedemptions(redemptionsResponse.data?.redemptions || []);
        setTotalRedemptions(redemptionsResponse.data?.total || 0);
      }

      if (dashboardResponse.success && dashboardResponse.data) {
        setRetentionRate(dashboardResponse.data.clientRetention || 0);
        setTotalStamps(dashboardResponse.data.totalStamps || 0);
        setStampsGrowth(dashboardResponse.data.stampsGrowth || 0);
        setClientsGrowth(dashboardResponse.data.clientsGrowth || 0);
        setRewardsGrowth(dashboardResponse.data.rewardsGrowth || 0);
        setRetentionGrowth(dashboardResponse.data.retentionGrowth || 0);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      showToast.error("Error al cargar los datos del dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuickCode = async () => {
    try {
      setIsGeneratingCode(true);

      const response = await api.stamps.generateQuick(1000); // Valor de venta de 1000 para generar 1 sello

      if (response.success && response.data) {
        const generatedCode = response.data.code;
        const generatedQR = response.data.qrCode;
        setLastGeneratedCode(generatedCode);
        setLastGeneratedQR(generatedQR || null);
        showToast.success("¡Código generado exitosamente!");
      } else {
        throw new Error(response.error || "Error al generar el código");
      }
    } catch (error) {
      console.error("Error generando código:", error);
      showToast.error("Error al generar el código rápido");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast.success("Código copiado al portapapeles");
    } catch (error) {
      console.error("Error al copiar:", error);
      showToast.error("Error al copiar el código");
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

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    const sign = isPositive ? "+" : "";
    return (
      <span
        className={`flex items-center text-xs mt-1 ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        <TrendingUp className="w-3 h-3 mr-1" />
        {sign}
        {growth.toFixed(1)}% vs mes anterior
      </span>
    );
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Gestión simplificada de tu programa de fidelización
              </p>
            </div>
            <Button
              onClick={cargarDatos}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </Button>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Sellos Emitidos
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {totalStamps}
                </div>
                {formatGrowth(stampsGrowth)}
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
                  {totalClients}
                </div>
                {formatGrowth(clientsGrowth)}
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
                  {totalRedemptions}
                </div>
                {formatGrowth(rewardsGrowth)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retención</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {retentionRate.toFixed(1)}%
                </div>
                {formatGrowth(retentionGrowth)}
              </CardContent>
            </Card>
          </div>

          {/* Sección principal: Generar Código Rápido - Centrada */}
          <div className="flex justify-center mb-3">
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center pb-0">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Generar Sello Rápido
                </CardTitle>
                <CardDescription>
                  Genera un sello de forma instantánea
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center p-1">
                <div className="flex flex-col items-center gap-2 ">
                  <Button
                    onClick={handleGenerateQuickCode}
                    disabled={isGeneratingCode}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    size="lg"
                  >
                    {isGeneratingCode ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generando...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Generar Sello
                      </>
                    )}
                  </Button>

                  {lastGeneratedCode && (
                    <div className="w-full h-full space-y-4">
                      <div className="flex flex-col items-center justify-center gap-4 h-full">
                        {lastGeneratedQR && (
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={lastGeneratedQR}
                              alt="QR Code"
                              className="w-64 h-64 border border-gray-200 rounded-lg"
                            />
                            <span className="text-xs text-gray-500">
                              Código QR
                            </span>
                          </div>
                        )}
                        <div className="flex  items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-mono text-lg font-bold text-green-800">
                            {lastGeneratedCode}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(lastGeneratedCode)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Código generado:</strong> Comparte este código
                          con tu cliente para que pueda canjearlo y obtener 1
                          sello.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sección: Historial con Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-500" />
                Historial
              </CardTitle>
              <CardDescription>
                Revisa el historial de canjes y códigos generados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="stamps" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="stamps">Historial de Sellos</TabsTrigger>
                  <TabsTrigger value="redemptions">
                    Historial de Canjeos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="redemptions" className="space-y-4">
                  <DeliveredRedemptions
                    dashboard={dashboard}
                    onRefresh={() => loadDashboard(true)}
                  />
                </TabsContent>

                <TabsContent value="stamps" className="space-y-4">
                  <HistorialSellos
                    limit={10}
                    showFilters={true}
                    showStatistics={false}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Comentado para MVP - Estadísticas principales
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
            // ... resto de estadísticas
          </div>
          */}

          {/* Comentado para MVP - Sección de gestión de sellos completa
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
                  // ... botones de gestión completa
                </div>
              </CardContent>
            </Card>
            // ... resto de secciones
          </div>
          */}

          {/* Comentado para MVP - Clientes recientes y actividad
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            // ... secciones de clientes y actividad
          </div>
          */}

          {/* Comentado para MVP - Resumen de actividad
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Estado del Programa de Fidelización
              </CardTitle>
              // ... resto del resumen
            </CardHeader>
          </Card>
          */}

          {/* Comentado para MVP - Reclamos pendientes
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-orange-600" />
                Reclamos Pendientes
              </CardTitle>
              // ... resto de reclamos
            </CardHeader>
          </Card>
          */}
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
