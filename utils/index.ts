// ======= UTILIDADES GENERALES =======

export const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatearFechaCorta = (fecha: Date): string => {
  return fecha.toLocaleDateString("es-ES", {
    month: "short",
    day: "numeric",
  });
};

export const formatearHora = (fecha: Date): string => {
  return fecha.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ======= UTILIDADES PARA PUNTOS Y PREMIOS =======

export const calcularPorcentajeProgreso = (
  puntosActuales: number,
  puntosObjetivo: number
): number => {
  if (puntosObjetivo === 0) return 0;
  return Math.min((puntosActuales / puntosObjetivo) * 100, 100);
};

export const puedeCanjarPremio = (
  puntosCliente: number,
  puntosRequeridos: number
): boolean => {
  return puntosCliente >= puntosRequeridos;
};

export const calcularPuntosFaltantes = (
  puntosCliente: number,
  puntosRequeridos: number
): number => {
  return Math.max(puntosRequeridos - puntosCliente, 0);
};

// ======= UTILIDADES PARA VALIDACIÓN =======

export const validarDNI = (dni: string): boolean => {
  // Validación básica: solo números y longitud 7-8 dígitos
  const dniRegex = /^\d{7,8}$/;
  return dniRegex.test(dni);
};

export const validarEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validarTelefono = (telefono: string): boolean => {
  // Acepta formatos: +54911234567, 011234567, 1234567
  const telefonoRegex = /^(\+\d{1,3})?\d{7,12}$/;
  return telefonoRegex.test(telefono.replace(/\s|-/g, ""));
};

// ======= UTILIDADES PARA TEXTO =======

export const truncarTexto = (texto: string, maxLength: number): string => {
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength).trim() + "...";
};

export const capitalizarPrimeraLetra = (texto: string): string => {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

export const formatearNombreCompleto = (
  nombre: string,
  apellido: string
): string => {
  return `${capitalizarPrimeraLetra(nombre)} ${capitalizarPrimeraLetra(
    apellido
  )}`;
};

// ======= UTILIDADES PARA QR =======

export const generarCodigoQR = (
  clienteId: string,
  negocioId: string
): string => {
  // En producción esto sería más sofisticado y único
  return `QR_${negocioId}_${clienteId}_${Date.now()}`;
};

export const generarURLCliente = (
  codigoQR: string,
  negocioId: string
): string => {
  // URL que recibirá el cliente para acceder a su tarjeta
  const baseURL =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";
  return `${baseURL}/cliente/tarjeta?qr=${codigoQR}&negocio=${negocioId}`;
};

// ======= UTILIDADES PARA ESTADÍSTICAS =======

export const calcularPorcentajeCambio = (
  valorActual: number,
  valorAnterior: number
): number => {
  if (valorAnterior === 0) return valorActual > 0 ? 100 : 0;
  return ((valorActual - valorAnterior) / valorAnterior) * 100;
};

export const formatearPorcentaje = (valor: number): string => {
  return `${valor >= 0 ? "+" : ""}${valor.toFixed(1)}%`;
};

export const formatearNumero = (numero: number): string => {
  return numero.toLocaleString("es-ES");
};

// ======= UTILIDADES PARA COLORES =======

export const hexALuminosidad = (hex: string): number => {
  // Convertir hex a RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Calcular luminosidad relativa
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

export const obtenerColorTexto = (
  colorFondo: string
): "text-white" | "text-black" => {
  const luminosidad = hexALuminosidad(colorFondo);
  return luminosidad > 0.5 ? "text-black" : "text-white";
};

// ======= UTILIDADES PARA ALMACENAMIENTO LOCAL =======

export const guardarEnLocalStorage = (clave: string, valor: any): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch (error) {
      console.error("Error guardando en localStorage:", error);
    }
  }
};

export const obtenerDeLocalStorage = <T>(
  clave: string,
  valorPorDefecto: T
): T => {
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(clave);
      return item ? JSON.parse(item) : valorPorDefecto;
    } catch (error) {
      console.error("Error leyendo de localStorage:", error);
      return valorPorDefecto;
    }
  }
  return valorPorDefecto;
};

export const removerDeLocalStorage = (clave: string): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(clave);
    } catch (error) {
      console.error("Error removiendo de localStorage:", error);
    }
  }
};

// ======= CONSTANTES ÚTILES =======

export const CLAVES_LOCALSTORAGE = {
  CLIENTE_ACTUAL: "Stampia_cliente_actual",
  ADMIN_ACTUAL: "Stampia_admin_actual",
  TEMA_PREFERIDO: "Stampia_tema",
  CONFIGURACION_UI: "Stampia_config_ui",
} as const;

export const MENSAJES = {
  ERROR_GENERICO: "Ha ocurrido un error. Por favor, intenta nuevamente.",
  ERROR_RED: "Error de conexión. Verifica tu conexión a internet.",
  CARGANDO: "Cargando...",
  SIN_DATOS: "No hay información disponible.",
  OPERACION_EXITOSA: "Operación realizada con éxito.",
  PUNTOS_INSUFICIENTES: "No tienes suficientes puntos para este premio.",
  PREMIO_NO_DISPONIBLE: "Este premio no está disponible actualmente.",
} as const;

export const CATEGORIAS_DISPLAY = {
  cafeteria: "Cafetería",
  barberia: "Barbería",
  gimnasio: "Gimnasio",
  restaurante: "Restaurante",
  tienda: "Tienda",
  salon_belleza: "Salón de Belleza",
  otros: "Otros",
} as const;
