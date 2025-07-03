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
  CreateBusinessFormData,
} from "../../../shared";
import { api } from "../../lib/api-client";

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
    password: "",
  });

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
      const data: CreateBusinessDto = {
        businessName: formData.businessName,
        email: formData.email,
        internalPhone: formData.internalPhone || undefined,
        externalPhone: formData.externalPhone || undefined,
        size: formData.size,
        street: formData.street,
        neighborhood: formData.neighborhood,
        postalCode: formData.postalCode,
        province: formData.province,
        type: formData.type,
        instagram: formData.instagram || undefined,
        tiktok: formData.tiktok || undefined,
        website: formData.website || undefined,
        password: formData.email,

        active: true,

        logo: logoFile ? logoFile : undefined,
      };
      const response = await api.businesses.register(data);
      console.log(response);

      if (!response.success) {
        throw new Error("Error en el registro");
      }

      setRegistroExitoso(true);

      // Redirigir después de un momento
      setTimeout(() => {
        router.push("/admin/login");
      }, 3000);
    } catch (error) {
      console.log(error);
      // @ts-ignore
      setErrors({
        businessName: "Error al registrar. Intenta nuevamente.",
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
                  Tu negocio ha sido registrado correctamente. Serás redirigido
                  al panel de administración en unos segundos...
                </CardDescription>

                <Button asChild>
                  <Link href="/admin/login">Ir al Panel de Admin</Link>
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
                        Teléfono Interno
                      </Label>
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
                          value={formData.type || ""}
                          onChange={(e) => handleChange("type", e.target.value)}
                          className={errors.type ? "border-red-500" : ""}
                          placeholder="Describe tu tipo de negocio"
                        />
                        {errors.type && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.type}
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
                      <Label
                        htmlFor="provincia"
                        className="text-sm font-medium text-gray-700"
                      >
                        Provincia *
                      </Label>
                      <Input
                        id="provincia"
                        value={formData.province}
                        onChange={(e) =>
                          handleChange("province", e.target.value)
                        }
                        className={errors.province ? "border-red-500" : ""}
                        placeholder="CABA"
                      />
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
