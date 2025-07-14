import React from "react";
import { useRouter } from "next/router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift } from "lucide-react";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";
import ClientRedemptionHistory from "@/components/cliente/ClientRedemptionHistory";
import ClientRewardsList from "@/components/cliente/ClientRewardsList";
import ClientClaims from "@/components/cliente/ClientClaims";

export default function ClienteRecompensasPage() {
  return (
    <AuthenticatedLayout title="Recompensas">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Tabs para Recompensas e Historial */}
        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 mb-20 sm:mb-3 md:mb-4">
            <TabsTrigger
              value="rewards"
              className="text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-2"
            >
              Recompensas Disponibles
            </TabsTrigger>
            <TabsTrigger
              value="claims"
              className="text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-2"
            >
              Mis Reclamos
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-2"
            >
              Historial de Canjes
            </TabsTrigger>
          </TabsList>

          {/* Tab de Recompensas Disponibles */}
          <TabsContent value="rewards" className="space-y-4 sm:space-y-6">
            <ClientRewardsList
              title="Recompensas Disponibles"
              description="Canjea tus sellos por increíbles recompensas"
            />
          </TabsContent>

          {/* Tab de Reclamos */}
          <TabsContent value="claims" className="space-y-4 sm:space-y-6">
            <ClientClaims
              title="Mis Reclamos"
              description="Historial de recompensas que has canjeado"
            />
          </TabsContent>

          {/* Tab de Historial */}
          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            <ClientRedemptionHistory
              title="Historial de Canjes de Sellos"
              description="Historial completo de códigos de sellos que has canjeado"
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
