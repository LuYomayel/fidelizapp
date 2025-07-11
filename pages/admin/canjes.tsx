import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Gift,
  Clock,
  CheckCircle,
  Search,
  Timer,
  User,
  Package,
  AlertTriangle,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { api } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import {
  IRedemptionDashboard,
  IRewardRedemption,
  RedemptionStatus,
} from "@shared";

export default function CanjesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<IRedemptionDashboard | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRedemption, setSelectedRedemption] =
    useState<IRewardRedemption | null>(null);
  const [showDeliverDialog, setShowDeliverDialog] = useState(false);
  const [deliveredBy, setDeliveredBy] = useState("");
  const [notes, setNotes] = useState("");
  const [isDelivering, setIsDelivering] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await api.rewards.getRedemptionDashboard();

      if (response.success && response.data) {
        setDashboard(response.data);
      } else {
        toast.error("Error al cargar el dashboard de reclamos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliverRedemption = async () => {
    if (!selectedRedemption || !deliveredBy.trim()) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setIsDelivering(true);
      const response = await api.rewards.deliverRedemption(
        selectedRedemption.id,
        deliveredBy.trim(),
        notes.trim() || undefined
      );

      if (response.success) {
        toast.success("Recompensa marcada como entregada");
        setShowDeliverDialog(false);
        setSelectedRedemption(null);
        setDeliveredBy("");
        setNotes("");
        loadDashboard(); // Recargar datos
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

  const openDeliverDialog = (redemption: IRewardRedemption) => {
    setSelectedRedemption(redemption);
    setShowDeliverDialog(true);
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

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={["admin"]}>
        <AuthenticatedLayout title="Gestión de Canjes">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={["admin"]}>
      <AuthenticatedLayout title="Gestión de Canjes">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Canjes
              </h1>
              <p className="text-gray-600 mt-1">
                Administra las recompensas canjeadas por tus clientes
              </p>
            </div>
            <Button onClick={loadDashboard} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pendientes
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {dashboard?.totalPending || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Entregados
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboard?.totalDelivered || 0}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Expirados
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {dashboard?.totalExpired || 0}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">Canjes Pendientes</TabsTrigger>
              <TabsTrigger value="delivered">Canjes Entregados</TabsTrigger>
            </TabsList>

            {/* Tab de Canjes Pendientes */}
            <TabsContent value="pending" className="space-y-4">
              {/* Barra de búsqueda */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por cliente, recompensa o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

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
                                <p className="text-sm text-gray-600 mb-1">
                                  Expira en
                                </p>
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
                              className={`text-xs ${getStatusColor(
                                redemption.status
                              )}`}
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
                            disabled={
                              redemption.status !== RedemptionStatus.PENDING
                            }
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
                  <Card className="text-center py-12">
                    <CardContent>
                      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay canjes pendientes
                      </h3>
                      <p className="text-gray-600">
                        {searchTerm
                          ? "No se encontraron canjes con ese término de búsqueda"
                          : "Todos los canjes han sido procesados"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tab de Canjes Entregados */}
            <TabsContent value="delivered" className="space-y-4">
              <div className="space-y-4">
                {dashboard?.recentDeliveries.map((redemption) => (
                  <Card key={redemption.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {redemption.reward.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {redemption.client.firstName}{" "}
                              {redemption.client.lastName}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Entregada por: {redemption.deliveredBy} •{" "}
                              {formatTimeAgo(redemption.deliveredAt!)}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Entregada
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                )) || []}

                {(!dashboard?.recentDeliveries ||
                  dashboard.recentDeliveries.length === 0) && (
                  <Card className="text-center py-12">
                    <CardContent>
                      <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No hay canjes entregados
                      </h3>
                      <p className="text-gray-600">
                        Los canjes entregados aparecerán aquí.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

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
                      <Label htmlFor="deliveredBy">Entregada por *</Label>
                      <Input
                        id="deliveredBy"
                        placeholder="Nombre del empleado que entrega"
                        value={deliveredBy}
                        onChange={(e) => setDeliveredBy(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">
                        Notas adicionales (opcional)
                      </Label>
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
                      disabled={!deliveredBy.trim() || isDelivering}
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
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
