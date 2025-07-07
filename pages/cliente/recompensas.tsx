import React from "react";
import { useRouter } from "next/router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift } from "lucide-react";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";
import ClientRedemptionHistory from "@/components/cliente/ClientRedemptionHistory";
import ClientRewardsList from "@/components/cliente/ClientRewardsList";

export default function ClienteRecompensasPage() {
  return (
    <AuthenticatedLayout title="Recompensas">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rewards">Recompensas Disponibles</TabsTrigger>
            <TabsTrigger value="history">Mi Historial</TabsTrigger>
          </TabsList>

          {/* Tab de Recompensas Disponibles */}
          <TabsContent value="rewards" className="space-y-6">
            <ClientRewardsList />
          </TabsContent>

          {/* Tab de Historial */}
          <TabsContent value="history" className="space-y-6">
            <ClientRedemptionHistory />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
