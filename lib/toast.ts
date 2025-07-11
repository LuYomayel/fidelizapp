import toast from "react-hot-toast";

// Funciones de toast centralizadas para usar en toda la aplicación
export const showToast = {
  // Toast de éxito
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: "#10B981",
        color: "#fff",
        fontWeight: "500",
      },
    });
  },

  // Toast de error
  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      style: {
        background: "#EF4444",
        color: "#fff",
        fontWeight: "500",
      },
    });
  },

  // Toast de información
  info: (message: string) => {
    toast(message, {
      duration: 4000,
      style: {
        background: "#3B82F6",
        color: "#fff",
        fontWeight: "500",
      },
    });
  },

  // Toast de advertencia
  warning: (message: string) => {
    toast(message, {
      duration: 4000,
      style: {
        background: "#F59E0B",
        color: "#fff",
        fontWeight: "500",
      },
    });
  },

  // Toast de carga
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "#6B7280",
        color: "#fff",
        fontWeight: "500",
      },
    });
  },

  // Dismiss toast
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },
};

// Exportar también las funciones directas para compatibilidad
export { toast };
