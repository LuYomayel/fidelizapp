# Stampia - Programa de Sellos Digital

Una aplicación web de sellos digital tipo "tarjeta digital" para negocios físicos como cafeterías, barberías, almacenes o gimnasios.

## Características Principales

- **Sin descargas**: Los clientes acceden vía link o código QR
- **Dos módulos principales**:
  - Cliente Final: Gestión de puntos y canje de premios
  - Administrador: Dashboard para gestión del negocio
- **Experiencia gamificada**: Sistema de puntos y recompensas
- **Diseño responsivo**: Funciona en móvil, tablet y escritorio

## Tecnologías

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (iconos)

## Instalación

```bash
npm install
npm run dev
```

## Estructura del Proyecto

```
├── components/          # Componentes reutilizables
│   ├── cliente/        # Componentes específicos del cliente
│   ├── admin/          # Componentes específicos del admin
│   └── shared/         # Componentes compartidos
├── pages/              # Páginas Next.js
│   ├── cliente/        # Páginas del módulo cliente
│   ├── admin/          # Páginas del módulo admin
│   └── api/            # API routes (TODO)
├── styles/             # Estilos globales
├── types/              # Definiciones TypeScript
├── utils/              # Utilidades y helpers
└── data/               # Datos mock
```

## Módulos

### Cliente Final

- Registro y acceso simplificado
- Visualización de puntos acumulados
- Catálogo de premios
- Sistema de canje

### Administrador

- Gestión de clientes
- Asignación de puntos
- Gestión de premios
- Reportes básicos

## Licencia

Privado - Todos los derechos reservados

# stampia
