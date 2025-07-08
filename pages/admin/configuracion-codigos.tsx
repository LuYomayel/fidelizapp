import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Zap,
  ZapOff,
  ShoppingCart,
  ShoppingBag,
  MapPin,
  Gift,
  Star,
  Save,
  X,
} from "lucide-react";
import { ProtectedRoute } from "../../components/shared/ProtectedRoute";
import { AuthenticatedLayout } from "../../components/shared/AuthenticatedLayout";
import { api } from "@/lib/api-client";
import { IStampConfig, StampType, PurchaseType } from "@shared";

interface StampConfigForm {
  name: string;
  description: string;
  stampType: StampType;
  purchaseType?: PurchaseType;
  stampValue: number;
  minPurchaseAmount?: number;
  maxPurchaseAmount?: number;
  isActive: boolean;
  isQuickAction: boolean;
  buttonColor: string;
  buttonText: string;
  iconName: string;
  sortOrder: number;
}

const iconOptions = [
  { value: "ShoppingCart", label: "Carrito", icon: ShoppingCart },
  { value: "ShoppingBag", label: "Bolsa", icon: ShoppingBag },
  { value: "MapPin", label: "Ubicación", icon: MapPin },
  { value: "Gift", label: "Regalo", icon: Gift },
  { value: "Star", label: "Estrella", icon: Star },
  { value: "Zap", label: "Rayo", icon: Zap },
];

const colorOptions = [
  { value: "#3B82F6", label: "Azul", color: "bg-blue-500" },
  { value: "#F59E0B", label: "Naranja", color: "bg-orange-500" },
  { value: "#10B981", label: "Verde", color: "bg-green-500" },
  { value: "#8B5CF6", label: "Morado", color: "bg-purple-500" },
  { value: "#EF4444", label: "Rojo", color: "bg-red-500" },
  { value: "#6B7280", label: "Gris", color: "bg-gray-500" },
];

export default function ConfiguracionCodigosPage() {
  const router = useRouter();
  const [configs, setConfigs] = useState<IStampConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<IStampConfig | null>(null);
  const [formData, setFormData] = useState<StampConfigForm>({
    name: "",
    description: "",
    stampType: StampType.PURCHASE,
    purchaseType: PurchaseType.SMALL,
    stampValue: 1,
    minPurchaseAmount: 0,
    maxPurchaseAmount: undefined,
    isActive: true,
    isQuickAction: false,
    buttonColor: "#3B82F6",
    buttonText: "",
    iconName: "ShoppingCart",
    sortOrder: 0,
  });

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.business.getStampConfigs();
      if (response.success) {
        setConfigs(response.data || []);
      }
    } catch (error) {
      console.error("Error al cargar configuraciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        minPurchaseAmount: formData.minPurchaseAmount || undefined,
        maxPurchaseAmount: formData.maxPurchaseAmount || undefined,
      };

      if (editingConfig) {
        await api.business.updateStampConfig(
          editingConfig.id as number,
          payload
        );
      } else {
        await api.business.createStampConfig(payload);
      }

      setIsDialogOpen(false);
      setEditingConfig(null);
      resetForm();
      loadConfigs();
    } catch (error) {
      console.error("Error al guardar configuración:", error);
    }
  };

  const handleEdit = (config: IStampConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      description: config.description || "",
      stampType: config.stampType,
      purchaseType: config.purchaseType,
      stampValue: config.stampValue,
      minPurchaseAmount: config.minPurchaseAmount,
      maxPurchaseAmount: config.maxPurchaseAmount,
      isActive: config.isActive,
      isQuickAction: config.isQuickAction,
      buttonColor: config.buttonColor || "#3B82F6",
      buttonText: config.buttonText || "",
      iconName: config.iconName || "ShoppingCart",
      sortOrder: config.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta configuración?")) {
      try {
        await api.business.deleteStampConfig(id);
        loadConfigs();
      } catch (error) {
        console.error("Error al eliminar configuración:", error);
      }
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await api.business.toggleStampConfigActive(id);
      loadConfigs();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleToggleQuickAction = async (id: number) => {
    try {
      await api.business.toggleStampConfigQuickAction(id);
      loadConfigs();
    } catch (error) {
      console.error("Error al cambiar acción rápida:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      stampType: StampType.PURCHASE,
      purchaseType: PurchaseType.SMALL,
      stampValue: 1,
      minPurchaseAmount: 0,
      maxPurchaseAmount: undefined,
      isActive: true,
      isQuickAction: false,
      buttonColor: "#3B82F6",
      buttonText: "",
      iconName: "ShoppingCart",
      sortOrder: 0,
    });
  };

  const getIcon = (iconName: string) => {
    const iconOption = iconOptions.find((opt) => opt.value === iconName);
    return iconOption ? iconOption.icon : ShoppingCart;
  };

  const getStampTypeLabel = (type: StampType) => {
    const labels = {
      [StampType.PURCHASE]: "Compra",
      [StampType.VISIT]: "Visita",
      [StampType.REFERRAL]: "Referencia",
      [StampType.BONUS]: "Bonus",
      [StampType.SPECIAL]: "Especial",
    };
    return labels[type] || type;
  };

  const getPurchaseTypeLabel = (type?: PurchaseType) => {
    if (!type) return "";
    const labels = {
      [PurchaseType.SMALL]: "Pequeña",
      [PurchaseType.MEDIUM]: "Mediana",
      [PurchaseType.LARGE]: "Grande",
      [PurchaseType.SPECIAL]: "Especial",
    };
    return labels[type] || type;
  };

  return (
    <ProtectedRoute allowedUserTypes={["admin"]}>
      <AuthenticatedLayout>
        <div className="p-4 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Configuración de Códigos
              </h1>
              <p className="text-gray-600">
                Gestiona los tipos de códigos y sellos para tu negocio
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setEditingConfig(null);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Configuración
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingConfig
                      ? "Editar Configuración"
                      : "Nueva Configuración"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="buttonText">Texto del Botón</Label>
                      <Input
                        id="buttonText"
                        value={formData.buttonText}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            buttonText: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stampType">Tipo de Sello</Label>
                      <Select
                        value={formData.stampType}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            stampType: value as StampType,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={StampType.PURCHASE}>
                            Compra
                          </SelectItem>
                          <SelectItem value={StampType.VISIT}>
                            Visita
                          </SelectItem>
                          <SelectItem value={StampType.REFERRAL}>
                            Referencia
                          </SelectItem>
                          <SelectItem value={StampType.BONUS}>Bonus</SelectItem>
                          <SelectItem value={StampType.SPECIAL}>
                            Especial
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.stampType === StampType.PURCHASE && (
                      <div>
                        <Label htmlFor="purchaseType">Tipo de Compra</Label>
                        <Select
                          value={formData.purchaseType}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              purchaseType: value as PurchaseType,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={PurchaseType.SMALL}>
                              Pequeña
                            </SelectItem>
                            <SelectItem value={PurchaseType.MEDIUM}>
                              Mediana
                            </SelectItem>
                            <SelectItem value={PurchaseType.LARGE}>
                              Grande
                            </SelectItem>
                            <SelectItem value={PurchaseType.SPECIAL}>
                              Especial
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="stampValue">Sellos Otorgados</Label>
                      <Input
                        id="stampValue"
                        type="number"
                        min="1"
                        value={formData.stampValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stampValue: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="minPurchaseAmount">Monto Mínimo</Label>
                      <Input
                        id="minPurchaseAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.minPurchaseAmount || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minPurchaseAmount:
                              parseFloat(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxPurchaseAmount">Monto Máximo</Label>
                      <Input
                        id="maxPurchaseAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.maxPurchaseAmount || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxPurchaseAmount:
                              parseFloat(e.target.value) || undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buttonColor">Color del Botón</Label>
                      <div className="flex gap-2 mt-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={`w-8 h-8 rounded-full ${color.color} ${
                              formData.buttonColor === color.value
                                ? "ring-2 ring-offset-2 ring-gray-400"
                                : ""
                            }`}
                            onClick={() =>
                              setFormData({
                                ...formData,
                                buttonColor: color.value,
                              })
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="iconName">Icono</Label>
                      <Select
                        value={formData.iconName}
                        onValueChange={(value) =>
                          setFormData({ ...formData, iconName: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              <div className="flex items-center gap-2">
                                <icon.icon className="w-4 h-4" />
                                {icon.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sortOrder">Orden</Label>
                      <Input
                        id="sortOrder"
                        type="number"
                        min="0"
                        value={formData.sortOrder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sortOrder: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="isActive">Activo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isQuickAction"
                        checked={formData.isQuickAction}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isQuickAction: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="isQuickAction">Acción Rápida</Label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Configuraciones */}
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">
                Cargando configuraciones...
              </div>
            ) : configs.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay configuraciones
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Crea tu primera configuración de códigos para empezar
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nueva Configuración
                  </Button>
                </CardContent>
              </Card>
            ) : (
              configs.map((config) => {
                const IconComponent = getIcon(
                  config.iconName || "ShoppingCart"
                );
                return (
                  <Card
                    key={config.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                            style={{
                              backgroundColor: config.buttonColor || "#3B82F6",
                            }}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {config.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {config.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                {getStampTypeLabel(config.stampType)}
                                {config.purchaseType &&
                                  ` - ${getPurchaseTypeLabel(
                                    config.purchaseType
                                  )}`}
                              </Badge>
                              <Badge variant="secondary">
                                {config.stampValue} sello
                                {config.stampValue > 1 ? "s" : ""}
                              </Badge>
                              {config.isQuickAction && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Acción Rápida
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleActive(config.id as number)
                            }
                            className={
                              config.isActive
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            {config.isActive ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleToggleQuickAction(config.id as number)
                            }
                            className={
                              config.isQuickAction
                                ? "text-yellow-600"
                                : "text-gray-400"
                            }
                          >
                            {config.isQuickAction ? (
                              <Zap className="w-4 h-4" />
                            ) : (
                              <ZapOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(config)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(config.id as number)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
