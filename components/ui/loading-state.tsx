import React from "react";
import { Card, CardContent } from "./card";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Cargando...",
  className = "",
}: LoadingStateProps) {
  return (
    <Card className={`text-center py-8 sm:py-12 ${className}`}>
      <CardContent>
        <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-3 sm:mb-4 animate-spin" />
        <p className="text-sm sm:text-base text-gray-600">{message}</p>
      </CardContent>
    </Card>
  );
}

export default LoadingState;
