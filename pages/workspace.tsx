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
import { Box, Container, Flex, HStack, Spacer, Text } from '@chakra-ui/layout';
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
} from '@chakra-ui/menu';
import {
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { Select } from '@chakra-ui/select';
import { Switch } from '@chakra-ui/switch';
import { useToast } from '@chakra-ui/toast';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';
import _ from 'lodash';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import numeral from 'numeral';
import React, { useState } from 'react';
import { k } from '../lib/constants';
import { ClockifyUser } from '../lib/models/clockify-user';
import { ClockifyWorkspace } from '../lib/models/clockify-workspace';

interface Props {
  user: ClockifyUser;
  workspaces: ClockifyWorkspace[];
  initialHourlyRate: number;
}

const Workspace = (props: Props) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

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

    Cookies.set(k.HOURLY_RATE_KEY, target.rate.value.toString());
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
          {/* start::Header */}
          <Flex alignItems='center'>
            <Box>
              <Select defaultValue={props.user.defaultWorkspace}>
                {props.workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </Select>
            </Box>
            <Spacer />
            <Box>
              <HStack spacing='4'>
                <Text>Hi, {props.user.name.split(' ')[0]}!</Text>
                <Menu placement='bottom-end' closeOnSelect={false}>
                  <MenuButton
                    as={Avatar}
                    name={props.user.name}
                    src={props.user.profilePicture}
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
      user,
      workspaces,
      initialHourlyRate,
    },
  };
}

export default Workspace;
