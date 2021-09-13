import { Avatar } from '@chakra-ui/avatar';
import { useColorMode } from '@chakra-ui/color-mode';
import { ExternalLinkIcon, SettingsIcon } from '@chakra-ui/icons';
import { Box, Code, Container, Flex, Spacer, Text } from '@chakra-ui/layout';
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
import Head from 'next/head';
import React from 'react';

const Workspace = () => {
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
                <Select placeholder='Select option'>
                  <option value='option1'>Option 1</option>
                  <option value='option2'>Option 2</option>
                  <option value='option3'>Option 3</option>
                </Select>
                <Text as='kbd'>P567.44/hr</Text>
              </HStack>
            </Box>
            <Spacer />
            <Box>
              <Menu placement='bottom-end' closeOnSelect={false}>
                <MenuButton
                  as={Avatar}
                  name='Dan Abramov'
                  src='https://bit.ly/dan-abramov'
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

export default Workspace;
