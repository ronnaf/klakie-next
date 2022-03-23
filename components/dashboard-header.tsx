import { Avatar } from "@chakra-ui/avatar";
import { useColorMode } from "@chakra-ui/color-mode";
import { ExternalLinkIcon, SettingsIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Select,
  Spacer,
  Switch,
  Text
} from "@chakra-ui/react";
import Cookies from "js-cookie";
import _ from "lodash";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { k } from "../lib/constants";
import { ClockifyUser } from "../lib/models/clockify-user";
import { ClockifyWorkspace } from "../lib/models/clockify-workspace";

type Props = {
  loading: boolean;
  workspaces: ClockifyWorkspace[];
  user: ClockifyUser;
  onWorkspaceChange: React.Dispatch<React.SetStateAction<string | null>>;
};

export const DashboardHeader = (props: Props) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const router = useRouter();

  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const onSettingsButtonClick = () => {
    setLoadingSettings(true);
    router.push("/settings");
  };

  const onLogoutButtonClick = () => {
    Cookies.remove(k.API_KEY_KEY);
    Cookies.remove(k.HOURLY_RATE_KEY);
    Cookies.remove(k.INVOICE_CONFIG_JSON_KEY);
    router.replace("/login");
  };

  return (
    <Flex alignItems="center">
      <Box>
        <Select
          disabled={props.loading}
          defaultValue={props.user.defaultWorkspace || ""}
          onChange={(e) => props.onWorkspaceChange(e.target.value)}>
          {props.workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </Select>
      </Box>
      <Spacer />
      <Box>
        <HStack spacing="4">
          <Text>Hi, {props.user.name.split(" ")[0]}!</Text>
          <Menu placement="bottom-end" closeOnSelect={false}>
            <MenuButton
              as={Avatar}
              cursor="pointer"
              name={props.user.name}
              src={props.user.profilePicture}
            />
            <MenuList>
              <MenuGroup title="Color mode">
                <MenuItem>
                  <Switch mr="3" isChecked={colorMode === "dark"}
                          onChange={toggleColorMode} />
                  <span>{_.startCase(colorMode)} mode</span>
                </MenuItem>
              </MenuGroup>
              <MenuDivider />
              <MenuItem
                icon={<SettingsIcon />}
                onClick={onSettingsButtonClick}
                isDisabled={loadingSettings}>
                Settings
              </MenuItem>
              <MenuItem
                icon={<ExternalLinkIcon />}
                onClick={onLogoutButtonClick}
                isDisabled={loadingLogout}>
                Log out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Box>
    </Flex>
  );
};
