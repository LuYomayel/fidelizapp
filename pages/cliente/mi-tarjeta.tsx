import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { api } from "../../lib/api-client";
import { IClientCardWithReward } from "@shared";
import { ProtectedRoute } from "../../components/shared/ProtectedRoute";
import { AuthenticatedLayout } from "../../components/shared/AuthenticatedLayout";
import ClientRewardsList from "@/components/cliente/ClientRewardsList";
import ClientRedemptionHistory from "@/components/cliente/ClientRedemptionHistory";
import ClientGeneralHistory from "@/components/cliente/ClientGeneralHistory";
import ClientCardsGrid from "@/components/cliente/ClientCardsGrid";
import ClientClaims from "@/components/cliente/ClientClaims";

export default function MiTarjetaPage() {
  const router = useRouter();
  const [clientCards, setClientCards] = useState<IClientCardWithReward[]>([]);

  const [selectedCard, setSelectedCard] =
    useState<IClientCardWithReward | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClientCards();
  }, []);

  const loadClientCards = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.clientCards.getAll();

      if (response.success && response.data) {
        setClientCards(response.data);

        if (response.data.length > 0) {
          setSelectedCard(response.data[0]);
        }
      } else {
        throw new Error(response.message || "Error al cargar las tarjetas");
      }
    } catch (err) {
      console.error("Error cargando tarjetas:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardSelect = (card: IClientCardWithReward) => {
    setSelectedCard(card);
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={["client"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tus tarjetas...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  {
    /*if (error) {
    return (
      <ProtectedRoute allowedUserTypes={["client"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
            <Button onClick={loadClientCards} className="w-full">
              Reintentar
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }
  */
  }

  if (clientCards.length === 0) {
    return (
      <ProtectedRoute allowedUserTypes={["client"]}>
        <AuthenticatedLayout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No tienes tarjetas aún
              </h2>
              <p className="text-gray-600 mb-6">
                Comienza canjeando tu primer código para crear tu primera
                tarjeta
              </p>
              <Button
                onClick={() => router.push("/cliente/canjear-codigo")}
                className="w-full"
                size="lg"
              >
                Canjear Código
              </Button>
            </div>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={["client"]}>
      <AuthenticatedLayout>
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-2">
              <div className="">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Mis Tarjetas de Fidelización
                </h1>
                <p className="text-gray-600">
                  Gestiona tus sellos y recompensas en todos los negocios
                </p>
              </div>
              <div className="flex justify-center md:justify-end items-center align-items-center space-x-4">
                <Button
                  onClick={() => router.push("/cliente/canjear-codigo")}
                  size="lg"
                >
                  Canjear Código
                </Button>
              </div>
            </div>

            <Tabs defaultValue="cards" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="cards">🎫 Mis Tarjetas</TabsTrigger>
                <TabsTrigger value="stamps">📊 Sellos canjeados</TabsTrigger>
                <TabsTrigger value="rewards">🎁 Recompensas</TabsTrigger>
                <TabsTrigger value="claims">📋 Reclamos</TabsTrigger>
              </TabsList>

              <TabsContent value="cards" className="mt-6">
                <ClientCardsGrid
                  cards={clientCards}
                  selectedCardId={selectedCard?.id}
                  onCardSelect={handleCardSelect}
                  onRewardRedeemed={loadClientCards}
                />
              </TabsContent>

              <TabsContent value="stamps" className="mt-6">
                <ClientRedemptionHistory
                  title="Historial de Canjes de Sellos"
                  description="Historial completo de códigos de sellos que has canjeado"
                />
              </TabsContent>

              <TabsContent value="rewards" className="mt-6">
                <ClientRewardsList
                  title="Recompensas de Mis Negocios"
                  description="Todas las recompensas disponibles en los negocios donde tienes tarjetas"
                />
              </TabsContent>

              <TabsContent value="claims" className="mt-6">
                <ClientClaims
                  title="Mis Reclamos de Recompensas"
                  description="Historial completo de recompensas que has canjeado"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
