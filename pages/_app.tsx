import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/tailwind.css";
import { AuthProvider } from "../contexts/AuthContext";

// TODO: Importar providers de contexto cuando estén listos
// import { ClienteProvider } from '@/contexts/ClienteContext';
// import { AdminProvider } from '@/contexts/AdminContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        <title>FirulApp - Programa de Fidelización Digital</title>
        <meta
          name="description"
          content="Sistema de fidelización digital para negocios físicos"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
