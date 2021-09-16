import { Avatar } from "@chakra-ui/avatar";
import { Button, ButtonGroup } from "@chakra-ui/button";
import { useColorMode } from "@chakra-ui/color-mode";
import { useDisclosure } from "@chakra-ui/hooks";
import { ArrowBackIcon, ArrowForwardIcon, EditIcon, ExternalLinkIcon, SettingsIcon } from "@chakra-ui/icons";
import { Badge, Box, Container, Divider, Flex, Grid, HStack, Spacer, Text } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuDivider, MenuGroup, MenuItem, MenuList } from "@chakra-ui/menu";
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
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Tag,
  Tooltip,
  UnorderedList,
} from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { Switch } from "@chakra-ui/switch";
import { useToast } from "@chakra-ui/toast";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import _ from "lodash";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import numeral from "numeral";
import React, { useEffect, useMemo, useState } from "react";
import { k } from "../lib/constants";
import { copyToClipboard } from "../lib/helpers/clipboard-helper";
import { setCookie } from "../lib/helpers/cookie-helper";
import { convertSecondsToHours, formatDecimalTimeToDuration } from "../lib/helpers/duration-helper";
import { calculateEarnings } from "../lib/helpers/earnings-helper";
import { getDailyTimeEntries } from "../lib/helpers/entries-helper";
import { ClockifyDetailedReport } from "../lib/models/clockify-detailed-report";
import { ClockifyUser } from "../lib/models/clockify-user";
import { ClockifyWorkspace } from "../lib/models/clockify-workspace";
import { ResponseData } from "../lib/models/response-data";
import { clockifyApiService } from "../lib/services/clockify-api-service";

type Period = "weekly" | "semi-monthly";

interface Props {
  user: ResponseData<ClockifyUser>;
  workspaces: ResponseData<ClockifyWorkspace[]>;
  initialHourlyRate: number;
}

const Workspace = (props: Props) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ClockifyDetailedReport | null>(null);
  const [period, setPeriod] = useState<Period>("weekly");
  const [hourlyRate, setHourlyRate] = useState(props.initialHourlyRate);
  const [range, setRange] = useState({
    // dayjs start of week is Sunday, but clockify start of week is Monday
    start: dayjs().utc().startOf("week").add(1, "day"),
    // dayjs end of week is Saturday, but clockify end of week is Sunday
    end: dayjs().utc().endOf("week").add(1, "day"),
  });
  const [workspaceId, setWorkspace] = useState<string | null>(
    props.user.status === "success" ? props.user.data.defaultWorkspace : null
  );

  useEffect(() => {
    (async () => {
      if (!workspaceId) {
        return;
      }

      setLoading(true);
      const report = await clockifyApiService.getDetailedReport(
        {
          range: { start: range.start.toDate(), end: range.end.toDate() },
          workspaceId: workspaceId,
        },
        {
          apiKey: Cookies.get(k.API_KEY_KEY) || "",
        }
      );
      setLoading(false);

      if (report.status === "success") {
        setReport(report.data);
      }
    })();
  }, [range.end, range.start, workspaceId]);

  const onSaveHourlyRate = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      rate: { value: number };
    };

    if (!target.rate.value) {
      return toast({
        title: "It's blank, you dumbass.",
        status: "error",
      });
    }

    setCookie(k.HOURLY_RATE_KEY, target.rate.value.toString());
    setHourlyRate(target.rate.value);

    onClose();
  };

  const onNextRange = () => {
    setRange((prevRange) => ({
      start: prevRange.start.add(1, "week"),
      end: prevRange.end.add(1, "week"),
    }));
  };

  const onPrevRange = () => {
    setRange((prevRange) => ({
      start: prevRange.start.subtract(1, "week"),
      end: prevRange.end.subtract(1, "week"),
    }));
  };

  const onCopyToClipboard = (duration: string) => {
    copyToClipboard(duration.toString());
    toast({
      title: "Copied to clipboard!",
      status: "success",
    });
  };

  const reportStats = useMemo(() => {
    const totalTimeInHours = convertSecondsToHours(report?.totals[0]?.totalTime || 0);
    const calculatedEarnings = calculateEarnings(totalTimeInHours, hourlyRate);
    return [
      {
        name: "Total Time",
        value: formatDecimalTimeToDuration(report?.totals[0]?.totalTime || 0, "seconds"),
      },
      {
        name: "Total Earnings",
        value: `₱${numeral(calculatedEarnings.totalEarnings).format("0,0.00")}`,
      },
      {
        name: "Tax Withheld",
        value: `₱${numeral(calculatedEarnings.taxWithheld).format("0,0.00")}`,
      },
    ];
  }, [hourlyRate, report?.totals]);

  const dailyTimeEntries = useMemo(() => {
    return getDailyTimeEntries(report?.timeentries || []);
  }, [report?.timeentries]);

  return (
    <>
      {/* begin::Head */}
      <Head>
        <title>Klakie - Workspace</title>
        <meta name="description" content="Easily track your time entries from Clockify." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* end::Head */}
      {/* begin::Main Content */}
      <Box py="8">
        <Container maxW="container.md">
          {props.user.status === "success" && props.workspaces.status === "success" ? (
            <>
              {/* begin::Header */}
              <Flex alignItems="center">
                <Box>
                  <Select defaultValue={workspaceId || ""}>
                    {props.workspaces.data.map((workspace) => (
                      <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Spacer />
                <Box>
                  <HStack spacing="4">
                    <Text>Hi, {props.user.data.name.split(" ")[0]}!</Text>
                    <Menu placement="bottom-end" closeOnSelect={false}>
                      <MenuButton as={Avatar} name={props.user.data.name} src={props.user.data.profilePicture} />
                      <MenuList>
                        <MenuGroup title="Color mode">
                          <MenuItem>
                            <Switch mr="3" isChecked={colorMode === "dark"} onChange={toggleColorMode} />
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
              {/* begin::Customizers */}
              <Flex alignItems="center" mt="8">
                <Box>
                  <HStack>
                    <Text as="kbd" fontWeight="bold" fontSize="lg">
                      ₱{numeral(hourlyRate).format("0,0.00")} /hr
                    </Text>
                    <IconButton aria-label="Edit hourly rate" variant="ghost" icon={<EditIcon />} onClick={onOpen} />
                  </HStack>
                </Box>
                <Spacer />
                <Box>
                  <HStack>
                    {loading && (
                      <Box>
                        <Spinner />
                      </Box>
                    )}
                    <Select value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
                      <option value="semi-monthly">Semi-monthly</option>
                      <option value="weekly">Weekly</option>
                    </Select>
                    <ButtonGroup isAttached>
                      <IconButton aria-label="Previous date range" icon={<ArrowBackIcon />} onClick={onPrevRange} />
                      <Button>
                        {range.start.format("MMM DD")} - {range.end.format("MMM DD")}
                      </Button>
                      <IconButton aria-label="Next date range" icon={<ArrowForwardIcon />} onClick={onNextRange} />
                    </ButtonGroup>
                  </HStack>
                </Box>
              </Flex>
              {/* end::Customizers */}
              {/* begin::Report Stats */}
              <Grid templateColumns="repeat(3, 1fr)" gap={3} my="6">
                {reportStats.map((stat) => (
                  <Box key={stat.name} w="100%" p="4" bg="whiteAlpha.200" borderRadius="md">
                    <Stat>
                      <StatLabel>{stat.name}</StatLabel>
                      <StatNumber>{stat.value}</StatNumber>
                    </Stat>
                  </Box>
                ))}
              </Grid>
              {/* end::Report Stats */}
              {/* begin::Time Entries */}
              <Box>
                {dailyTimeEntries.map((dailyTimeEntry) => (
                  <Box
                    key={dailyTimeEntry.dateStarted}
                    my="6"
                    border="1px"
                    borderColor="whiteAlpha.300"
                    borderRadius="md"
                  >
                    {/* begin::Daily Entry Header */}
                    <Flex p="2" bg="whiteAlpha.50">
                      <HStack>
                        <Text>{dayjs(dailyTimeEntry.dateStarted).format("MMMM DD")}</Text>
                        <Tag>{dayjs(dailyTimeEntry.dateStarted).format("dddd")}</Tag>
                      </HStack>
                      <Spacer />
                      <HStack>
                        <Text>{formatDecimalTimeToDuration(dailyTimeEntry.totalDayHours, "hours")}</Text>
                        <Divider orientation="vertical" />
                        <Text>{dailyTimeEntry.totalDayHours.toFixed(2)}</Text>
                        <Divider orientation="vertical" />
                        <Badge>
                          ₱
                          {numeral(calculateEarnings(dailyTimeEntry.totalDayHours, hourlyRate).totalEarnings).format(
                            "0,0.00"
                          )}
                        </Badge>
                      </HStack>
                    </Flex>
                    {/* end::Daily Entry Header */}
                    <Divider />
                    <Box>
                      {dailyTimeEntry.groupedTimeEntries.map((groupedTimeEntry, index) => {
                        const entryDuration = formatDecimalTimeToDuration(groupedTimeEntry.totalDescHours, "hours");
                        const entryDecimal = groupedTimeEntry.totalDescHours.toFixed(2);
                        const isLast = index === dailyTimeEntry.groupedTimeEntries.length - 1;
                        return (
                          <>
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
                          </>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
              {/* end::Time Entries */}
            </>
          ) : (
            <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center">
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Failed to load page
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                <UnorderedList>
                  {props.user.status === "failure" && <ListItem>We could not get your Clockify profile</ListItem>}
                  {props.workspaces.status === "failure" && (
                    <ListItem>We could not get your Clockify workspaces</ListItem>
                  )}
                </UnorderedList>
              </AlertDescription>
              <Button mt="6" onClick={() => router.replace("/")}>
                Go back to login
              </Button>
            </Alert>
          )}
        </Container>
      </Box>
      {/* end::Main Content */}
      {/* begin::Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <form onSubmit={onSaveHourlyRate}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit hourly rate</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Input name="rate" type="number" step="any" placeholder="Enter your hourly rate" />
            </ModalBody>
            <ModalFooter>
              <Button mr={3} type="submit">
                Save
              </Button>
              <Button onClick={onClose} type="button">
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
      {/* end::Modal */}
    </>
  );
};

// This gets called on every request
export async function getServerSideProps(context: GetServerSidePropsContext): Promise<{ props: Props }> {
  const apiKey = context.req.cookies[k.API_KEY_KEY];

  const user = await clockifyApiService.getCurrentUser(null, { apiKey });
  const workspaces = await clockifyApiService.getCurrentWorkspaces(null, { apiKey });
  const initialHourlyRate = parseFloat(context.req.cookies[k.HOURLY_RATE_KEY] || "0");

  // Pass data to the page via props
  return {
    props: {
      user: user,
      workspaces: workspaces,
      initialHourlyRate,
    },
  };
}

export default Workspace;
