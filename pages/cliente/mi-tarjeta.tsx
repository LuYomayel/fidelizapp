/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  CreditCard,
  Gift,
  QrCode,
  History,
  Settings,
  LogOut,
  Heart,
  Trophy,
  Zap,
  User,
  Calendar,
  Star,
  ArrowRight,
} from "lucide-react";

import {
  formatearNombreCompleto,
  calcularPorcentajeProgreso,
  formatearFecha,
} from "@/utils";

// Componentes shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Client, Reward, Transaction, TransactionType } from "@shared";

export default function MiTarjeta() {
  const [cliente, setCliente] = useState<Client | null>(null);
  const [premios, setPremios] = useState<Reward[]>([]);
  const [transacciones, setTransacciones] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    cargarDatosCliente();
  }, []);

  const cargarDatosCliente = async () => {
    try {
      setIsLoading(true);

      // TODO: Reemplazar con llamadas reales a API
      //await simularRespuestaAPI(null, 1000);

      // Simulamos obtener el cliente logueado (primer cliente del mock)
      //const clienteActual = CLIENTES_MOCK[0];
      //const premiosDisponibles = obtenerPremiosDisponibles();
      //const historialTransacciones = obtenerTransaccionesCliente(
      //  clienteActual.id
      //);

      //setCliente(clienteActual);
      //setPremios(premiosDisponibles);
      //setTransacciones(historialTransacciones);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // TODO: Implementar logout real
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu tarjeta...</p>
        </div>
      </div>
    );
  }

  /*
  if (!cliente) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            No se pudo cargar la información del cliente
          </p>
          <Button asChild>
            <Link href="/cliente/login">Ir al Login</Link>
          </Button>
        </div>
      </div>
    );
  }
  */
  const proximoPremio = premios.find((p) =>
    cliente ? p.points > cliente.points : false
  );
  const progresoProximoPremio =
    proximoPremio && cliente
      ? calcularPorcentajeProgreso(cliente.points, proximoPremio.points)
      : 100;

  return (
    <>
      <Head>
        <title>Mi Tarjeta Digital | FirulApp</title>
        <meta name="description" content="Tu tarjeta de fidelización digital" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-900">
                    Negocio 1 - Cafeteria
                  </h1>
                  <p className="text-sm text-gray-600">Tu tarjeta digital</p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-600"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Tabs defaultValue="tarjeta" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tarjeta" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Mi Tarjeta
              </TabsTrigger>
              <TabsTrigger value="premios" className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Premios
              </TabsTrigger>
              <TabsTrigger
                value="historial"
                className="flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                Historial
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tarjeta" className="mt-6">
              <div className="space-y-6">
                {/* Tarjeta Digital */}
                <Card className="overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {formatearNombreCompleto(
                            //cliente.firstName,
                            //cliente.lastName
                            "Juan",
                            "Perez"
                          )}
                        </h2>
                        <p className="text-blue-100">
                          DNI: 42834567
                          {/* {cliente.documentNumber} */}
                        </p>
                        {/* TODO: Cambiar a DNI */}
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">
                          {/* TODO: Cambiar a puntos */}
                          {/* {cliente.points} */}
                          100
                        </div>
                        <div className="text-sm text-blue-100">puntos</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-100">
                          Escanea para acumular puntos
                        </p>
                        <p className="text-xs text-blue-200">
                          ID: {/* TODO: Cambiar a ID */}
                          {/* {cliente.id} */}1
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progreso del próximo premio */}
                {proximoPremio && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Próximo Premio
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {/* TODO: Cambiar a nombre */}
                            {/* {proximoPremio.nombre} */}
                            Premio 1
                          </span>
                          <Badge variant="outline">
                            {proximoPremio.points - cliente.points} puntos
                            faltantes
                          </Badge>
                        </div>
                        <Progress
                          value={progresoProximoPremio}
                          className="h-2"
                        />
                        <p className="text-sm text-gray-600">
                          {cliente.points} de {proximoPremio.points} puntos
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Información adicional */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-500" />
                      Mi Perfil
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Cliente desde</p>
                        <p className="font-medium">
                          {/* TODO: Cambiar a fecha de registro */}
                          {/* {formatearFecha(cliente.fechaRegistro)} */}
                          2025-01-01
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Puntos actuales</p>
                        <p className="font-medium">
                          {/* TODO: Cambiar a puntos */}
                          {/* {cliente.points} */}
                          100
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="premios" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Premios Disponibles</h2>
                  <Badge variant="secondary">
                    {/* TODO: Cambiar a puntos */}
                    {/* {cliente.points} */}
                    Tienes 100 puntos
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {premios.map((premio) => {
                    const puedeCanjearlo = cliente.points >= premio.points;

                    return (
                      <Card
                        key={premio.id}
                        className={
                          puedeCanjearlo ? "border-green-200 bg-green-50" : ""
                        }
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                              {/* TODO: Cambiar a nombre */}
                              {/* {premio.nombre} */}
                              Premio 1
                            </CardTitle>
                            <Badge
                              variant={puedeCanjearlo ? "default" : "secondary"}
                            >
                              {/* TODO: Cambiar a puntos requeridos */}
                              {/* {premio.pointsRequired} */}
                              100 pts
                            </Badge>
                          </div>
                          <CardDescription>
                            {premio.descripcion}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              {puedeCanjearlo
                                ? "¡Disponible!"
                                : `Te faltan ${
                                    // TODO: Cambiar a puntos requeridos
                                    // {premio.pointsRequired - cliente.points}
                                    100 - 100
                                  } puntos`}
                            </span>
                            <Button
                              size="sm"
                              disabled={!puedeCanjearlo}
                              variant={puedeCanjearlo ? "default" : "outline"}
                            >
                              {puedeCanjearlo ? "Canjear" : "Pronto"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="historial" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    Historial de Transacciones
                  </h2>
                  <Badge variant="outline">
                    {transacciones.length} transacciones
                  </Badge>
                </div>

                <div className="space-y-3">
                  {transacciones.map((transaccion) => (
                    <Card key={transaccion.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                transaccion.tipo === TransactionType.ACUMULATION
                                  ? "bg-green-100"
                                  : "bg-blue-100"
                              }`}
                            >
                              {transaccion.tipo ===
                              TransactionType.ACUMULATION ? (
                                // TODO: Cambiar a icono de acumulación
                                <Star className="w-4 h-4 text-green-600" />
                              ) : (
                                <Gift className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {transaccion.descripcion}
                              </p>
                              <p className="text-sm text-gray-600">
                                {formatearFecha(transaccion.fecha)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`font-medium ${
                                // TODO: Cambiar a color de acumulación
                                transaccion.tipo === TransactionType.ACUMULATION
                                  ? "text-green-600"
                                  : "text-blue-600"
                              }`}
                            >
                              {transaccion.tipo === TransactionType.ACUMULATION
                                ? "+"
                                : "-"}
                              {transaccion.points} pts
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
