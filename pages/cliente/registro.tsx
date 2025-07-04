import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { UserPlus, ArrowLeft, Check } from "lucide-react";

// Importar utilidades y tipos
import { validarEmail } from "@/utils";
import { ClientRegistrationForm, CreateClientDto } from "@shared";
import { api } from "@/lib/api-client";

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

// Componente Google OAuth
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function ClienteRegistro() {
  const [formData, setFormData] = useState<ClientRegistrationForm>({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [errors, setErrors] = useState<Partial<ClientRegistrationForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientRegistrationForm> = {};

    // Validación nombre
    if (!formData.firstName.trim()) {
      newErrors.firstName = "El nombre es obligatorio";
    }

    // Validación apellido
    if (!formData.lastName.trim()) {
      newErrors.lastName = "El apellido es obligatorio";
    }

    // Validación email
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!validarEmail(formData.email.trim())) {
      newErrors.email = "Email inválido";
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
      const createClientDto: CreateClientDto = {
        ...formData,
        password: formData.email,
      };
      const response = await api.clients.register(createClientDto);
      if (response.success) {
        setRegistroExitoso(true);
        setTimeout(() => {
          router.push("/cliente/login");
        }, 3000);
      } else {
        console.log(response);
        setErrors({ email: response.message });
      }
    } catch (error: any) {
      setErrors({
        email: error.message || "Error al registrar. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof ClientRegistrationForm]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
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
                  Tu cuenta ha sido creada correctamente. Serás redirigido al
                  login en unos segundos...
                </CardDescription>

                <Button asChild>
                  <Link href="/cliente/login">Ir al Login</Link>
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
        <title>Registro Cliente | FirulApp</title>
        <meta
          name="description"
          content="Crea tu cuenta para comenzar a acumular puntos en tus negocios favoritos"
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-md mx-auto">
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
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Crear Cuenta Cliente
            </h1>
            <p className="mt-2 text-gray-600">
              Completa los datos para comenzar a acumular puntos
            </p>
          </div>

          {/* Formulario */}
          <Card>
            <CardContent className="pt-6">
              {/* Opción Google OAuth */}
              <div className="mb-6">
                <GoogleSignInButton
                  text="Registrarse con Google"
                  className="w-full"
                />

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">
                      O completa el formulario
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div>
                  <Label
                    htmlFor="nombre"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nombre *
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "border-red-500" : ""}
                    placeholder="Tu nombre"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Apellido */}
                <div>
                  <Label
                    htmlFor="apellido"
                    className="text-sm font-medium text-gray-700"
                  >
                    Apellido *
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "border-red-500" : ""}
                    placeholder="Tu apellido"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="border-t pt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {isLoading ? "Registrando..." : "Crear Cuenta"}
                    </Button>

                    <Button variant="outline" asChild>
                      <Link href="/cliente/login">Ya tengo cuenta</Link>
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Al crear una cuenta, aceptas nuestros{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                términos de servicio
              </a>{" "}
              y{" "}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                política de privacidad
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
