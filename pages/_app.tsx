import type { AppProps } from "next/app";
import { Suspense } from "react";
import Layout from "@components/Layout";
import "../style.css";
import Providers from "@utils/Providers";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Suspense>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      ></link>
      <Providers>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Providers>
    </Suspense>
  );
}
