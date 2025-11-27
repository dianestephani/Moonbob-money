import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
