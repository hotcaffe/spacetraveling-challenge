import { AppProps } from 'next/app';
import Head from 'next/head';
import Header from '../components/Header';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <Header/>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
