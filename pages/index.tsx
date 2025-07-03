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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// TODO: Importar contextos y componentes cuando estén listos
// import { useRouter } from 'next/router';

export default function LandingPage() {
  const [tipoAcceso, setTipoAcceso] = useState<"cliente" | "negocio" | null>(
    null
  );

  return (
    <>
      <Head>
        <title>FirulApp - Programa de Fidelización Digital</title>
        <meta
          name="description"
          content="Conecta con tus clientes y recompensa su lealtad con un sistema de sellos digitales fácil de usar."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">FirulApp</span>
          </div>

          <div className="flex space-x-4">
            <Button asChild variant="ghost" className="px-4 py-2 text-sm">
              <Link href="/cliente/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild variant="outline" className="px-4 py-2 text-sm">
              <Link href="#como-funciona">Registrarse</Link>
            </Button>
          </div>
        </header>

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Programa de Fidelización
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              Digital
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Conecta con tus clientes y recompensa su lealtad con un sistema de
            sellos digitales fácil de usar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild>
              <Link href="/negocio/registro">Soy un Negocio</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/cliente/registro">Soy un Cliente</Link>
            </Button>
          </div>
        </section>

        {/* Características */}
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid md:grid-cols-3 gap-8"
          id="caracteristicas"
        >
          {/* Negocios */}
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Para Negocios
            </h3>
            <p className="text-gray-600 mb-6">
              Gestiona tu programa de fidelización
            </p>
            <ul className="text-sm text-gray-500 space-y-2 text-left mx-auto max-w-xs">
              <li>• Configura tu perfil de negocio</li>
              <li>• Establece umbrales de sellos y recompensas</li>
              <li>• Emite sellos digitales a tus clientes</li>
              <li>• Visualiza métricas y estadísticas</li>
            </ul>
            <Button asChild className="w-full mt-6">
              <Link href="/negocio/registro">Registrar mi Negocio</Link>
            </Button>
          </Card>

          {/* Clientes */}
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Para Clientes
            </h3>
            <p className="text-gray-600 mb-6">
              Acumula sellos y obtén recompensas
            </p>
            <ul className="text-sm text-gray-500 space-y-2 text-left mx-auto max-w-xs">
              <li>• Crea tu cuenta de cliente</li>
              <li>• Acumula sellos en tus negocios favoritos</li>
              <li>• Visualiza tu progreso hacia recompensas</li>
              <li>• Canjea tus recompensas fácilmente</li>
            </ul>
            <Button asChild variant="secondary" className="w-full mt-6">
              <Link href="/cliente/registro">Registrarme como Cliente</Link>
            </Button>
          </Card>

          {/* Cómo funciona */}
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Gift className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Cómo Funciona
            </h3>
            <p className="text-gray-600 mb-6">Simple, rápido y efectivo</p>
            <ul className="text-sm text-gray-500 space-y-2 text-left mx-auto max-w-xs">
              <li>• Los negocios emiten sellos digitales</li>
              <li>• Los clientes acumulan sellos por compras</li>
              <li>• Al alcanzar el umbral, obtienen recompensas</li>
              <li>• Sin tarjetas físicas, todo digital</li>
            </ul>
            <Button asChild variant="outline" className="w-full mt-6">
              <Link href="#como-funciona">Más Información</Link>
            </Button>
          </Card>
        </section>

        {/* Pasos */}
        <section id="como-funciona" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona FirulApp?
            </h2>
            <p className="text-xl text-gray-600">
              Un proceso simple para fidelizar a tus clientes
            </p>
          </div>

          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-4 gap-8">
            {/* Paso 1 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center mx-auto">
                <UserPlus className="w-9 h-9 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Registro</h3>
              <p className="text-sm text-gray-600">
                El negocio se registra y configura su programa
              </p>
            </div>

            {/* Paso 2 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-purple-500 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-9 h-9 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Compra</h3>
              <p className="text-sm text-gray-600">
                El cliente realiza una compra en el negocio
              </p>
            </div>

            {/* Paso 3 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto">
                <Stamp className="w-9 h-9 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Sello</h3>
              <p className="text-sm text-gray-600">
                El negocio emite un sello digital al cliente
              </p>
            </div>

            {/* Paso 4 */}
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center mx-auto">
                <Gift className="w-9 h-9 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Recompensa</h3>
              <p className="text-sm text-gray-600">
                Al completar los sellos, el cliente recibe su recompensa
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">FirulApp</h3>
              <p className="text-gray-400">
                La solución digital para programas de fidelización que conecta
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
    </>
  );
}
