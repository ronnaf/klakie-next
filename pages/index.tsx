import { Button } from '@chakra-ui/button';
import { useColorMode } from '@chakra-ui/color-mode';
import {
  Box,
  Center,
  Container,
  Heading,
  Stack,
  VStack,
} from '@chakra-ui/layout';
import { Switch } from '@chakra-ui/switch';
import { Textarea } from '@chakra-ui/textarea';
import { useToast } from '@chakra-ui/toast';
import Cookies from 'js-cookie';
import type { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import Head from 'next/head';
import React from 'react';
import { k } from '../lib/constants';
import { setCookie } from '../lib/cookie-helper';

const Home: NextPage = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  const router = useRouter();
  const toast = useToast();

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      apiKey: { value: string };
    };

    if (!target.apiKey.value.trim()) {
      return toast({
        title: "It's blank, you dumbass.",
        status: 'error',
      });
    }

    setCookie(k.API_KEY_KEY, target.apiKey.value);
    router.push('/workspace');
  };

  return (
    <>
      <Head>
        <title>Klakie</title>
        <meta
          name='description'
          content='Easily track your time entries from Clockify.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Box h='100vh' pos='relative'>
        <VStack pos='absolute' top='4' right='4'>
          <Switch isChecked={colorMode === 'dark'} onChange={toggleColorMode} />
        </VStack>
        <Container
          pos='absolute'
          top='45%'
          left='50%'
          transform='translate(-50%, -50%)'>
          <Center>
            <Heading as='h1' size='lg'>
              klakie
            </Heading>
          </Center>
          <Box mt='4' boxShadow='xl' p='8'>
            <form onSubmit={onSubmit}>
              <Stack spacing='8'>
                <Stack spacing='4'>
                  <Center>
                    <Heading as='h2' size='sm'>
                      Enter your Clockify API key:
                    </Heading>
                  </Center>
                  <Textarea
                    name='apiKey'
                    placeholder='Paste your API key here'
                  />
                </Stack>
                <Stack spacing='4'>
                  <Center>
                    <Button type='submit' w='full' size='lg'>
                      Continue
                    </Button>
                  </Center>
                  <Center>
                    <Button
                      as='a'
                      type='button'
                      variant='link'
                      href='https://clockify.me/user/settings'
                      target='_blank'
                      rel='noreferrer noopener'>
                      I can&apos;t find my API key
                    </Button>
                  </Center>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Home;
