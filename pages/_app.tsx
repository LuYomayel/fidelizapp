import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/tailwind.css";
import { AuthProvider } from "../contexts/AuthContext";
import { Toaster } from "react-hot-toast";

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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#10B981",
              color: "#fff",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#EF4444",
              color: "#fff",
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default MyApp;
