import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";
import {
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  QrCode,
  Lock,
  Upload,
  Download,
  RefreshCw,
  Copy,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { showToast } from "@/lib/toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  BusinessSize,
  BusinessType,
  IBusinessProfile,
  IBusinessQRData,
} from "@/shared";
import { validarEmail, validarTelefono } from "@/utils";
import { getImageUrl } from "@/hooks/useConfig";

export default function BusinessProfilePage() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [business, setBusiness] = useState<IBusinessProfile | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [qrData, setQrData] = useState<IBusinessQRData | null>(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [customType, setCustomType] = useState("");
  const [formData, setFormData] = useState<any>({
    businessName: "",
    email: "",
    internalPhone: "",
    externalPhone: "",
    size: BusinessSize.SMALL,
    street: "",
    neighborhood: "",
    postalCode: "",
    province: "",
    type: BusinessType.CAFETERIA,
    instagram: "",
    tiktok: "",
    website: "",
    stampsForReward: 0,
    rewardDescription: "",
  });
  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    const response = await api.business.getProfile();
    if (response.success) {
      setBusiness(response.data || null);
      setFormData({
        businessName: response.data?.businessName || "",
        email: response.data?.email || "",
        internalPhone: response.data?.internalPhone || "",
        externalPhone: response.data?.externalPhone || "",
        size: response.data?.size || BusinessSize.SMALL,
        street: response.data?.street || "",
        neighborhood: response.data?.neighborhood || "",
        postalCode: response.data?.postalCode || "",
        province: response.data?.province || "",
        type: response.data?.type || BusinessType.CAFETERIA,
        customType: response.data?.customType || "",
        instagram: response.data?.instagram || "",
        tiktok: response.data?.tiktok || "",
        website: response.data?.website || "",
        stampsForReward: response.data?.stampsForReward || 0,
        rewardDescription: response.data?.rewardDescription || "",
        logoPath: response.data?.logoPath || "",
      });
      // Cargar customType si existe
      setCustomType(response.data?.customType || "");
    } else {
      setError(response.message || "Error al cargar el negocio");
    }
  };
  const handleChangePassword = async () => {
    setError("");
    setResult("");
    if (
      newPassword === "" ||
      confirmPassword === "" ||
      currentPassword === ""
    ) {
      setError("Por favor, complete todos los campos");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.business.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (response.success) {
        setResult(response.message || "Contraseña actualizada correctamente");
        setTimeout(() => {
          setResult("");
        }, 3000);
        setIsLoading(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
      } else {
        setError(response.message || "Error al cambiar la contraseña");
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error al cambiar la contraseña"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: any = {};

    // Validaciones obligatorias
    if (!formData.businessName.trim()) {
      newErrors.businessName = "El nombre del negocio es obligatorio";
    }

    if (!formData.email) {
      newErrors.email = "El email es obligatorio";
    } else if (!validarEmail(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.externalPhone) {
      newErrors.externalPhone = "El teléfono externo es obligatorio";
    } else if (!validarTelefono(formData.externalPhone)) {
      newErrors.externalPhone = "Teléfono externo inválido";
    }

    // Validaciones de ubicación
    if (!formData.street?.trim()) {
      newErrors.street = "La calle y número son obligatorios";
    }
    if (!formData.neighborhood?.trim()) {
      newErrors.neighborhood = "El barrio es obligatorio";
    }
    if (!formData.postalCode?.trim()) {
      newErrors.postalCode = "El código postal es obligatorio";
    }
    if (!formData.province?.trim()) {
      newErrors.province = "La provincia es obligatoria";
    }

    // Validar tipo otro
    if (formData.type === BusinessType.OTRO && !customType.trim()) {
      newErrors.customType = "Debes especificar el tipo de negocio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: "",
      }));
    }
    // Si cambia el tipo de negocio, limpiar customType y su error
    if (field === "type") {
      if (value !== BusinessType.OTRO) {
        setCustomType("");
      }
      if (errors.customType) {
        setErrors((prev: any) => ({
          ...prev,
          customType: "",
        }));
      }
    }
  };

  const handleUpdateProfile = async () => {
    setError("");
    setResult("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Actualizar perfil del negocio
      const updateData = {
        businessName: formData.businessName,
        email: formData.email,
        size: formData.size,
        street: formData.street,
        neighborhood: formData.neighborhood,
        postalCode: formData.postalCode,
        province: formData.province,
        type: formData.type,
        internalPhone: formData.internalPhone || undefined,
        externalPhone: formData.externalPhone,
        instagram: formData.instagram || undefined,
        tiktok: formData.tiktok || undefined,
        website: formData.website || undefined,
        customType:
          formData.type === BusinessType.OTRO ? customType.trim() : undefined,
      };

      const response = await api.business.updateProfile(updateData);

      // Si hay un logo para actualizar, hacerlo por separado
      if (logoFile) {
        try {
          const formData = new FormData();
          formData.append("logo", logoFile);
          await api.business.updateLogo(formData);
        } catch (logoError) {
          console.error("Error al actualizar el logo:", logoError);
          // No fallar la actualización completa por el logo
        }
      }

      if (response.success) {
        setResult(response.message || "Perfil actualizado correctamente");
        showToast.success("Perfil actualizado correctamente");

        // Actualizar el usuario en el contexto de autenticación
        if (user && response.data) {
          const updatedUser = {
            ...user,
            businessName: response.data.businessName,
          };
          updateUser(updatedUser);
        }

        setTimeout(() => {
          setResult("");
        }, 3000);
        // Recargar los datos del negocio
        await loadBusiness();
        // Limpiar el archivo de logo
        setLogoFile(null);
      } else {
        setError(response.message || "Error al actualizar el perfil");
        showToast.error(response.message || "Error al actualizar el perfil");
      }
    } catch (error: any) {
      console.error("Error al actualizar el perfil:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al actualizar el perfil";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChangeLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev: any) => ({
          ...prev,
          logo: "El archivo debe ser una imagen (JPG, PNG, GIF, WebP)",
        }));
        return;
      }

      // Validar tamaño (max 1MB para evitar problemas en producción)
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        setErrors((prev: any) => ({
          ...prev,
          logo: `El archivo no debe superar los 1MB (actual: ${(
            file.size /
            1024 /
            1024
          ).toFixed(2)}MB)`,
        }));
        return;
      }

      // Validar dimensiones mínimas
      const img = new Image();
      img.onload = () => {
        if (img.width < 100 || img.height < 100) {
          setErrors((prev: any) => ({
            ...prev,
            logo: "La imagen debe tener al menos 100x100 píxeles",
          }));
          return;
        }

        // Si pasa todas las validaciones, guardar el archivo
        setLogoFile(file);

        // Crear preview del archivo
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        setErrors((prev: any) => ({
          ...prev,
          logo: undefined,
        }));
      };

      img.onerror = () => {
        setErrors((prev: any) => ({
          ...prev,
          logo: "Error al cargar la imagen. Verifica que sea un archivo válido.",
        }));
      };

      img.src = URL.createObjectURL(file);
    }
  };

  const handleUpdateLogo = async () => {
    setError("");
    setResult("");
    if (!logoFile) {
      setError("Por favor, seleccione un archivo");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);

      // Debug: Verificar que el FormData contiene el archivo

      const response = await api.business.updateLogo(formData);
      if (!response.success) {
        throw new Error(response.message || "Error al actualizar el logo");
      }
      setResult("Logo actualizado correctamente");
      setTimeout(() => {
        setResult("");
      }, 3000);
      await loadBusiness();
      setLogoFile(null); // Limpiar el archivo después de subir
      setLogoPreview(null); // Limpiar la preview después de subir
    } catch (error: any) {
      console.error("Error al actualizar el logo:", error);
      console.error("Detalles del error:", {
        message: error.message,
        status: error.status,
        response: error.response,
      });
      setError(
        error instanceof Error ? error.message : "Error al actualizar el logo"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    setIsGeneratingQR(true);
    setError("");
    setResult("");

    try {
      const response = await api.business.generateQR();

      if (response.success && response.data) {
        setQrData(response.data);
        setResult("Código QR generado exitosamente");
        setTimeout(() => {
          setResult("");
        }, 3000);
      } else {
        setError(response.message || "Error al generar el código QR");
      }
    } catch (error: any) {
      console.error("Error generando QR:", error);
      setError(
        error instanceof Error ? error.message : "Error al generar el código QR"
      );
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleDownloadQR = () => {
    if (qrData?.qrCode) {
      const link = document.createElement("a");
      link.download = `qr-negocio-${business?.businessName || "stampia"}.png`;
      link.href = qrData.qrCode;
      link.click();
    }
  };

  const handleCopyQRUrl = () => {
    if (qrData?.qrUrl) {
      navigator.clipboard.writeText(qrData.qrUrl);
      setResult("URL copiada al portapapeles");
      setTimeout(() => {
        setResult("");
      }, 2000);
    }
  };
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
                Perfil del Negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información Básica */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Nombre del Negocio *</Label>
                    <Input
                      id="businessName"
                      placeholder="Nombre de tu negocio"
                      value={formData.businessName}
                      onChange={(e) =>
                        handleChange("businessName", e.target.value)
                      }
                      className={errors.businessName ? "border-red-500" : ""}
                    />
                    {errors.businessName && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.businessName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@negocio.com"
                      value={formData.email}
                      disabled
                      onChange={(e) => handleChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="internalPhone">
                      Teléfono Interno &nbsp;
                    </Label>
                    <small className="text-gray-500">
                      (Usado internamente por Stampia – puede ser el mismo que
                      el externo)
                    </small>
                    <Input
                      id="internalPhone"
                      placeholder="Teléfono interno"
                      value={formData.internalPhone}
                      maxLength={11}
                      onChange={(e) =>
                        handleChange("internalPhone", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="externalPhone">
                      Teléfono Externo (Clientes) *
                    </Label>
                    <Input
                      id="externalPhone"
                      placeholder="Teléfono para clientes"
                      value={formData.externalPhone}
                      maxLength={11}
                      onChange={(e) =>
                        handleChange("externalPhone", e.target.value)
                      }
                      className={errors.externalPhone ? "border-red-500" : ""}
                    />
                    {errors.externalPhone && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.externalPhone}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Tamaño del Negocio
                    </Label>
                    <Select
                      value={formData.size}
                      onValueChange={(value) => handleChange("size", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tamaño" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BusinessSize.SMALL}>
                          De 1 - 5 sucursales
                        </SelectItem>
                        <SelectItem value={BusinessSize.MEDIUM}>
                          De 5 - 10 sucursales
                        </SelectItem>
                        <SelectItem value={BusinessSize.LARGE}>
                          +10 sucursales
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Tipo de Negocio
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleChange("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BusinessType.CAFETERIA}>
                          Cafetería
                        </SelectItem>
                        <SelectItem value={BusinessType.RESTAURANT}>
                          Restaurant
                        </SelectItem>
                        <SelectItem value={BusinessType.PELUQUERIA}>
                          Peluquería
                        </SelectItem>
                        <SelectItem value={BusinessType.MANICURA}>
                          Manicura
                        </SelectItem>
                        <SelectItem value={BusinessType.OTRO}>Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.type === BusinessType.OTRO && (
                    <div className="md:col-span-2">
                      <Label
                        htmlFor="tipoOtro"
                        className="text-sm font-medium text-gray-700"
                      >
                        Especifica el tipo *
                      </Label>
                      <Input
                        id="tipoOtro"
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        className={errors.customType ? "border-red-500" : ""}
                        placeholder="Describe tu tipo de negocio"
                      />
                      {errors.customType && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.customType}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Calle y Número *</Label>
                    <Input
                      id="street"
                      placeholder="Av. Corrientes 1234"
                      value={formData.street}
                      onChange={(e) => handleChange("street", e.target.value)}
                      className={errors.street ? "border-red-500" : ""}
                    />
                    {errors.street && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.street}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="neighborhood">Barrio *</Label>
                    <Input
                      id="neighborhood"
                      placeholder="Centro"
                      value={formData.neighborhood}
                      onChange={(e) =>
                        handleChange("neighborhood", e.target.value)
                      }
                      className={errors.neighborhood ? "border-red-500" : ""}
                    />
                    {errors.neighborhood && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.neighborhood}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Código Postal *</Label>
                    <Input
                      id="postalCode"
                      placeholder="1000"
                      value={formData.postalCode}
                      onChange={(e) =>
                        handleChange("postalCode", e.target.value)
                      }
                      className={errors.postalCode ? "border-red-500" : ""}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="province">Provincia *</Label>
                    <Select
                      value={formData.province}
                      onValueChange={(value) => handleChange("province", value)}
                    >
                      <SelectTrigger
                        className={errors.province ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Selecciona la provincia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Buenos Aires">
                          Buenos Aires
                        </SelectItem>
                        <SelectItem value="CABA">
                          Ciudad Autónoma de Buenos Aires
                        </SelectItem>
                        <SelectItem value="Catamarca">Catamarca</SelectItem>
                        <SelectItem value="Chaco">Chaco</SelectItem>
                        <SelectItem value="Chubut">Chubut</SelectItem>
                        <SelectItem value="Córdoba">Córdoba</SelectItem>
                        <SelectItem value="Corrientes">Corrientes</SelectItem>
                        <SelectItem value="Entre Ríos">Entre Ríos</SelectItem>
                        <SelectItem value="Formosa">Formosa</SelectItem>
                        <SelectItem value="Jujuy">Jujuy</SelectItem>
                        <SelectItem value="La Pampa">La Pampa</SelectItem>
                        <SelectItem value="La Rioja">La Rioja</SelectItem>
                        <SelectItem value="Mendoza">Mendoza</SelectItem>
                        <SelectItem value="Misiones">Misiones</SelectItem>
                        <SelectItem value="Neuquén">Neuquén</SelectItem>
                        <SelectItem value="Río Negro">Río Negro</SelectItem>
                        <SelectItem value="Salta">Salta</SelectItem>
                        <SelectItem value="San Juan">San Juan</SelectItem>
                        <SelectItem value="San Luis">San Luis</SelectItem>
                        <SelectItem value="Santa Cruz">Santa Cruz</SelectItem>
                        <SelectItem value="Santa Fe">Santa Fe</SelectItem>
                        <SelectItem value="Santiago del Estero">
                          Santiago del Estero
                        </SelectItem>
                        <SelectItem value="Tierra del Fuego">
                          Tierra del Fuego
                        </SelectItem>
                        <SelectItem value="Tucumán">Tucumán</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.province && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.province}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Redes Sociales */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Redes Sociales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      placeholder="@mi_negocio"
                      value={formData.instagram}
                      onChange={(e) =>
                        handleChange("instagram", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="tiktok">TikTok</Label>
                    <Input
                      id="tiktok"
                      placeholder="@mi_negocio"
                      value={formData.tiktok}
                      onChange={(e) => handleChange("tiktok", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Página Web</Label>
                    <Input
                      id="website"
                      placeholder="https://mi-negocio.com"
                      value={formData.website}
                      onChange={(e) => handleChange("website", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Logo del Negocio */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Logo del Negocio
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo actual */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Logo Actual
                    </h4>
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300">
                      {business?.logoPath ? (
                        <img
                          src={`${getImageUrl(business.logoPath)}`}
                          alt="Logo actual del negocio"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Error cargando imagen:", e);
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextElementSibling?.classList.remove(
                              "hidden"
                            );
                          }}
                        />
                      ) : null}
                      {!business?.logoPath && (
                        <Building className="h-10 w-10 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {business?.logoPath
                        ? "Logo actual del negocio"
                        : "Sin logo"}
                    </p>
                    {business?.logoPath && (
                      <p className="text-xs text-blue-600 mt-1">
                        Ruta: {business.logoPath}
                      </p>
                    )}
                  </div>

                  {/* Preview del nuevo logo */}
                  {logoPreview && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Nuevo Logo (Preview)
                      </h4>
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border-2 border-green-300">
                        <img
                          src={logoPreview}
                          alt="Preview del nuevo logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-green-600 mt-2">
                        Nuevo logo seleccionado
                      </p>
                    </div>
                  )}
                </div>

                {/* Área de subida */}
                <div className="border-t pt-4">
                  <Label
                    htmlFor="logo"
                    className="text-sm font-medium text-gray-700"
                  >
                    Subir Nuevo Logo
                  </Label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="logo"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Subir archivo</span>
                          <input
                            id="logo"
                            name="logo"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChangeLogo}
                          />
                        </label>
                        <p className="pl-1">o arrastra y suelta</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF, WebP hasta 1MB
                      </p>
                      {logoFile && (
                        <div className="space-y-2">
                          <p className="text-sm text-green-600 font-medium">
                            ✓ Archivo seleccionado: {logoFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Tamaño: {(logoFile.size / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.logo && (
                    <p className="mt-1 text-sm text-red-600">
                      {String(errors.logo)}
                    </p>
                  )}

                  {/* Botón para actualizar logo */}
                  {logoFile && (
                    <div className="mt-4 flex items-center space-x-3">
                      <Button
                        onClick={handleUpdateLogo}
                        disabled={isLoading}
                        size="sm"
                      >
                        {isLoading ? "Subiendo..." : "Confirmar y Subir Logo"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mensajes de error/éxito */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {result && (
                <Alert>
                  <AlertDescription>{result}</AlertDescription>
                </Alert>
              )}

              {/* Botón principal de guardar */}
              <div className="border-t pt-6">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  size="lg"
                  className="w-full md:w-auto"
                >
                  {isLoading ? "Guardando..." : "Guardar Todos los Cambios"}
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Este botón guardará toda la información del perfil (excepto el
                  logo, que se sube por separado)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Borrar esto por ahora */}
          {/*
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Configuración de Sellos y Recompensas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stampsForReward">
                    Sellos para Recompensa
                  </Label>
                  <Input
                    id="stampsForReward"
                    type="number"
                    placeholder="10"
                    value={formData.stampsForReward}
                    onChange={(e) =>
                      handleChange("stampsForReward", e.target.value)
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Número de sellos necesarios para obtener una recompensa
                  </p>
                </div>
                <div>
                  <Label htmlFor="rewardDescription">
                    Descripción de Recompensa
                  </Label>
                  <Input
                    id="rewardDescription"
                    placeholder="Ej: Café gratis, 20% de descuento..."
                    value={formData.rewardDescription}
                    onChange={(e) =>
                      handleChange("rewardDescription", e.target.value)
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Descripción de la recompensa que recibirán los clientes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Código QR del Negocio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  📱 ¿Cómo funciona?
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Los clientes escanean este QR con su celular</li>
                  <li>• Se registran automáticamente en tu negocio</li>
                  <li>• Comienzan a acumular sellos en su tarjeta digital</li>
                  <li>
                    • Pueden canjear recompensas cuando alcancen los sellos
                    necesarios
                  </li>
                </ul>
              </div>

              {!qrData ? (
                <div className="text-center py-8">
                  <QrCode className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-4">
                    Genera un código QR único para tu negocio que los clientes
                    pueden escanear para registrarse
                  </p>
                  <Button
                    onClick={handleGenerateQR}
                    disabled={isGeneratingQR}
                    size="lg"
                  >
                    {isGeneratingQR ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <QrCode className="mr-2 h-4 w-4" />
                        Generar Código QR
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  <div className="flex flex-col items-center">
                    <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-300 shadow-lg">
                      <img
                        src={qrData.qrCode}
                        alt="Código QR del negocio"
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-3 font-medium">
                      Código QR de {business?.businessName || "tu negocio"}
                    </p>
                  </div>
            
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      🔗 URL del Negocio
                    </h4>
                    <div className="flex items-center gap-2">
                      <Input
                        value={qrData.qrUrl}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        onClick={handleCopyQRUrl}
                        size="sm"
                        variant="outline"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Esta URL se abre cuando los clientes escanean el QR
                    </p>
                  </div>


                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleDownloadQR}
                      className="flex-1"
                      size="lg"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar QR
                    </Button>
                    <Button
                      onClick={handleGenerateQR}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerar QR
                    </Button>
                  </div>

                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">
                      📋 Instrucciones de Uso
                    </h4>
                    <ol className="text-sm text-green-800 space-y-1">
                      <li>1. Descarga la imagen del código QR</li>
                      <li>2. Imprime el QR en tamaño A4 o más grande</li>
                      <li>3. Colócalo en un lugar visible del mostrador</li>
                      <li>4. Los clientes escanearán con su celular</li>
                      <li>5. Se registrarán automáticamente en tu negocio</li>
                    </ol>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          */}
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
              {result && (
                <p className="text-green-500 text-sm mb-2">{result}</p>
              )}
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              <Button onClick={handleChangePassword} disabled={isLoading}>
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>
        </div>

        {/*
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-900 mb-2">
            ✅ Funcionalidad Completa
          </h3>
          <p className="text-green-800">
            Ya puedes editar toda la información de tu negocio, cambiar tu
            contraseña, subir tu logo y generar códigos QR para que los clientes
            se registren en tu negocio. ¡Todo listo para fidelizar a tus
            clientes!
          </p>
        </div>
        */}
      </div>
    </AuthenticatedLayout>
  );
}
