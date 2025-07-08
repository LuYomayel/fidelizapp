import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";
import {
  User,
  Mail,
  Lock,
  BarChart3,
  Calendar,
  Trophy,
  Star,
  Settings,
  Bell,
  Shield,
  Palette,
} from "lucide-react";

export default function ClientProfilePage() {
  return (
    <AuthenticatedLayout title="Mi Perfil">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
          <p className="text-gray-600">
            Gestiona tu información personal y configuraciones
          </p>
        </div>

        <div className="grid gap-6">
          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" placeholder="Tu nombre" disabled />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" placeholder="Tu apellido" disabled />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    disabled
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓ Email verificado</Badge>
                  <Badge variant="outline">Cuenta local</Badge>
                </div>
                <div className="pt-4">
                  <Button disabled>Guardar Cambios</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Foto de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <Button disabled size="sm">
                    Cambiar Foto
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    JPG, PNG, WEBP. Máx 5MB
                  </p>
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Miembro desde:</span>
                    <span className="font-medium">Enero 2024</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <Badge variant="default">Activo</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-semibold">
                      Sellos Totales
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">0</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Sellos acumulados en total
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-green-500" />
                    <span className="text-lg font-semibold">Recompensas</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">0</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Recompensas canjeadas
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <span className="text-lg font-semibold">Días Activo</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600">0</div>
                  <p className="text-sm text-gray-600 mt-1">
                    Días desde el registro
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuraciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-gray-600">
                      Recibir notificaciones por email
                    </p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Recompensas</Label>
                    <p className="text-sm text-gray-600">
                      Notificar cuando tengas recompensas
                    </p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sellos</Label>
                    <p className="text-sm text-gray-600">
                      Notificar cuando recibas sellos
                    </p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Perfil Visible</Label>
                    <p className="text-sm text-gray-600">
                      Hacer visible tu perfil a otros usuarios
                    </p>
                  </div>
                  <Badge variant="outline">Habilitado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compartir Actividad</Label>
                    <p className="text-sm text-gray-600">
                      Permitir que los negocios vean tu actividad
                    </p>
                  </div>
                  <Badge variant="outline">Deshabilitado</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Ingresa tu nueva contraseña"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">
                  Confirmar Nueva Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirma tu nueva contraseña"
                  disabled
                />
              </div>
              <div className="pt-4">
                <Button disabled>Cambiar Contraseña</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            🚧 Funcionalidad en Desarrollo
          </h3>
          <p className="text-blue-800">
            Esta página está en desarrollo. Próximamente podrás editar tu
            información personal, cambiar configuraciones de privacidad y
            notificaciones, y gestionar tu seguridad.
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
