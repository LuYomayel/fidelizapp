import { useState } from "react";
import Head from "next/head";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Save,
  RefreshCw,
  QrCode,
  Clock,
  Users,
  Gift,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { ProtectedRoute } from "../../components/shared/ProtectedRoute";
import { AuthenticatedLayout } from "../../components/shared/AuthenticatedLayout";

export default function ConfiguracionCodigos() {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    stampsForReward: 10,
    rewardDescription: "Café gratis",
    codeExpirationHours: 24,
    allowMultipleUses: false,
    requirePurchaseType: true,
    enableQuickActions: true,
    autoGenerateCodes: false,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: false,
      lowStockAlerts: true,
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    // TODO: Implementar guardado real
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleReset = () => {
    // TODO: Implementar reset a valores por defecto
  };

  return (
    <ProtectedRoute allowedUserTypes={["admin"]}>
      <Head>
        <title>Configuración de Códigos - FidelizApp Admin</title>
        <meta
          name="description"
          content="Configura el sistema de códigos y sellos de tu negocio"
        />
      </Head>

      <AuthenticatedLayout title="Configuración de Códigos">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuración de Códigos
            </h1>
            <p className="text-gray-600">
              Personaliza el comportamiento de tu sistema de fidelización
            </p>
          </div>

          {/* Configuración Principal */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuración Principal
              </CardTitle>
              <CardDescription>
                Ajusta los parámetros básicos del sistema de sellos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="stampsForReward">
                    Sellos para Recompensa
                  </Label>
                  <Input
                    id="stampsForReward"
                    type="number"
                    min="1"
                    max="50"
                    value={config.stampsForReward}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        stampsForReward: parseInt(e.target.value),
                      })
                    }
                    placeholder="10"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Cantidad de sellos necesarios para obtener una recompensa
                  </p>
                </div>

                <div>
                  <Label htmlFor="rewardDescription">
                    Descripción de Recompensa
                  </Label>
                  <Input
                    id="rewardDescription"
                    value={config.rewardDescription}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rewardDescription: e.target.value,
                      })
                    }
                    placeholder="Café gratis"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Descripción que verán los clientes
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="codeExpirationHours">
                    Expiración de Códigos (horas)
                  </Label>
                  <Select
                    value={config.codeExpirationHours.toString()}
                    onValueChange={(value) =>
                      setConfig({
                        ...config,
                        codeExpirationHours: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="6">6 horas</SelectItem>
                      <SelectItem value="12">12 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                      <SelectItem value="48">48 horas</SelectItem>
                      <SelectItem value="168">1 semana</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-1">
                    Tiempo que permanecen válidos los códigos
                  </p>
                </div>

                <div>
                  <Label htmlFor="purchaseType">Tipos de Compra</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requirePurchaseType"
                        checked={config.requirePurchaseType}
                        onCheckedChange={(checked) =>
                          setConfig({
                            ...config,
                            requirePurchaseType: checked,
                          })
                        }
                      />
                      <Label htmlFor="requirePurchaseType">
                        Requerir tipo de compra
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Los clientes deben especificar el tipo de compra
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración Avanzada */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Configuración Avanzada
              </CardTitle>
              <CardDescription>
                Opciones avanzadas para la generación y gestión de códigos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="quickActions">Acciones Rápidas</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enableQuickActions"
                        checked={config.enableQuickActions}
                        onCheckedChange={(checked) =>
                          setConfig({
                            ...config,
                            enableQuickActions: checked,
                          })
                        }
                      />
                      <Label htmlFor="enableQuickActions">
                        Habilitar acciones rápidas
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Permite generar códigos con un solo clic
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="autoGenerate">Generación Automática</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoGenerateCodes"
                        checked={config.autoGenerateCodes}
                        onCheckedChange={(checked) =>
                          setConfig({
                            ...config,
                            autoGenerateCodes: checked,
                          })
                        }
                      />
                      <Label htmlFor="autoGenerateCodes">
                        Generar códigos automáticamente
                      </Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Genera códigos cuando se agotan
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="multipleUses">Uso Múltiple</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowMultipleUses"
                      checked={config.allowMultipleUses}
                      onCheckedChange={(checked) =>
                        setConfig({
                          ...config,
                          allowMultipleUses: checked,
                        })
                      }
                    />
                    <Label htmlFor="allowMultipleUses">
                      Permitir uso múltiple de códigos
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500">
                    Los códigos pueden ser usados por múltiples clientes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Notificaciones */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Notificaciones
              </CardTitle>
              <CardDescription>
                Configura cómo recibir alertas y notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emailNotifications"
                    checked={config.notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        notificationSettings: {
                          ...config.notificationSettings,
                          emailNotifications: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="emailNotifications">
                    Notificaciones por Email
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="pushNotifications"
                    checked={config.notificationSettings.pushNotifications}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        notificationSettings: {
                          ...config.notificationSettings,
                          pushNotifications: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="pushNotifications">Notificaciones Push</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="lowStockAlerts"
                    checked={config.notificationSettings.lowStockAlerts}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        notificationSettings: {
                          ...config.notificationSettings,
                          lowStockAlerts: checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor="lowStockAlerts">Alertas de Stock Bajo</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas Rápidas */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Estado Actual
              </CardTitle>
              <CardDescription>
                Resumen de la configuración actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {config.stampsForReward}
                  </div>
                  <div className="text-sm text-gray-600">
                    Sellos por Recompensa
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {config.codeExpirationHours}h
                  </div>
                  <div className="text-sm text-gray-600">Expiración</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {config.enableQuickActions ? "Sí" : "No"}
                  </div>
                  <div className="text-sm text-gray-600">Acciones Rápidas</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {config.allowMultipleUses ? "Sí" : "No"}
                  </div>
                  <div className="text-sm text-gray-600">Uso Múltiple</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restablecer
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </div>

          {/* Aviso de Desarrollo */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Funcionalidad en Desarrollo
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Esta página está en desarrollo. Las configuraciones se
                  guardarán próximamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
