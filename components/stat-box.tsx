import { useColorModeValue } from "@chakra-ui/color-mode";
import { Box } from "@chakra-ui/layout";
import { Stat, StatLabel, StatNumber } from "@chakra-ui/stat";
import React from "react";

type Props = {
  name: string;
  value: string | number;
};

export const StatBox = (props: Props) => {
  const statBg = useColorModeValue("gray.100", "whiteAlpha.200");

  return (
    <Box w="100%" p="4" bg={statBg} borderRadius="md">
      <Stat>
        <StatLabel>{props.name}</StatLabel>
        <StatNumber>{props.value}</StatNumber>
      </Stat>
    </Box>
  );
};
