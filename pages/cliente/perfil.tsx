import React, { useEffect, useState } from "react";
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
import { IChangePasswordDto, IClientProfile, UserProvider } from "@shared";
import { api } from "@/lib/api-client";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientProfilePage() {
  const { user, updateUser } = useAuth();

  const [client, setClient] = useState<IClientProfile | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    loadClient();
  }, []);

  const loadClient = async () => {
    try {
      const response = await api.clients.getProfile();
      if (response.success && response.data) {
        setClient(response.data);
      }
    } catch (error) {
      console.error("Error al cargar el cliente", error);
    }
  };

  const handleChangePassword = async () => {
    if (
      newPassword === "" ||
      confirmPassword === "" ||
      currentPassword === ""
    ) {
      showToast.error("Por favor, complete todos los campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast.error("Las contraseñas no coinciden");
      return;
    }
    try {
      const response = await api.clients.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (response.success) {
        setResult(response.message || "Contraseña actualizada correctamente");
        setIsLoading(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
      } else {
        setIsLoading(false);
        setError(response.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña", error);
      setIsLoading(false);
      setError(
        error instanceof Error
          ? error.message
          : "Error al cambiar la contraseña"
      );
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await api.clients.updateProfile({
        firstName: client?.firstName || "",
        lastName: client?.lastName || "",
      });
      if (response.success) {
        showToast.success("Cambios guardados correctamente");

        // Actualizar el usuario en el contexto de autenticación
        if (user && client) {
          const updatedUser = {
            ...user,
            username: client?.firstName + " " + client?.lastName,
          };
          updateUser(updatedUser);
        }
      } else {
        showToast.error(response.message || "Error al guardar los cambios");
      }
    } catch (error) {
      console.error("Error al guardar los cambios", error);
      showToast.error("Error al guardar los cambios");
    }
  };

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
          {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-6">*/}
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
                  <Input
                    id="firstName"
                    placeholder="Tu nombre"
                    value={client?.firstName || ""}
                    onChange={(e) =>
                      setClient(
                        client ? { ...client, firstName: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    placeholder="Tu apellido"
                    value={client?.lastName || ""}
                    onChange={(e) =>
                      setClient(
                        client ? { ...client, lastName: e.target.value } : null
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    disabled
                    value={client?.email || ""}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    {client?.emailVerified
                      ? "✓ Email verificado"
                      : "✗ Email no verificado"}
                  </Badge>
                  <Badge
                    variant={
                      client?.provider === UserProvider.GOOGLE
                        ? "default"
                        : "outline"
                    }
                  >
                    {client?.provider === UserProvider.GOOGLE
                      ? "Cuenta de Google"
                      : "Cuenta local"}
                  </Badge>
                </div>
                <div className="pt-4">
                  <Button onClick={handleSaveChanges}>Guardar Cambios</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Seguridad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client?.provider === UserProvider.GOOGLE ? (
                  <div className="text-center py-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cuenta de Google
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Tu cuenta está vinculada con Google. No necesitas una
                      contraseña para acceder.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>¿Necesitas cambiar tu contraseña?</strong>
                        <br />
                        Ve a tu cuenta de Google y actualiza tu contraseña desde
                        allí.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="currentPassword">Contraseña Actual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Ingresa tu contraseña actual"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">Nueva Contraseña</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Ingresa tu nueva contraseña"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                    <div className="pt-4">
                      {error && (
                        <p className="text-red-500 text-sm mb-2">{error}</p>
                      )}
                      {result && (
                        <p className="text-green-500 text-sm mb-2">{result}</p>
                      )}
                      <Button
                        onClick={handleChangePassword}
                        disabled={isLoading}
                      >
                        Cambiar Contraseña
                      </Button>
                      {isLoading && <p>Cambiando contraseña...</p>}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            {/*
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
                    <span className="font-medium">
                      {client?.memberSince
                        ? new Date(client.memberSince).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Estado:</span>
                    <Badge variant="default">
                      {client?.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            */}
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
                  <div className="text-3xl font-bold text-blue-600">
                    {client?.statistics?.totalStamps}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Sellos acumulados en total
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Trophy className="h-5 w-5 text-green-500" />
                    <span className="text-lg font-semibold">Recompensas</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {client?.statistics?.totalRedemptions}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Recompensas canjeadas
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <span className="text-lg font-semibold">Días Activo</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600">
                    {client?.statistics?.activeDays}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Días desde el registro
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuraciones */}
          {/*
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
          */}
        </div>

        {/*
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
        */}
      </div>
    </AuthenticatedLayout>
  );
}
