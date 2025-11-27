import Head from 'next/head';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Import Web3 components with SSR disabled to prevent localStorage and window errors
const Web3Content = dynamic(
  () => import('@/components/Web3Content'),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div> }
);

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>Moonbob Money - Staking DApp</title>
        <meta name="description" content="Stake MOONBOB tokens and earn rewards" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {mounted ? <Web3Content /> : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      )}
    </>
  );
}
