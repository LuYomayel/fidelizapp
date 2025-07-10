# Código QR del Negocio - FidelizApp

## Descripción

El código QR del negocio es una funcionalidad que permite a los negocios generar un código QR único que los clientes pueden escanear para registrarse automáticamente en el programa de fidelización.

## Características

### ✅ Funcionalidades Implementadas

- **Generación de QR único**: Cada negocio tiene su propio código QR personalizado
- **Descarga de imagen**: El QR se puede descargar en formato PNG
- **Impresión directa**: Función para imprimir el QR con instrucciones
- **Copia de URL**: Copiar la URL del negocio al portapapeles
- **Regeneración**: Posibilidad de regenerar el QR cuando sea necesario
- **Información del negocio**: Muestra datos relevantes del negocio
- **Instrucciones completas**: Guías para el negocio y los clientes

### 🎯 Beneficios

1. **Fácil Registro**: Los clientes se registran con un simple escaneo
2. **Más Clientes**: Atrae nuevos clientes con tecnología moderna
3. **Fidelización Automática**: Sistema automático de sellos y recompensas
4. **Sin Descargas**: Los clientes no necesitan instalar nada
5. **Acceso Universal**: Funciona en cualquier smartphone con cámara

## Cómo Usar

### Para el Negocio

1. **Acceder a la funcionalidad**:

   - Ir a "Perfil del Negocio" → Sección "Código QR"
   - O usar el menú "Código QR del Negocio"
   - O desde el Dashboard → "Acciones Rápidas"

2. **Generar el QR**:

   - Hacer clic en "Generar Código QR"
   - Esperar a que se genere (puede tomar unos segundos)

3. **Descargar e Imprimir**:

   - Usar "Descargar QR" para guardar la imagen
   - Usar "Imprimir QR" para imprimir directamente
   - Imprimir en tamaño A4 o más grande

4. **Colocar en el Negocio**:
   - Colocar en un lugar visible del mostrador
   - Asegurar buena iluminación
   - Proteger de daños con un marco si es necesario

### Para los Clientes

1. **Escanear el QR**:

   - Abrir la cámara del celular
   - Apuntar al código QR
   - Tocar la notificación que aparece

2. **Registro Automático**:
   - Se abre la aplicación web
   - El cliente se registra automáticamente
   - Comienza a acumular sellos

## Estructura Técnica

### Endpoints de API

```typescript
// Generar QR del negocio
POST / business / profile / generate - qr;
Response: IBusinessQRData;

interface IBusinessQRData {
  businessId: number;
  businessName: string;
  qrCode: string; // Base64 del QR generado
  qrUrl: string; // URL para escanear y acceder al negocio
}
```

### Componentes Frontend

- **Página Principal**: `/pages/admin/qr-negocio.tsx`
- **Sección en Perfil**: `/pages/admin/perfil.tsx` (sección QR)
- **Navegación**: Enlace en menú de administrador

### Funcionalidades del QR

- **URL Personalizada**: Cada negocio tiene su URL única
- **Registro Automático**: Los clientes se registran automáticamente
- **Redirección Inteligente**: Lleva al cliente a la página correcta
- **Datos del Negocio**: Incluye información del negocio en el QR

## Instrucciones de Implementación

### 1. Configuración del Backend

El backend debe implementar el endpoint `/business/profile/generate-qr` que:

1. Obtiene la información del negocio autenticado
2. Genera una URL única para el negocio
3. Crea un código QR con esa URL
4. Retorna los datos en formato `IBusinessQRData`

### 2. Generación de URL

La URL generada debe seguir el patrón:

```
https://fidelizapp.com/cliente/registro?businessId={businessId}&qr=true
```

### 3. Procesamiento del QR

Cuando un cliente escanea el QR:

1. Se redirige a la URL del negocio
2. Se detecta automáticamente el negocio
3. Se inicia el proceso de registro
4. Se crea la tarjeta de cliente para ese negocio

## Consejos de Uso

### Para Mejor Resultado

1. **Impresión**:

   - Usar tamaño A4 o más grande
   - Imprimir en alta calidad
   - Usar papel blanco sin textura

2. **Ubicación**:

   - Lugar visible del mostrador
   - Buena iluminación
   - Altura accesible para clientes

3. **Protección**:

   - Usar marco o protector
   - Evitar humedad y daños
   - Reemplazar si se deteriora

4. **Promoción**:
   - Entrenar al personal
   - Explicar el proceso a clientes
   - Usar carteles informativos

### Métricas a Seguir

- **Escaneos por día**: Cuántos clientes escanean el QR
- **Conversiones**: Cuántos se registran después de escanear
- **Nuevos clientes**: Clientes que se registran vía QR
- **Retención**: Clientes que vuelven después del registro

## Solución de Problemas

### QR No Se Escanea

1. **Verificar calidad de impresión**
2. **Asegurar buena iluminación**
3. **Limpiar la superficie del QR**
4. **Verificar que no esté dañado**

### Clientes No Se Registran

1. **Verificar que la URL sea correcta**
2. **Comprobar que el endpoint funcione**
3. **Revisar logs del backend**
4. **Probar con diferentes dispositivos**

### Error al Generar QR

1. **Verificar conexión a internet**
2. **Comprobar autenticación del usuario**
3. **Revisar logs del frontend**
4. **Intentar regenerar el QR**

## Próximas Mejoras

### Funcionalidades Planificadas

- [ ] **Estadísticas de escaneo**: Ver cuántas veces se escanea el QR
- [ ] **QR personalizado**: Agregar logo del negocio al QR
- [ ] **Múltiples QR**: Diferentes QR para diferentes ubicaciones
- [ ] **QR temporal**: QR que expira después de cierto tiempo
- [ ] **Notificaciones**: Alertas cuando alguien escanea el QR

### Optimizaciones Técnicas

- [ ] **Caché de QR**: Evitar regenerar el mismo QR
- [ ] **Compresión de imagen**: Optimizar tamaño del QR
- [ ] **CDN**: Servir imágenes desde CDN
- [ ] **Analytics**: Tracking detallado de uso

## Conclusión

El código QR del negocio es una herramienta poderosa para la fidelización de clientes. Permite un registro fácil y automático, mejorando la experiencia del cliente y facilitando la captación de nuevos usuarios para el programa de fidelización.

La implementación actual cubre todas las necesidades básicas y proporciona una base sólida para futuras mejoras y funcionalidades avanzadas.
