import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";
import {
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  QrCode,
} from "lucide-react";

export default function BusinessProfilePage() {
  return (
    <AuthenticatedLayout title="Perfil del Negocio">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Perfil del Negocio
          </h1>
          <p className="text-gray-600">Gestiona la información de tu negocio</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información del Negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <Input
                    id="businessName"
                    placeholder="Nombre de tu negocio"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@negocio.com"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="Teléfono de contacto"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo de Negocio</Label>
                  <Input
                    id="type"
                    placeholder="Cafetería, Restaurant, etc."
                    disabled
                  />
                </div>
              </div>
              <div className="pt-4">
                <Button disabled>Guardar Cambios</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street">Calle y Número</Label>
                  <Input
                    id="street"
                    placeholder="Av. Corrientes 1234"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Barrio</Label>
                  <Input id="neighborhood" placeholder="Centro" disabled />
                </div>
                <div>
                  <Label htmlFor="postalCode">Código Postal</Label>
                  <Input id="postalCode" placeholder="1000" disabled />
                </div>
                <div>
                  <Label htmlFor="province">Provincia</Label>
                  <Input id="province" placeholder="Buenos Aires" disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Redes Sociales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" placeholder="@mi_negocio" disabled />
                </div>
                <div>
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input id="tiktok" placeholder="@mi_negocio" disabled />
                </div>
                <div>
                  <Label htmlFor="website">Página Web</Label>
                  <Input
                    id="website"
                    placeholder="https://mi-negocio.com"
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Código QR
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Genera un código QR para que los clientes puedan registrarse
                fácilmente en tu negocio
              </p>
              <Button disabled>Generar Código QR</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            🚧 Funcionalidad en Desarrollo
          </h3>
          <p className="text-blue-800">
            Esta página está en desarrollo. Próximamente podrás editar toda la
            información de tu negocio, cambiar tu contraseña y generar códigos
            QR personalizados.
          </p>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
