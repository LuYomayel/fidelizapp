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
} from "lucide-react";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";
import { api } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import { IReward, IRewardRedemption, IRewardStatistics } from "@shared";

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

  // Estados para formularios
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    requiredStamps: 10,
    stampsCost: 10,
    image: "",
    expirationDate: "",
    stock: "",
    specialConditions: "",
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
        setRewards(rewardsResponse.data || []);
      }

      if (statsResponse.success) {
        setStatistics(statsResponse.data || null);
      }

      if (redemptionsResponse.success) {
        setRedemptions(redemptionsResponse.data?.redemptions || []);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      toast.error("Error al cargar las recompensas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReward = async () => {
    try {
      const payload = {
        ...formData,
        requiredStamps: Number(formData.requiredStamps),
        stampsCost: Number(formData.stampsCost),
        stock: formData.stock ? Number(formData.stock) : undefined,
        expirationDate: formData.expirationDate
          ? new Date(formData.expirationDate)
          : undefined,
      };

      const response = await api.rewards.create(payload);
      console.log(response);
      if (response.success) {
        toast.success("Recompensa creada exitosamente");
        setIsCreateDialogOpen(false);
        resetForm();
        loadData();
      } else {
        toast.error(response.error || "Error al crear la recompensa");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear la recompensa");
    }
  };

  const handleUpdateReward = async () => {
    if (!selectedReward) return;

    try {
      const payload = {
        ...formData,
        requiredStamps: Number(formData.requiredStamps),
        stampsCost: Number(formData.stampsCost),
        stock: formData.stock ? Number(formData.stock) : undefined,
        expirationDate: formData.expirationDate
          ? new Date(formData.expirationDate)
          : undefined,
      };

      const response = await api.rewards.update(selectedReward.id, payload);

      if (response.success) {
        toast.success("Recompensa actualizada exitosamente");
        setIsEditDialogOpen(false);
        resetForm();
        loadData();
      } else {
        toast.error(response.error || "Error al actualizar la recompensa");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar la recompensa");
    }
  };

  const handleDeleteReward = async (rewardId: number) => {
    try {
      const response = await api.rewards.delete(rewardId);

      if (response.success) {
        toast.success("Recompensa eliminada exitosamente");
        loadData();
      } else {
        toast.error(response.error || "Error al eliminar la recompensa");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar la recompensa");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      requiredStamps: 10,
      stampsCost: 10,
      image: "",
      expirationDate: "",
      stock: "",
      specialConditions: "",
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
      image: reward.image || "",
      expirationDate: reward.expirationDate
        ? new Date(reward.expirationDate).toISOString().split("T")[0]
        : "",
      stock: reward.stock?.toString() || "",
      specialConditions: reward.specialConditions || "",
    });
    setIsEditDialogOpen(true);
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
            onClick={() => setIsCreateDialogOpen(true)}
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
            {/* Filtros */}
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
                  <option value="inactive">Inactivas</option>
                </select>
              </div>
            </div>

            {/* Lista de Recompensas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRewards.map((reward) => (
                <Card
                  key={reward.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
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
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                ¿Eliminar recompensa?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción marcará la recompensa como inactiva.
                                Los canjes existentes no se verán afectados.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReward(reward.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Eliminar
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
                        <span className="text-sm text-gray-600">Costo:</span>
                        <Badge variant="secondary">
                          {reward.stampsCost} sellos
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Estado:</span>
                        <Badge
                          variant={reward.active ? "default" : "destructive"}
                        >
                          {reward.active ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                      {reward.stock && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Stock:</span>
                          <span className="text-sm font-medium">
                            {reward.stock}
                          </span>
                        </div>
                      )}
                      {reward.expirationDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Expira:</span>
                          <span className="text-sm font-medium">
                            {new Date(
                              reward.expirationDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredRewards.length === 0 && (
              <div className="text-center py-8">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay recompensas que mostrar</p>
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
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stampsCost" className="text-right">
                  Costo (sellos)
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
                />
              </div>
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
                  Nombre
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stampsCost" className="text-right">
                  Costo (sellos)
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
