import {
  ApiResponse,
  LoginBusinessDto,
  LoginClientDto,
  CreateBusinessDto,
  CreateClientDto,
  UpdateBusinessDto,
  IBusiness,
  // Nuevas interfaces para sistema de sellos
  IStamp,
  IClientCard,
  IStampRedemption,
  CreateStampDto,
  RedeemStampDto,
  StampSummaryDto,
  ClientCardSummaryDto,
  PaginatedResponse,
  PaginationParams,
  StampFilters,
  ClientCardFilters,
  StampType,
  PurchaseType,
  IBusinessClient,
  IDashboard,
  // Nuevas interfaces para sistema de reclamos
  IRedemptionTicket,
  IRedemptionDashboard,
  IDeliverRedemptionDto,
  IRedemptionFilters,
  RedemptionStatus,
  IReward,
  IRewardRedemption,
  IRewardStatistics,
} from "@shared";
// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
console.log("API_BASE_URL", API_BASE_URL);
// Función helper para obtener el token desde el store
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;

    const parsed = JSON.parse(authStorage);
    return parsed?.state?.tokens?.accessToken || null;
  } catch (error) {
    console.warn("Error al obtener token:", error);
    return null;
  }
}

// Función helper para hacer peticiones HTTP
async function fetchAPI<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}/api${endpoint}`;

  // Obtener token automáticamente
  const token = getAuthToken();

  // Construir headers base - SIEMPRE definidos
  const isFormData = options.body instanceof FormData;
  const baseHeaders = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Combinar con headers adicionales
  const finalHeaders = {
    ...baseHeaders,
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers: finalHeaders,
  };

  try {
    const response = await fetch(url, config);
    // Si el token ha expirado, intentar refrescar
    if (response.status === 401 && token) {
      const refreshSuccess = await refreshAuthToken();

      if (refreshSuccess) {
        // Reintentar la petición con el nuevo token
        const newToken = getAuthToken();
        if (newToken && newToken !== token) {
          // Reconstruir headers completamente para el reintento
          const retryHeaders = {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
            ...options.headers, // Preservar headers originales
          };

          const newConfig: RequestInit = {
            ...options,
            headers: retryHeaders,
          };

          const retryResponse = await fetch(url, newConfig);

          if (!retryResponse.ok) {
            console.error(
              `❌ Error en reintento: ${retryResponse.status} ${retryResponse.statusText}`
            );

            // Capturar el texto del error para debugging
            try {
              const errorText = await retryResponse.text();
              console.error(`📄 Error body:`, errorText);
            } catch (e) {
              console.error(`❌ No se pudo leer el error body:`, e);
            }

            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }

          return await retryResponse.json();
        }
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        // Token inválido o expirado definitivamente
        console.warn("🚪 Sesión expirada, redirigiendo al login...");
        clearAuthAndRedirect();
        throw new Error("Sesión expirada");
      }

      // Leer el JSON de error formateado por HttpExceptionFilter
      try {
        const errorData = await response.json();
        //console.error(`❌ Error HTTP ${response.status}:`, errorData);

        // Si el backend devuelve el formato estructurado, usar ese mensaje
        if (errorData && !errorData.success && errorData.message) {
          const errorMessage =
            Array.isArray(errorData.errors) && errorData.errors.length > 0
              ? errorData.errors.join(", ")
              : errorData.message;
          console.log("errorMessage", errorMessage);
          throw new Error(errorMessage);
        }

        // Fallback al formato anterior
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      } catch (_jsonError) {
        // Si no se puede parsear el JSON, usar el formato anterior
        console.log((_jsonError as Error).message);
        throw new Error((_jsonError as Error).message);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Error en petición a ${url}:`, error);
    throw error;
  }
}

// Función para refrescar el token
async function refreshAuthToken(): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false;

    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return false;

    const parsed = JSON.parse(authStorage);
    const refreshToken = parsed?.state?.tokens?.refreshToken;

    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();

    if (data.success) {
      // Actualizar el localStorage con los nuevos tokens
      const currentState = parsed.state;
      const newState = {
        ...currentState,
        tokens: data.data.tokens,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      };

      localStorage.setItem(
        "auth-storage",
        JSON.stringify({
          ...parsed,
          state: newState,
        })
      );

      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Error al renovar token:", error);
    return false;
  }
}

// Función para limpiar autenticación y redirigir
function clearAuthAndRedirect(): void {
  if (typeof window === "undefined") return;

  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      const userType = parsed?.state?.userType;
      localStorage.removeItem("auth-storage");

      // Redirigir según el tipo de usuario
      if (userType === "client") {
        window.location.href = "/cliente/login";
      } else {
        window.location.href = "/admin/login";
      }
    } else {
      // Si no hay información de usuario, redirigir al login de admin por defecto
      console.log(
        "no hay información de usuario, redirigir al login de admin por defecto"
      );
      localStorage.removeItem("auth-storage");
      window.location.href = "/admin/login";
    }
  } catch (error) {
    console.error("Error al limpiar autenticación:", error);
    localStorage.removeItem("auth-storage");
    window.location.href = "/admin/login";
  }
}

// Tipos para las respuestas de API

// Exportar las funciones de API
export const apiClient = {
  get: <T = unknown>(endpoint: string, headers?: Record<string, string>) =>
    fetchAPI<ApiResponse<T>>(endpoint, { method: "GET", headers }),

  post: <T = unknown>(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ) =>
    fetchAPI<ApiResponse<T>>(endpoint, {
      method: "POST",
      body:
        data instanceof FormData
          ? (data as FormData)
          : data
          ? JSON.stringify(data)
          : undefined,
      headers,
    }),

  put: <T = unknown>(endpoint: string, data?: unknown, headers?: unknown) =>
    fetchAPI<ApiResponse<T>>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers: headers as any,
    }),

  patch: <T = unknown>(endpoint: string, data?: unknown, headers?: unknown) =>
    fetchAPI<ApiResponse<T>>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      headers: headers as any,
    }),

  delete: <T = unknown>(endpoint: string, headers?: Record<string, string>) =>
    fetchAPI<ApiResponse<T>>(endpoint, { method: "DELETE", headers }),

  // Función helper para peticiones autenticadas explícitas
  authenticated: {
    get: <T = unknown>(endpoint: string, headers?: Record<string, string>) =>
      apiClient.get<T>(endpoint, headers),
    post: <T = unknown>(
      endpoint: string,
      data?: Record<string, unknown>,
      headers?: Record<string, string>
    ) => apiClient.post<T>(endpoint, data, headers),
    put: <T = unknown>(
      endpoint: string,
      data?: Record<string, unknown>,
      headers?: Record<string, string>
    ) => apiClient.put<T>(endpoint, data, headers),
    delete: <T = unknown>(endpoint: string, headers?: Record<string, string>) =>
      apiClient.delete<T>(endpoint, headers),
  },
};

// Funciones de conveniencia para endpoints específicos
export const api = {
  auth: {
    login: (data: LoginBusinessDto) => apiClient.post("/auth/login", data),
  },
  clients: {
    get: (id: string) => apiClient.get(`/clients/${id}`),
    getAll: () => apiClient.get("/clients"),
    register: (data: CreateClientDto) =>
      apiClient.post("/clients/register", data),
    login: (data: LoginClientDto) => apiClient.post("/clients/login", data),
    delete: (id: string) => apiClient.delete(`/clients?id=${id}`),
  },
  businesses: {
    get: (id: string) => apiClient.get(`/business/${id}`),
    getAll: () => apiClient.get("/business"),
    getDashboard: () => apiClient.get<IDashboard>("/business/dashboard"),
    register: (data: any) => apiClient.post("/business/register", data),
    login: (data: LoginBusinessDto) => apiClient.post("/business/login", data),
    update: (
      id: string,
      { data, logo }: { data: UpdateBusinessDto; logo: File }
    ) => apiClient.put(`/business/${id}`, data, logo as any),
    delete: (id: string) => apiClient.delete(`/business?id=${id}`),
  },
  stamps: {
    generateQuick: (saleValue: number) =>
      apiClient.post<IStamp>("/business/stamps/quick", { saleValue }),
    create: (data: CreateStampDto) =>
      apiClient.post<IStamp>("/business/stamps", data),
    getHistory: (params?: StampFilters) => {
      const queryParams = new URLSearchParams();
      if (!params) {
        console.log("params", params);
        return apiClient.get<PaginatedResponse<IStamp>>(
          `/business/stamps/get-history?page=1&limit=10`
        );
      }
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.stampType) queryParams.append("stampType", params.stampType);
      if (params?.purchaseType)
        queryParams.append("purchaseType", params.purchaseType);
      if (params?.dateFrom)
        queryParams.append("dateFrom", params.dateFrom.toISOString());
      if (params?.dateTo)
        queryParams.append("dateTo", params.dateTo.toISOString());

      const queryString = queryParams.toString();
      return apiClient.get<PaginatedResponse<IStamp>>(
        `/business/stamps${queryString ? `?${queryString}` : ""}`
      );
    },
    getStatistics: () =>
      apiClient.get<StampSummaryDto>("/business/stamps/statistics"),
    findByCode: (code: string) =>
      apiClient.get<IStamp>(`/business/stamps/${code}`),
    getBusinessClients: () =>
      apiClient.get<{ clients: IBusinessClient[]; total: number }>(
        "/business/stamps/clients"
      ),
    cancel: (id: string) => apiClient.delete<IStamp>(`/business/stamps/${id}`),
  },
  clientCards: {
    // Canjear código de sello
    redeem: (data: RedeemStampDto) =>
      apiClient.post<{
        clientCard: IClientCard;
        stamp: IStamp;
        redemption: IStampRedemption;
        stampsEarned: number;
      }>("/client-cards/redeem", data),

    // Obtener todas las tarjetas del cliente
    getAll: () => apiClient.get<IClientCard[]>("/client-cards"),

    // Obtener tarjeta específica por negocio
    getByBusiness: (businessId: string) =>
      apiClient.get<IClientCard>(`/client-cards/${businessId}`),

    // Obtener historial de canjes por negocio
    getHistory: (businessId: string) =>
      apiClient.get<IStampRedemption[]>(`/client-cards/${businessId}/history`),

    // Obtener estadísticas de tarjetas del cliente
    //getStatistics: () =>
    // apiClient.get<ClientCardSummaryDto>("/client-cards/statistics"),
  },
  quickStamps: {
    // Venta pequeña (1-2 sellos)
    small: () =>
      apiClient.post<IStamp>("/business/stamps/quick", { saleValue: 1000 }),

    // Venta mediana (2-3 sellos)
    medium: () =>
      apiClient.post<IStamp>("/business/stamps/quick", { saleValue: 2500 }),

    // Venta grande (3-5 sellos)
    large: () =>
      apiClient.post<IStamp>("/business/stamps/quick", { saleValue: 5000 }),

    // Venta especial (5+ sellos)
    special: () =>
      apiClient.post<IStamp>("/business/stamps/quick", { saleValue: 10000 }),
  },
  rewards: {
    // Crear recompensa
    create: (data: {
      name: string;
      description: string;
      requiredStamps: number;
      stampsCost: number;
      image?: string;
      expirationDate?: Date;
      stock?: number;
      specialConditions?: string;
    }) => apiClient.post<IReward>("/rewards", data),

    // Obtener recompensas del negocio
    getAll: () => apiClient.get<IReward[]>("/rewards"),

    // Obtener recompensas de un negocio específico (para clientes)
    getByBusiness: (businessId: number) =>
      apiClient.get<IReward[]>(`/rewards/business/${businessId}`),

    // Actualizar recompensa
    update: (
      rewardId: number,
      data: {
        name?: string;
        description?: string;
        requiredStamps?: number;
        stampsCost?: number;
        image?: string;
        expirationDate?: Date;
        stock?: number;
        specialConditions?: string;
        active?: boolean;
      }
    ) => apiClient.put<IReward>(`/rewards/${rewardId}`, data),

    // Eliminar recompensa
    delete: (rewardId: number) => apiClient.delete(`/rewards/${rewardId}`),

    // Canjear recompensa (MEJORADO - retorna ticket)
    redeem: (rewardId: number, businessId: number) =>
      apiClient.post<IRedemptionTicket>(`/rewards/${rewardId}/redeem`, {
        businessId,
      }),

    // Dashboard de reclamos para el negocio
    getRedemptionDashboard: () =>
      apiClient.get<IRedemptionDashboard>("/rewards/redemptions/dashboard"),

    // Marcar recompensa como entregada
    deliverRedemption: (
      redemptionId: number,
      deliveredBy: string,
      notes?: string
    ) =>
      apiClient.patch<IRewardRedemption>(
        `/rewards/redemptions/${redemptionId}/deliver`,
        {
          deliveredBy,
          notes,
        }
      ),

    // Buscar reclamo por código
    findByCode: (redemptionCode: string) =>
      apiClient.get<IRewardRedemption>(
        `/rewards/redemptions/code/${redemptionCode}`
      ),

    // Obtener historial de canjes con filtros
    getRedemptions: (filters: IRedemptionFilters = {}) => {
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.dateFrom)
        queryParams.append("dateFrom", filters.dateFrom.toISOString());
      if (filters.dateTo)
        queryParams.append("dateTo", filters.dateTo.toISOString());
      if (filters.clientId)
        queryParams.append("clientId", filters.clientId.toString());
      if (filters.rewardId)
        queryParams.append("rewardId", filters.rewardId.toString());

      const queryString = queryParams.toString();
      return apiClient.get<{
        redemptions: IRewardRedemption[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/rewards/redemptions${queryString ? `?${queryString}` : ""}`);
    },

    // Obtener historial de reclamos del cliente
    getMyHistory: (filters: IRedemptionFilters = {}) => {
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append("page", filters.page.toString());
      if (filters.limit) queryParams.append("limit", filters.limit.toString());
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.dateFrom)
        queryParams.append("dateFrom", filters.dateFrom.toISOString());
      if (filters.dateTo)
        queryParams.append("dateTo", filters.dateTo.toISOString());
      if (filters.rewardId)
        queryParams.append("rewardId", filters.rewardId.toString());

      const queryString = queryParams.toString();
      return apiClient.get<{
        redemptions: IRewardRedemption[];
        total: number;
        page: number;
        totalPages: number;
      }>(
        `/rewards/redemptions/my-history${queryString ? `?${queryString}` : ""}`
      );
    },

    // Obtener estadísticas de recompensas
    getStatistics: () =>
      apiClient.get<IRewardStatistics>("/rewards/statistics"),
    /*
        totalRewards: number;
        totalRedemptions: number;
        pendingRedemptions: number;
        mostRedeemedReward?: {
          name: string;
          redemptions: number;
        };
        */

    // Expirar códigos vencidos (tarea administrativa)
    expireOldRedemptions: () => apiClient.post("/rewards/expire-old"),
  },
};

export default apiClient;
