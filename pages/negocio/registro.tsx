import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { Building2, ArrowLeft, Upload, Check } from "lucide-react";

// Importar utilidades y tipos
import { validarEmail, validarTelefono } from "@/utils";
import {
  BusinessSize,
  BusinessType,
  CreateBusinessDto,
  IBusiness,
} from "@shared";
import { api } from "../../lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

// Componentes shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default function RegistroNegocio() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<IBusiness>({
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
    password: "",
  });

  const [customType, setCustomType] = useState("");

  const [errors, setErrors] = useState<any>({
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
    customType: "",
    instagram: "",
    tiktok: "",
    website: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateBusinessDto> = {};

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Construir FormData para envío multipart
      const formDataToSend = new FormData();
      formDataToSend.append("businessName", formData.businessName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.email);
      formDataToSend.append("size", formData.size);
      if (formData.street) formDataToSend.append("street", formData.street);
      if (formData.neighborhood)
        formDataToSend.append("neighborhood", formData.neighborhood);
      if (formData.postalCode)
        formDataToSend.append("postalCode", formData.postalCode);
      if (formData.province)
        formDataToSend.append("province", formData.province);
      formDataToSend.append("type", formData.type);
      if (formData.type === BusinessType.OTRO && customType.trim()) {
        formDataToSend.append("customType", customType.trim());
      }
      if (formData.internalPhone)
        formDataToSend.append("internalPhone", formData.internalPhone);
      if (formData.externalPhone)
        formDataToSend.append("externalPhone", formData.externalPhone);
      if (formData.instagram)
        formDataToSend.append("instagram", formData.instagram);
      if (formData.tiktok) formDataToSend.append("tiktok", formData.tiktok);
      if (formData.website) formDataToSend.append("website", formData.website);
      if (logoFile) formDataToSend.append("logo", logoFile);

      const response: any = await api.businesses.register(formDataToSend);
      if (!response.success) {
        throw new Error(response.message || "Error en el registro");
      }

      // Login automático con los datos recibidos
      if (response.data && response.data.tokens && response.data.business) {
        login({
          tokens: response.data.tokens,
          user: response.data.business,
          userType: "admin",
        });

        setRegistroExitoso(true);

        // Redirigir al dashboard después de un momento
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 2000);
      } else {
        // Fallback si no vienen los tokens (compatibilidad)
        setRegistroExitoso(true);
        setTimeout(() => {
          router.push("/admin/login");
        }, 3000);
      }
    } catch (error: any) {
      console.log(error);
      // @ts-ignore
      setErrors({
        email: error.message || "Error al registrar. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    // @ts-ignore
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        // @ts-ignore
        setErrors((prev) => ({
          ...prev,
          logo: "El archivo debe ser una imagen",
        }));
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        // @ts-ignore
        setErrors((prev) => ({
          ...prev,
          logo: "El archivo no debe superar los 5MB",
        }));
        return;
      }

      setLogoFile(file);
      // @ts-ignore
      setErrors((prev) => ({
        ...prev,
        logo: undefined,
      }));
    }
  };

  if (registroExitoso) {
    return (
      <>
        <Head>
          <title>Registro Exitoso | FirulApp</title>
        </Head>

        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                </div>

                <CardTitle className="text-2xl mb-4">
                  ¡Registro Exitoso!
                </CardTitle>

                <CardDescription className="mb-6">
                  Tu negocio ha sido registrado correctamente y se ha iniciado
                  sesión automáticamente. Serás redirigido al panel de
                  administración en unos segundos...
                </CardDescription>

                <Button asChild>
                  <Link href="/admin/dashboard">Ir al Panel de Admin</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Registro de Negocio | FirulApp</title>
        <meta
          name="description"
          content="Registra tu negocio para comenzar tu programa de fidelización digital"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Button variant="ghost" asChild className="mb-8">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Registrar Negocio
            </h1>
            <p className="mt-2 text-gray-600">
              Crea tu programa de fidelización digital
            </p>
          </div>

          {/* Formulario */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información básica */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    Información Básica
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="nombre"
                        className="text-sm font-medium text-gray-700"
                      >
                        Nombre del Negocio *
                      </Label>
                      <Input
                        id="nombre"
                        value={formData.businessName}
                        onChange={(e) =>
                          handleChange("businessName", e.target.value)
                        }
                        className={errors.businessName ? "border-red-500" : ""}
                        placeholder="Mi Negocio"
                      />
                      {errors.businessName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.businessName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700"
                      >
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                        placeholder="negocio@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="telefonoInterno"
                        className="text-sm font-medium text-gray-700"
                      >
                        Teléfono Interno &nbsp;
                      </Label>
                      <small className="text-gray-500">
                        (Usado internamente por Fidelizapp – puede ser el mismo
                        que el externo)
                      </small>
                      <Input
                        id="telefonoInterno"
                        value={formData.internalPhone}
                        onChange={(e) =>
                          handleChange("internalPhone", e.target.value)
                        }
                        className={errors.internalPhone ? "border-red-500" : ""}
                        placeholder="+54 11 1234-5678"
                      />
                      {errors.internalPhone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.internalPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="telefonoExterno"
                        className="text-sm font-medium text-gray-700"
                      >
                        Teléfono Externo (Clientes) *
                      </Label>
                      <Input
                        id="telefonoExterno"
                        value={formData.externalPhone}
                        onChange={(e) =>
                          handleChange("externalPhone", e.target.value)
                        }
                        className={errors.externalPhone ? "border-red-500" : ""}
                        placeholder="+54 11 1234-5678"
                      />
                      {errors.externalPhone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.externalPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Tamaño del Negocio *
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
                        Tipo de Negocio *
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
                          <SelectItem value={BusinessType.OTRO}>
                            Otro
                          </SelectItem>
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
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    Ubicación
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="calle"
                        className="text-sm font-medium text-gray-700"
                      >
                        Calle y Número *
                      </Label>
                      <Input
                        id="calle"
                        value={formData.street}
                        onChange={(e) => handleChange("street", e.target.value)}
                        className={errors.street ? "border-red-500" : ""}
                        placeholder="Av. Corrientes 1234"
                      />
                      {errors.street && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.street}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="barrio"
                        className="text-sm font-medium text-gray-700"
                      >
                        Barrio *
                      </Label>
                      <Input
                        id="barrio"
                        value={formData.neighborhood}
                        onChange={(e) =>
                          handleChange("neighborhood", e.target.value)
                        }
                        className={errors.neighborhood ? "border-red-500" : ""}
                        placeholder="Centro"
                      />
                      {errors.neighborhood && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.neighborhood}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="codigoPostal"
                        className="text-sm font-medium text-gray-700"
                      >
                        Código Postal *
                      </Label>
                      <Input
                        id="codigoPostal"
                        value={formData.postalCode}
                        onChange={(e) =>
                          handleChange("postalCode", e.target.value)
                        }
                        className={errors.postalCode ? "border-red-500" : ""}
                        placeholder="1000"
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
                        onValueChange={(value) =>
                          handleChange("province", value)
                        }
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

                {/* Logo */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    Logo (Opcional)
                  </h2>

                  <div>
                    <Label
                      htmlFor="logo"
                      className="text-sm font-medium text-gray-700"
                    >
                      Subir Logo
                    </Label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
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
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF hasta 5MB
                        </p>
                        {logoFile && (
                          <p className="text-sm text-green-600">
                            Archivo seleccionado: {logoFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                    {errors.logo && (
                      <p className="mt-1 text-sm text-red-600">
                        {String(errors.logo)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Redes Sociales */}
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                    Redes Sociales (Opcional)
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label
                        htmlFor="instagram"
                        className="text-sm font-medium text-gray-700"
                      >
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        value={formData.instagram || ""}
                        onChange={(e) =>
                          handleChange("instagram", e.target.value)
                        }
                        placeholder="@mi_negocio"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="tiktok"
                        className="text-sm font-medium text-gray-700"
                      >
                        TikTok
                      </Label>
                      <Input
                        id="tiktok"
                        value={formData.tiktok || ""}
                        onChange={(e) => handleChange("tiktok", e.target.value)}
                        placeholder="@mi_negocio"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label
                        htmlFor="paginaOficial"
                        className="text-sm font-medium text-gray-700"
                      >
                        Página Oficial
                      </Label>
                      <Input
                        id="paginaOficial"
                        value={formData.website || ""}
                        onChange={(e) =>
                          handleChange("website", e.target.value)
                        }
                        placeholder="https://www.mi-negocio.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Error general */}
                {errors.businessName && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.businessName}</AlertDescription>
                  </Alert>
                )}

                {/* Botones */}
                <div className="border-t pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {isLoading ? "Registrando..." : "Registrar Negocio"}
                    </Button>

                    <Button variant="outline" asChild>
                      <Link href="/admin/login">Ya tengo cuenta</Link>
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
