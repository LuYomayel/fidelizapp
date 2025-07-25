import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { api } from "@/lib/api-client";
import { IReward, IRedemptionTicket, IClientCardWithReward } from "@shared";

interface RewardRedemptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  reward: IReward | null;
  clientCard: IClientCardWithReward | null;
  onRedemptionSuccess?: (ticket: IRedemptionTicket) => void;
}

export default function RewardRedemptionDialog({
  isOpen,
  onClose,
  reward,
  clientCard,
  onRedemptionSuccess,
}: RewardRedemptionDialogProps) {
  const [isRedeeming, setIsRedeeming] = useState(false);

  const handleRedeemReward = async () => {
    if (!reward || !clientCard || isRedeeming) {
      return;
    }

    setIsRedeeming(true);
    try {
      const response = await api.rewards.redeem(reward.id, reward.businessId);

      if (response.success && response.data) {
        onClose();

        // Llamar al callback con el ticket para que el componente padre abra el RewardTicketDialog
        if (onRedemptionSuccess) {
          onRedemptionSuccess(response.data);
        }
      } else {
      }
    } catch (err) {
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar canje de recompensa</AlertDialogTitle>
          <AlertDialogDescription>
            {reward && clientCard && (
              <div className="space-y-4">
                <div>
                  ¿Estás seguro que quieres canjear{" "}
                  <strong>{reward.name}</strong>?
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>Sellos requeridos:</span>
                    <span className="font-semibold">
                      {reward.stampsCost} sellos
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Tienes:</span>
                    <span className="font-semibold">
                      {clientCard.availableStamps} sellos
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold border-t pt-2 mt-2">
                    <span>Quedarás con:</span>
                    <span>
                      {clientCard.availableStamps - reward.stampsCost} sellos
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Al confirmar, recibirás un código único que debes mostrar al
                  negocio para recibir tu recompensa.
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleRedeemReward}>
            {isRedeeming ? "Canjeando..." : "Confirmar canje"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
