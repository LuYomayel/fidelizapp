import { Client, Admin, Business, Reward } from "../../shared";

export interface ClientContextType {
  client: Client | null;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Client>) => Promise<boolean>;
}

export interface AdminContextType {
  admin: Admin | null;
  business: Business | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// ======= PROPS PARA COMPONENTES =======

export interface TarjetaDigitalProps {
  client: Client;
  business: Business;
  mostrarQR?: boolean;
}

export interface RewardsListProps {
  rewards: Reward[];
  clientPoints: number;
  onExchange: (rewardId: string) => void;
  isLoading?: boolean;
}

export interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: any; // React node - se tipará correctamente cuando se instale React
  tendencia?: {
    valor: number;
    positiva: boolean;
  };
}
