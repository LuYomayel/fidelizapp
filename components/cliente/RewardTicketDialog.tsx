import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { CheckCircle, Copy, Clock } from "lucide-react";
import { IRedemptionTicket } from "@shared";

interface RewardTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: IRedemptionTicket | null;
}

export default function RewardTicketDialog({
  isOpen,
  onClose,
  ticket,
}: RewardTicketDialogProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Expirado";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const handleClose = () => {
    setCopySuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            ¡Recompensa Canjeada!
          </DialogTitle>
        </DialogHeader>

        {ticket && (
          <div className="space-y-6">
            {/* Información del ticket */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-green-800">
                  {ticket.rewardName}
                </h3>
                <p className="text-green-700">{ticket.rewardDescription}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Cliente:</span>
                  <span className="font-medium">{ticket.clientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Negocio:</span>
                  <span className="font-medium">{ticket.businessName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sellos gastados:</span>
                  <span className="font-medium">{ticket.stampsSpent}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Fecha de canje:</span>
                  <span className="font-medium">
                    {new Date(ticket.redeemedAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
              </div>
            </div>

            {/* Código de reclamo */}
            <div className="text-center space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Código de Reclamo</h4>
                <div className="bg-white border-2 border-dashed border-gray-300 p-4 rounded-lg">
                  <div className="text-2xl font-mono font-bold tracking-wider text-gray-800 mb-2">
                    {ticket.redemptionCode}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(ticket.redemptionCode)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {copySuccess ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar código
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Temporizador de expiración */}
              {ticket.expiresAt && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-yellow-800">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Expira en: {formatTimeRemaining(ticket.expiresAt)}
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Instrucciones:</strong> Muestra este código al
                  personal del negocio para recibir tu recompensa.
                </p>
              </div>
            </div>

            {/* Botón para cerrar */}
            <div className="text-center">
              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
