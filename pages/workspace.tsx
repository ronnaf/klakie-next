import { Avatar } from '@chakra-ui/avatar';
import { useColorMode } from '@chakra-ui/color-mode';
import { ExternalLinkIcon, SettingsIcon } from '@chakra-ui/icons';
import { Box, Container, Flex, Spacer, Text } from '@chakra-ui/layout';
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
} from '@chakra-ui/menu';
import { HStack } from '@chakra-ui/react';
import { Select } from '@chakra-ui/select';
import { Switch } from '@chakra-ui/switch';
import _ from 'lodash';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import React from 'react';
import { k } from '../lib/constants';
import { ClockifyUser } from '../lib/models/clockify-user';
import { ClockifyWorkspace } from '../lib/models/clockify-workspace';

interface Props {
  user: ClockifyUser;
  workspaces: ClockifyWorkspace[];
}

const Workspace = (props: Props) => {
  const { colorMode, toggleColorMode } = useColorMode();
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
          <Flex alignItems='center'>
            <Box>
              <HStack spacing='4'>
                <Select defaultValue={props.user.defaultWorkspace}>
                  {props.workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </Select>
                <Text as='kbd'>P567.44/hr</Text>
              </HStack>
            </Box>
            <Spacer />
            <Box>
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
            </Box>
          </Flex>
        </Container>
      </Box>
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

  // Pass data to the page via props
  return {
    props: {
      user,
      workspaces,
    },
  };
}

export default Workspace;
