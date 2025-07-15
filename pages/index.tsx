import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Users,
  Gift,
  Smartphone,
  Heart,
  UserPlus,
  ShoppingCart,
  Stamp,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PublicRoute from "@/components/shared/PublicRoute";
import usePWA from "@/hooks/usePWA";
import PWAInfoCard from "@/components/pwa/PWAInfoCard";

export default function LandingPage() {
  const [tipoAcceso, setTipoAcceso] = useState<"cliente" | "negocio" | null>(
    null
  );

  // Hook PWA para instalación
  const { isInstallable, isInstalled, install } = usePWA();

  return (
    <PublicRoute>
      <Head>
        <title>FirulApp - Programa de Sellos Digital</title>
        <meta
          name="description"
          content="Conecta con tus clientes y recompensa su lealtad con un sistema de sellos digitales fácil de usar."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FirulApp</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Botón de instalación PWA */}
            {isInstallable && !isInstalled && (
              <Button
                onClick={install}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Instalar App</span>
                <span className="sm:hidden">Instalar</span>
              </Button>
            )}

            {/* Indicador de app instalada */}
            {isInstalled && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="hidden sm:inline">App Instalada</span>
                <span className="sm:hidden">✓</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center space-x-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Link href="/admin/login">
                  <Users className="w-4 h-4 mr-1 text-purple-600" />
                  Iniciar sesión Negocio
                </Link>
              </Button>
              <span className="text-gray-400 text-sm hidden sm:block">|</span>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <Link href="/cliente/login">
                  <Smartphone className="w-4 h-4 sm:mr-1 text-purple-600" />
                  Iniciar sesión Cliente
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Programa de Sellos
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Digital
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Conecta con tus clientes y recompensa su lealtad con un sistema de
            sellos digitales fácil de usar.
          </p>

          <div className="text-center mb-16">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Regístrate como:
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold hover:from-purple-600 hover:to-purple-700"
                >
                  <Link href="/negocio/registro">
                    <Users className="w-5 h-5 mr-2" />
                    Negocio
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 border border-gray-200"
                >
                  <Link href="/cliente/registro">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Cliente
                  </Link>
                </Button>
              </div>

              {/* Botón de instalación PWA prominente */}
              {isInstallable && !isInstalled && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    ¿Prefieres usar la app nativa?
                  </p>
                  <Button
                    onClick={install}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold flex items-center gap-2 mx-auto"
                  >
                    <Download className="w-5 h-5" />
                    Instalar Stampia
                  </Button>
                </div>
              )}

              {/* Indicador de app instalada en hero */}
              {isInstalled && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      Stampia instalada ✓
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Proceso de Registro */}
        <section className="py-16 bg-white" id="registro">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Cómo empezar?
            </h2>
            <p className="text-lg text-gray-600 mb-12">
              Elige tu tipo de cuenta y comienza en menos de 2 minutos
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Card Negocio */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-8 rounded-xl text-white shadow-lg flex flex-col justify-between">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">
                  Para Negocios
                </h3>
                <p className="mb-4 text-white/90">
                  Configura tu programa de sellos y comienza a emitir
                  sellos digitales
                </p>
                <ul className="text-sm space-y-1 mb-6 text-left text-white/80">
                  <li>✓ Panel de administración</li>
                  <li>✓ Generación de códigos</li>
                  <li>✓ Estadísticas en tiempo real</li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-white text-purple-600 font-bold hover:bg-purple-100 border-2 border-white"
                >
                  <Link href="/negocio/registro">Crear cuenta de Negocio</Link>
                </Button>
              </div>
              {/* Card Cliente */}
              <div className="bg-white p-8 rounded-xl shadow flex flex-col justify-between">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Para Clientes
                </h3>
                <p className="text-gray-600 mb-4">
                  Crea tu cuenta gratuita y comienza a acumular sellos en tus
                  negocios favoritos
                </p>
                <ul className="text-sm text-gray-600 space-y-1 mb-6 text-left">
                  <li>✓ Registro gratuito</li>
                  <li>✓ Acceso inmediato</li>
                  <li>✓ Sin tarjetas físicas</li>
                </ul>
                <Button
                  asChild
                  className="w-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 border border-gray-200"
                >
                  <Link href="/cliente/registro">Crear cuenta de Cliente</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Pasos */}
        <section id="como-funciona" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona FirulApp?
            </h2>
            <p className="text-xl text-gray-600">
              Un proceso simple y efectivo para fidelizar a tus clientes
            </p>
          </div>

          <div className="max-w-6xl mx-auto px-4">
            {/* Línea conectora purple */}
            <div className="hidden md:block relative h-0 mb-12">
              <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-purple-200 via-purple-400 to-purple-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
              {/* Paso 1 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <UserPlus className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">1</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Registro</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  El negocio se registra y configura su programa de sellos
                  personalizado
                </p>
              </div>
              {/* Paso 2 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">2</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Compra</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  El cliente realiza una compra en el negocio y solicita su
                  sello digital
                </p>
              </div>
              {/* Paso 3 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Stamp className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  Sello Digital
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  El negocio emite un sello digital al cliente a través de la
                  aplicación
                </p>
              </div>
              {/* Paso 4 */}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Gift className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-purple-200 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">4</span>
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Recompensa</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Al completar los sellos, el cliente recibe automáticamente su
                  recompensa
                </p>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¿Listo para empezar?
              </h3>
              <p className="text-gray-600 mb-6">
                Únete a FirulApp y transforma la forma en que fidelizas a tus
                clientes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold"
                >
                  <Link href="/negocio/registro">
                    <Users className="w-5 h-5 mr-2" />
                    Registrarme como Negocio
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 border border-gray-200"
                >
                  <Link href="/cliente/registro">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Registrarme como Cliente
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Información PWA */}
          <div className="mt-12 max-w-2xl mx-auto">
            <PWAInfoCard />
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">FirulApp</h3>
              <p className="text-gray-400">
                La solución digital para programas de sellos que conecta
                negocios con sus clientes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/sobre-nosotros">Sobre Nosotros</Link>
                </li>
                <li>
                  <Link href="/precios">Precios</Link>
                </li>
                <li>
                  <Link href="/contacto">Contacto</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <p className="text-gray-400">info@firulapp.com</p>
              <p className="text-gray-400">+123 456 7890</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">© 2025 FirulApp</h4>
              <p className="text-gray-400 text-sm">
                Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </PublicRoute>
  );
}
