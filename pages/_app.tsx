import { ChakraProvider } from '@chakra-ui/react';
import dayjs from 'dayjs';
import arraySupport from 'dayjs/plugin/arraySupport';
import duration from 'dayjs/plugin/duration';
import utc from 'dayjs/plugin/utc';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

dayjs.extend(utc);
dayjs.extend(duration);
dayjs.extend(arraySupport);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
export default MyApp;
