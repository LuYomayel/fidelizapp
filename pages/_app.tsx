import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/tailwind.css";

// TODO: Importar providers de contexto cuando estén listos
// import { ClienteProvider } from '@/contexts/ClienteContext';
// import { AdminProvider } from '@/contexts/AdminContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>FirulApp - Programa de Fidelización Digital</title>
        <meta
          name="description"
          content="Sistema de fidelización digital para negocios físicos"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* Meta tags para móviles */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FirulApp" />
      </Head>

      {/* TODO: Envolver con providers de contexto */}
      {/* <ClienteProvider> */}
      {/*   <AdminProvider> */}
      <Component {...pageProps} />
      {/*   </AdminProvider> */}
      {/* </ClienteProvider> */}
    </>
  );
}
