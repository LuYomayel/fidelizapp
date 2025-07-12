import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  X,
  Store,
  Calendar,
  Star,
  Image,
  ExternalLink,
  Building,
  Users,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { IBusiness, BusinessType } from "@shared";

interface BusinessInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: number;
}

export default function BusinessInfoDialog({
  isOpen,
  onClose,
  businessId,
}: BusinessInfoDialogProps) {
  const [business, setBusiness] = useState<IBusiness | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && businessId) {
      loadBusinessInfo();
    }
  }, [isOpen, businessId]);

  const loadBusinessInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.businesses.get(businessId.toString());
      if (response.success && response.data) {
        setBusiness(response.data as IBusiness);
      } else {
        setError("No se pudo cargar la información del negocio");
      }
    } catch (err) {
      setError("Error al cargar la información del negocio");
      console.error("Error loading business info:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "No disponible";
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getBusinessTypeDisplay = (type: string, customType?: string) => {
    if (type === BusinessType.OTRO && customType) {
      return customType;
    }
    return type;
  };

  const handleSocialLink = (url: string) => {
    if (url && !url.startsWith("http")) {
      window.open(`https://${url}`, "_blank");
    } else if (url) {
      window.open(url, "_blank");
    }
  };

  const getFullAddress = (business: IBusiness) => {
    const parts = [
      business.street,
      business.neighborhood,
      business.postalCode,
      business.province,
    ].filter(Boolean);
    return parts.join(", ");
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Información del Negocio
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Cargando información...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error al cargar la información
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadBusinessInfo} variant="outline">
              Reintentar
            </Button>
          </div>
        )}

        {business && (
          <div className="space-y-6">
            {/* Header con logo y información básica */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
                      {business.logoPath ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${business.logoPath}`}
                          alt={business.businessName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-12 h-12 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Información básica */}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {business.businessName}
                    </h1>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        {getBusinessTypeDisplay(
                          business.type,
                          business.customType
                        )}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Building className="w-3 h-3" />
                        {business.size}
                      </Badge>
                    </div>

                    {business.rewardDescription && (
                      <p className="text-gray-600 leading-relaxed mb-4">
                        <strong>Recompensa:</strong>{" "}
                        {business.rewardDescription}
                      </p>
                    )}

                    {business.stampsForReward && (
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          {business.stampsForReward} sellos para recompensa
                        </span>
                      </div>
                    )}

                    {/* Fecha de registro */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Cliente desde {formatDate(business.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Placeholder para fotos del negocio */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Fotos del Negocio
                </h3>
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">
                    Próximamente el negocio podrá subir fotos
                  </p>
                  <p className="text-sm text-gray-400">
                    Aquí se mostrarán las fotos del local, productos y servicios
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información de contacto */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Información de Contacto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dirección */}
                  {getFullAddress(business) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Dirección</p>
                        <p className="text-gray-600">
                          {getFullAddress(business)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Teléfono Externo */}
                  {business.externalPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Teléfono</p>
                        <p className="text-gray-600">
                          {business.externalPhone}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Teléfono Interno */}
                  {business.internalPhone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Teléfono Interno
                        </p>
                        <p className="text-gray-600">
                          {business.internalPhone}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  {business.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-gray-600">{business.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Redes sociales */}
            {(business.website || business.instagram || business.tiktok) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Redes Sociales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Website */}
                    {business.website && (
                      <Button
                        variant="outline"
                        onClick={() => handleSocialLink(business.website!)}
                        className="flex items-center gap-2 justify-start h-auto p-4"
                      >
                        <Globe className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium">Sitio Web</p>
                          <p className="text-sm text-gray-600 truncate">
                            {business.website}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </Button>
                    )}

                    {/* Instagram */}
                    {business.instagram && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleSocialLink(
                            `https://instagram.com/${business.instagram}`
                          )
                        }
                        className="flex items-center gap-2 justify-start h-auto p-4"
                      >
                        <Instagram className="w-5 h-5 text-pink-600" />
                        <div className="text-left">
                          <p className="font-medium">Instagram</p>
                          <p className="text-sm text-gray-600 truncate">
                            @{business.instagram}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </Button>
                    )}

                    {/* TikTok */}
                    {business.tiktok && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleSocialLink(
                            `https://tiktok.com/@${business.tiktok}`
                          )
                        }
                        className="flex items-center gap-2 justify-start h-auto p-4"
                      >
                        <Users className="w-5 h-5 text-black" />
                        <div className="text-left">
                          <p className="font-medium">TikTok</p>
                          <p className="text-sm text-gray-600 truncate">
                            @{business.tiktok}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 ml-auto" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información del sistema de sellos */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Sistema de Sellos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {business.stampsForReward || "No configurado"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Sellos requeridos para recompensa
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {business.active ? "Activo" : "Inactivo"}
                    </div>
                    <div className="text-sm text-gray-600">
                      Estado del negocio
                    </div>
                  </div>
                </div>
                {business.rewardDescription && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Descripción de la recompensa:</strong>{" "}
                      {business.rewardDescription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
