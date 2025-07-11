import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Gift,
  TrendingUp,
  Users,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  PowerOff,
  Grid3X3,
  List,
} from "lucide-react";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";
import { api } from "@/lib/api-client";
import { showToast } from "@/lib/toast";
import {
  IReward,
  IRewardRedemption,
  IRewardStatistics,
  RewardType,
} from "@shared";
import { formatDate } from "@/lib/utils";
import {
  isRewardActive,
  isRewardExpired,
  isRewardOutOfStock,
} from "@/utils/rewardUtils";

export default function RecompensasPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [rewards, setRewards] = useState<IReward[]>([]);
  const [statistics, setStatistics] = useState<IRewardStatistics | null>(null);
  const [redemptions, setRedemptions] = useState<IRewardRedemption[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<IReward | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Estados para formularios
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requiredStamps: 10,
    stampsCost: 10,
    type: RewardType.FREE_PRODUCT,
    typeDescription: "",
    image: "",
    expirationDate: "",
    stock: "",
    specialConditions: "",
    active: true,
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [rewardsResponse, statsResponse, redemptionsResponse] =
        await Promise.all([
          api.rewards.getAll(),
          api.rewards.getStatistics(),
          api.rewards.getRedemptions({
            page: 1,
            limit: 10,
          }),
        ]);

      if (rewardsResponse.success) {
        const rewards = rewardsResponse.data || [];

        setRewards(rewards);
      }

      if (statsResponse.success) {
        setStatistics(statsResponse.data || null);
      }

      if (redemptionsResponse.success) {
        setRedemptions(redemptionsResponse.data?.redemptions || []);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      showToast.error("Error al cargar las recompensas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReward = async () => {
    try {
      // Validaciones de campos requeridos
      if (!formData.name.trim()) {
        showToast.error("El nombre de la recompensa es requerido");
        return;
      }

      if (!formData.description.trim()) {
        showToast.error("La descripción de la recompensa es requerida");
        return;
      }

      if (!formData.stampsCost) {
        showToast.error("Los sellos necesarios son requeridos");
        return;
      }

      if (!formData.type) {
        showToast.error("El tipo de recompensa es requerido");
        return;
      }

      // Validación para typeDescription cuando el tipo es OTHER
      if (
        formData.type === RewardType.OTHER &&
        !formData.typeDescription.trim()
      ) {
        showToast.error(
          "Debes agregar una descripción cuando seleccionas 'Otro' como tipo"
        );
        return;
      }

      const payload = {
        ...formData,
        requiredStamps: Number(formData.requiredStamps),
        stampsCost: Number(formData.stampsCost),
        type: formData.type,
        typeDescription:
          formData.type === RewardType.OTHER
            ? formData.typeDescription
            : undefined,
        stock: formData.stock ? Number(formData.stock) : undefined,
        expirationDate: formData.expirationDate
          ? new Date(formData.expirationDate)
          : undefined,
      };

      const response = await api.rewards.create(payload);
      //console.log(response);
      if (response.success) {
        showToast.success("Recompensa creada exitosamente");
        setIsCreateDialogOpen(false);
        resetForm();
        loadData();
      } else {
        showToast.error(response.error || "Error al crear la recompensa");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast.error("Error al crear la recompensa");
    }
  };

  const handleUpdateReward = async () => {
    if (!selectedReward) return;

    try {
      // Validaciones de campos requeridos
      if (!formData.name.trim()) {
        showToast.error("El nombre de la recompensa es requerido");
        return;
      }

      if (!formData.description.trim()) {
        showToast.error("La descripción de la recompensa es requerida");
        return;
      }

      if (!formData.stampsCost) {
        showToast.error("Los sellos necesarios son requeridos");
        return;
      }

      if (!formData.type) {
        showToast.error("El tipo de recompensa es requerido");
        return;
      }

      // Validación para typeDescription cuando el tipo es OTHER
      if (
        formData.type === RewardType.OTHER &&
        !formData.typeDescription.trim()
      ) {
        showToast.error(
          "Debes agregar una descripción cuando seleccionas 'Otro' como tipo"
        );
        return;
      }

      const payload = {
        ...formData,
        requiredStamps: Number(formData.requiredStamps),
        stampsCost: Number(formData.stampsCost),
        type: formData.type,
        typeDescription:
          formData.type === RewardType.OTHER
            ? formData.typeDescription
            : undefined,
        stock: formData.stock ? Number(formData.stock) : undefined,
        expirationDate: formData.expirationDate
          ? new Date(formData.expirationDate)
          : undefined,
      };

      const response = await api.rewards.update(selectedReward.id, payload);

      if (response.success) {
        showToast.success("Recompensa actualizada exitosamente");
        setIsEditDialogOpen(false);
        resetForm();
        loadData();
      } else {
        showToast.error(response.error || "Error al actualizar la recompensa");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast.error("Error al actualizar la recompensa");
    }
  };

  const handleDeactivateReward = async (rewardId: number) => {
    try {
      // Buscar la recompensa para verificar si ya está desactivada
      const reward = rewards.find((r) => r.id === rewardId);
      if (reward && !reward.active) {
        showToast.error("La recompensa ya está desactivada");
        return;
      }

      const response = await api.rewards.delete(rewardId);

      if (response.success) {
        showToast.success("Recompensa desactivada exitosamente");
        loadData();
      } else {
        showToast.error(response.error || "Error al desactivar la recompensa");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast.error("Error al desactivar la recompensa");
    }
  };

  const isActive = (reward: IReward) => {
    return isRewardActive(reward);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      requiredStamps: 10,
      stampsCost: 10,
      type: RewardType.FREE_PRODUCT,
      typeDescription: "",
      image: "",
      expirationDate: "",
      stock: "",
      specialConditions: "",
      active: true,
    });
    setSelectedReward(null);
  };

  const openEditDialog = (reward: IReward) => {
    setSelectedReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      requiredStamps: reward.requiredStamps,
      stampsCost: reward.stampsCost,
      type: reward.type,
      typeDescription: reward.typeDescription || "",
      image: reward.image || "",
      expirationDate: reward.expirationDate
        ? new Date(reward.expirationDate).toISOString().split("T")[0]
        : "",
      stock: reward.stock?.toString() || "",
      specialConditions: reward.specialConditions || "",
      active: reward.active,
    });
    setIsEditDialogOpen(true);
  };

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
    resetForm();
  };

  // Filtrar recompensas
  const filteredRewards = rewards.filter((reward) => {
    const matchesSearch =
      reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && reward.active) ||
      (filterStatus === "inactive" && !reward.active);
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Recompensas
            </h1>
            <p className="text-gray-600 mt-1">
              Administra las recompensas de tu negocio
            </p>
          </div>
          <Button
            onClick={() => openCreateDialog()}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Recompensa
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Recompensas
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {statistics?.totalRewards || 0}
                  </p>
                </div>
                <Gift className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics?.totalRewards || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Canjes
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {statistics?.totalRedemptions || 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Más Canjeada
                  </p>
                  <p className="text-xs font-medium text-orange-600 truncate">
                    {statistics?.mostRedeemedReward?.name || "N/A"}
                  </p>
                  <p className="text-lg font-bold text-orange-600">
                    {statistics?.mostRedeemedReward?.redemptions || 0}
                  </p>
                </div>
                <Star className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rewards">Recompensas</TabsTrigger>
            <TabsTrigger value="redemptions">Historial de Canjes</TabsTrigger>
          </TabsList>

          {/* Tab de Recompensas */}
          <TabsContent value="rewards" className="space-y-4">
            {/* Filtros y controles de vista */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar recompensas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Desactivadas</option>
                </select>
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

            {/* Lista de Recompensas */}
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRewards.map((reward) => (
                  <Card
                    key={reward.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {reward.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {reward.description}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(reward)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={!reward.active}
                                title={
                                  !reward.active
                                    ? "Ya está desactivada"
                                    : "Desactivar recompensa"
                                }
                              >
                                <PowerOff
                                  className={`w-4 h-4 ${
                                    reward.active
                                      ? "text-orange-600"
                                      : "text-gray-400"
                                  }`}
                                />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Desactivar recompensa?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción marcará la recompensa como
                                  inactiva. Los clientes no podrán canjearla,
                                  pero los canjes existentes no se verán
                                  afectados. Puedes reactivarla más tarde desde
                                  el diálogo de edición.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeactivateReward(reward.id)
                                  }
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  Desactivar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            Sellos requeridos:
                          </span>
                          <Badge variant="secondary">
                            {reward.stampsCost} sellos
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Tipo:</span>
                          <Badge variant="outline">
                            {reward.type === RewardType.FREE_PRODUCT &&
                              "Producto Gratis"}
                            {reward.type === RewardType.DISCOUNT && "Descuento"}
                            {reward.type === RewardType.OTHER &&
                              (reward.typeDescription || "Otro")}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Estado:</span>
                          <Badge
                            variant={reward.active ? "default" : "destructive"}
                          >
                            {reward.active ? "Activa" : "Desactivada"}
                          </Badge>
                        </div>
                        {reward.stock !== undefined &&
                          reward.stock !== null && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Stock:
                              </span>
                              <span className="text-sm font-medium">
                                {reward.stock}
                              </span>
                            </div>
                          )}
                        {reward.expirationDate && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              Expira:
                            </span>
                            <span className="text-sm font-medium">
                              {formatDate(reward.expirationDate.toString())}
                            </span>
                          </div>
                        )}
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
                        Recompensa
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                        Sellos
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                        Expiración
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b border-gray-200">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {filteredRewards.map((reward) => (
                      <tr
                        key={reward.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div>
                            <div className="font-medium text-gray-900">
                              {reward.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {reward.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <Badge variant="secondary">
                            {reward.stampsCost} sellos
                          </Badge>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <Badge variant="outline">
                            {reward.type === RewardType.FREE_PRODUCT &&
                              "Producto Gratis"}
                            {reward.type === RewardType.DISCOUNT && "Descuento"}
                            {reward.type === RewardType.OTHER &&
                              (reward.typeDescription || "Otro")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <Badge
                            variant={reward.active ? "default" : "destructive"}
                          >
                            {reward.active ? "Activa" : "Desactivada"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <span className="text-sm text-gray-900">
                            {reward.stock !== undefined && reward.stock !== null
                              ? reward.stock.toString()
                              : "Sin límite"}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <span className="text-sm text-gray-900">
                            {reward.expirationDate
                              ? formatDate(reward.expirationDate.toString())
                              : "Sin expiración"}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(reward)}
                              title="Editar recompensa"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={!reward.active}
                                  title={
                                    !reward.active
                                      ? "Ya está desactivada"
                                      : "Desactivar recompensa"
                                  }
                                >
                                  <PowerOff
                                    className={`w-4 h-4 ${
                                      reward.active
                                        ? "text-orange-600"
                                        : "text-gray-400"
                                    }`}
                                  />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    ¿Desactivar recompensa?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción marcará la recompensa como
                                    inactiva. Los clientes no podrán canjearla,
                                    pero los canjes existentes no se verán
                                    afectados. Puedes reactivarla más tarde
                                    desde el diálogo de edición.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeactivateReward(reward.id)
                                    }
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    Desactivar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredRewards.length === 0 && (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {filterStatus === "active"
                    ? "No hay recompensas activas"
                    : filterStatus === "inactive"
                    ? "No hay recompensas desactivadas"
                    : "No hay recompensas que mostrar"}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Tab de Historial de Canjes */}
          <TabsContent value="redemptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Canjes</CardTitle>
                <CardDescription>
                  Últimos canjes de recompensas realizados por los clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {redemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {redemption.reward.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {redemption.client.firstName}{" "}
                          {redemption.client.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {redemption.client.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {redemption.stampsSpent} sellos
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(redemption.redeemedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {redemptions.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay canjes registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog para crear recompensa */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-full max-w-full">
            <DialogHeader>
              <DialogTitle>Nueva Recompensa</DialogTitle>
              <DialogDescription>
                Crea una nueva recompensa para tu negocio
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`col-span-3 ${
                    !formData.name.trim()
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Nombre de la recompensa (requerido)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`col-span-3 ${
                    !formData.description.trim()
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Descripción de la recompensa (requerido)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stampsCost" className="text-right">
                  Sellos necesarios <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stampsCost"
                  type="number"
                  value={formData.stampsCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stampsCost: Number(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo <span className="text-red-500">*</span>
                </Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as RewardType,
                      typeDescription:
                        e.target.value === RewardType.OTHER
                          ? formData.typeDescription
                          : "",
                    })
                  }
                  className={`col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !formData.type
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                >
                  <option value={RewardType.FREE_PRODUCT}>
                    Producto Gratis
                  </option>
                  <option value={RewardType.DISCOUNT}>Descuento</option>
                  <option value={RewardType.OTHER}>Otro</option>
                </select>
              </div>
              {formData.type === RewardType.OTHER && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="typeDescription" className="text-right">
                    Descripción <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="typeDescription"
                    value={formData.typeDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        typeDescription: e.target.value,
                      })
                    }
                    className={`col-span-3 ${
                      formData.type === RewardType.OTHER &&
                      !formData.typeDescription.trim()
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    placeholder="Describe el tipo de recompensa (requerido)"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Opcional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expirationDate" className="text-right">
                  Fecha Exp.
                </Label>
                <Input
                  id="expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expirationDate: e.target.value })
                  }
                  className="col-span-3"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              {/*
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Activa
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="active"
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        active: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Label
                    htmlFor="active"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Recompensa activa
                  </Label>
                </div>
              </div>
              */}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateReward}>Crear Recompensa</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para editar recompensa */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Recompensa</DialogTitle>
              <DialogDescription>
                Modifica los datos de la recompensa
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`col-span-3 ${
                    !formData.name.trim()
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Nombre de la recompensa (requerido)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`col-span-3 ${
                    !formData.description.trim()
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Descripción de la recompensa (requerido)"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stampsCost" className="text-right">
                  Sellos necesarios <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-stampsCost"
                  type="number"
                  value={formData.stampsCost}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stampsCost: Number(e.target.value),
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  Tipo <span className="text-red-500">*</span>
                </Label>
                <select
                  id="edit-type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as RewardType,
                      typeDescription:
                        e.target.value === RewardType.OTHER
                          ? formData.typeDescription
                          : "",
                    })
                  }
                  className={`col-span-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    !formData.type
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                >
                  <option value={RewardType.FREE_PRODUCT}>
                    Producto Gratis
                  </option>
                  <option value={RewardType.DISCOUNT}>Descuento</option>
                  <option value={RewardType.OTHER}>Otro</option>
                </select>
              </div>
              {formData.type === RewardType.OTHER && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-typeDescription" className="text-right">
                    Descripción <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="edit-typeDescription"
                    value={formData.typeDescription}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        typeDescription: e.target.value,
                      })
                    }
                    className={`col-span-3 ${
                      formData.type === RewardType.OTHER &&
                      !formData.typeDescription.trim()
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    placeholder="Describe el tipo de recompensa (requerido)"
                  />
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  className="col-span-3"
                  placeholder="Opcional"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-expirationDate" className="text-right">
                  Fecha Exp.
                </Label>
                <Input
                  id="edit-expirationDate"
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expirationDate: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-active" className="text-right">
                  Activa
                </Label>
                <div className="col-span-3 flex items-center">
                  <input
                    id="edit-active"
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        active: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Label
                    htmlFor="edit-active"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Recompensa activa
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateReward}>
                Actualizar Recompensa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthenticatedLayout>
  );
}
