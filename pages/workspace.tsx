import { Avatar } from '@chakra-ui/avatar';
import { Button, ButtonGroup } from '@chakra-ui/button';
import { useColorMode } from '@chakra-ui/color-mode';
import { useDisclosure } from '@chakra-ui/hooks';
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  EditIcon,
  ExternalLinkIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Center,
  Container,
  Flex,
  HStack,
  Spacer,
  Text,
} from '@chakra-ui/layout';
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
} from '@chakra-ui/menu';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  IconButton,
  Input,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  UnorderedList,
} from '@chakra-ui/react';
import { Select } from '@chakra-ui/select';
import { Switch } from '@chakra-ui/switch';
import { useToast } from '@chakra-ui/toast';
import dayjs from 'dayjs';
import _ from 'lodash';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import numeral from 'numeral';
import React, { useState } from 'react';
import { k } from '../lib/constants';
import { setCookie } from '../lib/cookie-helper';
import { ClockifyUser } from '../lib/models/clockify-user';
import { ClockifyWorkspace } from '../lib/models/clockify-workspace';
import { FailureData, SuccessData } from '../lib/models/data';

interface Props {
  user: SuccessData<ClockifyUser> | FailureData;
  workspaces: SuccessData<ClockifyWorkspace[]> | FailureData;
  initialHourlyRate: number;
}

const Workspace = (props: Props) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const router = useRouter();
  const toast = useToast();

  const [hourlyRate, setHourlyRate] = useState(props.initialHourlyRate);
  const [range, setRange] = useState({
    start: dayjs().startOf('week'),
    end: dayjs().endOf('week'),
  });

  const onSaveHourlyRate = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      rate: { value: number };
    };

    if (!target.rate.value) {
      return toast({
        title: "It's blank, you dumbass.",
        status: 'error',
      });
    }

    setCookie(k.HOURLY_RATE_KEY, target.rate.value.toString());
    setHourlyRate(target.rate.value);

    onClose();
  };

  return (
    <>
      <Head>
        <title>Klakie - Workspace</title>
        <meta
          name='description'
          content='Easily track your time entries from Clockify.'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Box py='8'>
        <Container maxW='container.md'>
          {props.user.status === 'success' &&
          props.workspaces.status === 'success' ? (
            <>
              {/* start::Header */}
              <Flex alignItems='center'>
                <Box>
                  <Select defaultValue={props.user.data.defaultWorkspace}>
                    {props.workspaces.data.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Spacer />
                <Box>
                  <HStack spacing='4'>
                    <Text>Hi, {props.user.data.name.split(' ')[0]}!</Text>
                    <Menu placement='bottom-end' closeOnSelect={false}>
                      <MenuButton
                        as={Avatar}
                        name={props.user.data.name}
                        src={props.user.data.profilePicture}
                      />
                      <MenuList>
                        <MenuGroup title='Color mode'>
                          <MenuItem>
                            <Switch
                              mr='3'
                              isChecked={colorMode === 'dark'}
                              onChange={toggleColorMode}
                            />
                            <span>{_.startCase(colorMode)} mode</span>
                          </MenuItem>
                        </MenuGroup>
                        <MenuDivider />
                        <MenuItem icon={<SettingsIcon />}>Settings</MenuItem>
                        <MenuItem icon={<ExternalLinkIcon />}>Log out</MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </Box>
              </Flex>
              {/* end::Header */}

              {/* start::Customizers */}
              <Flex alignItems='center' mt='8'>
                <Box>
                  <HStack>
                    <Text as='kbd' fontWeight='bold' fontSize='lg'>
                      ₱{numeral(hourlyRate).format('0,0.00')} /hr
                    </Text>
                    <IconButton
                      aria-label='Edit hourly rate'
                      variant='ghost'
                      icon={<EditIcon />}
                      onClick={onOpen}
                    />
                  </HStack>
                </Box>
                <Spacer />
                <Box>
                  <HStack>
                    <Select>
                      <option value='semi-monthly'>Semi-monthly</option>
                      <option value='weekly'>Weekly</option>
                    </Select>
                    <ButtonGroup isAttached>
                      <IconButton
                        aria-label='Previous date range'
                        icon={<ArrowBackIcon />}
                      />
                      <Button>This week</Button>
                      <IconButton
                        aria-label='Next date range'
                        icon={<ArrowForwardIcon />}
                      />
                    </ButtonGroup>
                  </HStack>
                </Box>
              </Flex>
              {/* end::Customizers */}
            </>
          ) : (
            <Alert
              status='error'
              variant='subtle'
              flexDirection='column'
              alignItems='center'
              justifyContent='center'>
              <AlertIcon boxSize='40px' mr={0} />
              <AlertTitle mt={4} mb={1} fontSize='lg'>
                Failed to load page
              </AlertTitle>
              <AlertDescription maxWidth='sm'>
                <UnorderedList>
                  {props.user.status === 'failure' && (
                    <ListItem>We could not get your Clockify profile</ListItem>
                  )}
                  {props.workspaces.status === 'failure' && (
                    <ListItem>
                      We could not get your Clockify workspaces
                    </ListItem>
                  )}
                </UnorderedList>
              </AlertDescription>
              <Button mt='6' onClick={() => router.replace('/')}>
                Go back to login
              </Button>
            </Alert>
          )}
        </Container>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <form onSubmit={onSaveHourlyRate}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit hourly rate</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Input
                name='rate'
                type='number'
                step='any'
                placeholder='Enter your hourly rate'
              />
            </ModalBody>
            <ModalFooter>
              <Button mr={3} type='submit'>
                Save
              </Button>
              <Button onClick={onClose} type='button'>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
};

// This gets called on every request
export async function getServerSideProps(
  context: GetServerSidePropsContext
): Promise<{ props: Props }> {
  const baseUrl = 'https://api.clockify.me/api';
  const init: RequestInit = {
    headers: {
      'X-Api-Key': context.req.cookies[k.API_KEY_KEY],
    },
  };

  const userResponse = await fetch(`${baseUrl}/v1/user`, init);
  const user = await userResponse.json();

  const workspacesResponse = await fetch(`${baseUrl}/v1/workspaces`, init);
  const workspaces = await workspacesResponse.json();

  const initialHourlyRate = parseFloat(
    context.req.cookies[k.HOURLY_RATE_KEY] || '0'
  );

  // Pass data to the page via props
  return {
    props: {
      user: {
        status: user.code ? 'failure' : 'success',
        data: user,
      },
      workspaces: {
        status: workspaces.code ? 'failure' : 'success',
        data: workspaces,
      },
      initialHourlyRate,
    },
  };
}

export default Workspace;
