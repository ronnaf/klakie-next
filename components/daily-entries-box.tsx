import { Button } from "@chakra-ui/button";
import { useColorModeValue } from "@chakra-ui/color-mode";
import { Badge, Box, Divider, Flex, HStack, Spacer, Text } from "@chakra-ui/layout";
import { Tag } from "@chakra-ui/tag";
import { useToast } from "@chakra-ui/toast";
import { Tooltip } from "@chakra-ui/tooltip";
import dayjs from "dayjs";
import numeral from "numeral";
import React from "react";
import { copyToClipboard } from "../lib/helpers/clipboard-helper";
import { formatDecimalTime } from "../lib/helpers/duration-helper";
import { calculateEarnings } from "../lib/helpers/earnings-helper";
import { DailyEntry } from "../lib/models/daily-entry";

type Props = {
  dailyTimeEntry: DailyEntry;
  hourlyRate: number;
};

export const DailyEntriesBox = (props: Props) => {
  const toast = useToast();

  const boxBorder = useColorModeValue("gray.200", "whiteAlpha.300");
  const headerBg = useColorModeValue("gray.50", "whiteAlpha.50");

  const onCopyToClipboard = (duration: string) => {
    copyToClipboard(duration.toString());
    toast({
      title: "Copied to clipboard!",
      status: "success",
    });
  };

  return (
    <Box my="6" border="1px" borderColor={boxBorder} borderRadius="md">
      {/* begin::Daily Entry Header */}
      <Flex p="2" bg={headerBg}>
        <HStack>
          <Text>{dayjs(props.dailyTimeEntry.dateStarted).format("MMMM DD")}</Text>
          <Tag>{dayjs(props.dailyTimeEntry.dateStarted).format("dddd")}</Tag>
        </HStack>
        <Spacer />
        <HStack>
          <Text>{formatDecimalTime(props.dailyTimeEntry.totalDayHours, "hours")}</Text>
          <Divider orientation="vertical" />
          <Text>{props.dailyTimeEntry.totalDayHours.toFixed(2)}</Text>
          <Divider orientation="vertical" />
          <Badge>
            ₱
            {numeral(
              calculateEarnings(props.dailyTimeEntry.totalDayHours, props.hourlyRate).totalEarnings
            ).format("0,0.00")}
          </Badge>
        </HStack>
      </Flex>
      {/* end::Daily Entry Header */}
      <Divider />
      <Box>
        {props.dailyTimeEntry.groupedTimeEntries.map((groupedTimeEntry, index) => {
          const entryDuration = formatDecimalTime(groupedTimeEntry.totalDescHours, "hours");
          const entryDecimal = groupedTimeEntry.totalDescHours.toFixed(2);
          const isLast = index === props.dailyTimeEntry.groupedTimeEntries.length - 1;
          return (
            <div key={groupedTimeEntry.id}>
              <Box p="2" key={groupedTimeEntry.id}>
                <Flex>
                  <HStack>
                    <Tag>{groupedTimeEntry.timeEntries.length}</Tag>
                    <Text>{groupedTimeEntry.description}</Text>
                  </HStack>
                  <Spacer />
                  <HStack>
                    <Text>{entryDuration}</Text>
                    <Tooltip label="Click to copy" aria-label="A tooltip" placement="right">
                      <Button size="sm" onClick={() => onCopyToClipboard(entryDecimal)}>
                        {entryDecimal}
                      </Button>
                    </Tooltip>
                  </HStack>
                </Flex>
              </Box>
              {!isLast && <Divider />}
            </div>
          );
        })}
      </Box>
    </Box>
  );
};
