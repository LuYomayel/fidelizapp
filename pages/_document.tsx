import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        {/* Preload de fuentes para mejor rendimiento */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Meta tags adicionales */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="FirulApp Team" />

        {/* PWA meta tags */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="application-name" content="Stampia" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Stampia" />
        <meta
          name="description"
          content="Gestiona tu programa de sellos de clientes de forma fácil y eficiente"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* iOS specific */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="167x167"
          href="/icons/icon-152x152.png"
        />

        {/* Startup images para iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-2048-2732.jpg"
          sizes="2048x2732"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1668-2224.jpg"
          sizes="1668x2224"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1536-2048.jpg"
          sizes="1536x2048"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1125-2436.jpg"
          sizes="1125x2436"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-1242-2208.jpg"
          sizes="1242x2208"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-750-1334.jpg"
          sizes="750x1334"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/apple-splash-640-1136.jpg"
          sizes="640x1136"
        />

        {/* Standard favicon */}
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-16x16.png"
        />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="default" />

        {/* Microsoft */}
        <meta name="msapplication-navbutton-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta
          name="msapplication-TileImage"
          content="/icons/icon-144x144.png"
        />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* UC Mobile */}
        <meta name="full-screen" content="yes" />
        <meta name="browsermode" content="application" />

        {/* Disable automatic telephone number detection */}
        <meta name="format-detection" content="telephone=no" />

        {/* Preload critical resources */}
        <link rel="preload" href="/icons/icon-192x192.png" as="image" />
        <link rel="preload" href="/icons/icon-512x512.png" as="image" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
