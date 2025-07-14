import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingState } from "@/components/ui/loading-state";
import { PendingRedemptions } from "@/components/admin/PendingRedemptions";
import { DeliveredRedemptions } from "@/components/admin/DeliveredRedemptions";
import { Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { AuthenticatedLayout } from "@/components/shared/AuthenticatedLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { api } from "@/lib/api-client";
import { toast } from "react-hot-toast";
import { IRedemptionDashboard } from "@shared";

export default function CanjesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<IRedemptionDashboard | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await api.rewards.getRedemptionDashboard();

      if (response.success && response.data) {
        setDashboard(response.data);
      } else {
        toast.error("Error al cargar el dashboard de reclamos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedUserTypes={["admin"]}>
        <AuthenticatedLayout title="Gestión de Canjes">
          <LoadingState />
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedUserTypes={["admin"]}>
      <AuthenticatedLayout title="Gestión de Canjes">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Canjes
              </h1>
              <p className="text-gray-600 mt-1">
                Administra las recompensas canjeadas por tus clientes
              </p>
            </div>
            <Button onClick={loadDashboard} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Pendientes
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {dashboard?.totalPending || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Entregados
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboard?.totalDelivered || 0}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Expirados
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {dashboard?.totalExpired || 0}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">Canjes Pendientes</TabsTrigger>
              <TabsTrigger value="delivered">Canjes Entregados</TabsTrigger>
            </TabsList>

            {/* Tab de Canjes Pendientes */}
            <TabsContent value="pending" className="space-y-4">
              <PendingRedemptions
                dashboard={dashboard}
                onRefresh={loadDashboard}
              />
            </TabsContent>

            {/* Tab de Canjes Entregados */}
            <TabsContent value="delivered" className="space-y-4">
              <DeliveredRedemptions
                dashboard={dashboard}
                onRefresh={loadDashboard}
              />
            </TabsContent>
          </Tabs>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
