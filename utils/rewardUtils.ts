import { IReward } from "@shared";

/**
 * Verifica si una recompensa está activa considerando:
 * 1. El campo active debe ser true
 * 2. Si tiene expirationDate, debe ser mayor a la fecha actual
 * 3. Si tiene stock definido, debe ser mayor a 0
 */
export const isRewardActive = (reward: IReward): boolean => {
  // 1. Verificar que la recompensa esté activa
  if (!reward.active) {
    return false;
  }

  // 2. Verificar fecha de expiración (solo si existe)
  if (reward.expirationDate) {
    const expirationDate = new Date(reward.expirationDate);
    const currentDate = new Date();
    if (expirationDate <= currentDate) {
      return false;
    }
  }

  // 3. Verificar stock (solo si está definido)
  if (reward.stock !== undefined && reward.stock !== null) {
    if (reward.stock <= 0) {
      return false;
    }
  }

  // Si pasa todas las verificaciones, está activa
  return true;
};

/**
 * Verifica si una recompensa está expirada
 */
export const isRewardExpired = (reward: IReward): boolean => {
  if (!reward.expirationDate) {
    return false; // Si no tiene fecha de expiración, no está expirada
  }
  return new Date(reward.expirationDate) < new Date();
};

/**
 * Verifica si una recompensa está sin stock
 */
export const isRewardOutOfStock = (reward: IReward): boolean => {
  if (reward.stock === undefined || reward.stock === null) {
    return false; // Si no tiene stock definido, no está sin stock
  }
  return reward.stock <= 0;
};

/**
 * Filtra un array de recompensas para obtener solo las activas
 */
export const filterActiveRewards = (rewards: IReward[]): IReward[] => {
  return rewards.filter(isRewardActive);
};
