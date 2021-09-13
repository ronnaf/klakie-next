import { Button } from '@chakra-ui/button';
import { Box, Center, Container, Heading, Stack } from '@chakra-ui/layout';
import { chakra } from '@chakra-ui/system';
import { Textarea } from '@chakra-ui/textarea';
import { useToast } from '@chakra-ui/toast';
import type { NextPage } from 'next';
import { useRouter } from 'next/dist/client/router';
import Head from 'next/head';
import React from 'react';
import { k } from '../utils/constants';

const Home: NextPage = () => {
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

    // See: https://nextjs.org/docs/migrating/from-create-react-app#safely-accessing-web-apis
    if (typeof window !== 'undefined') {
      localStorage.setItem(k.API_KEY_KEY, target.apiKey.value);
      router.push('/workspace');
    }
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
      <chakra.main bgColor='gray.50' h='100vh' pos='relative'>
        <Container
          pos='absolute'
          top='50%'
          left='50%'
          transform='translate(-50%, -50%)'>
          <Center>
            <Heading as='h1' size='lg'>
              klakie
            </Heading>
          </Center>
          <Box mt='4' boxShadow='sm' bg='white' p='8'>
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
      </chakra.main>
    </>
  );
};

export default Home;
