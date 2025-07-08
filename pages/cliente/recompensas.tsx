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
        {/*}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recompensas</h1>
            <p className="text-gray-600 mt-1">
              Canjea tus sellos por increíbles recompensas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              Sistema de recompensas
            </span>
          </div>
        </div>
        */}
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
              Reclamos
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs sm:text-sm lg:text-base px-2 sm:px-3 lg:px-4 py-2"
            >
              Mi Historial
            </TabsTrigger>
          </TabsList>

          {/* Tab de Recompensas Disponibles */}
          <TabsContent value="rewards" className="space-y-4 sm:space-y-6">
            <ClientRewardsList />
          </TabsContent>

          {/* Tab de Reclamos */}
          <TabsContent value="claims" className="space-y-4 sm:space-y-6">
            <ClientClaims />
          </TabsContent>

          {/* Tab de Historial */}
          <TabsContent value="history" className="space-y-4 sm:space-y-6">
            <ClientRedemptionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
