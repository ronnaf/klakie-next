import { Button, ButtonGroup } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { ArrowBackIcon, ArrowForwardIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Container, Flex, Grid, HStack, Spacer, Text } from "@chakra-ui/layout";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Icon,
  IconButton,
  ListItem,
  Spinner,
  Tooltip,
  UnorderedList,
} from "@chakra-ui/react";
import { Select } from "@chakra-ui/select";
import { useToast } from "@chakra-ui/toast";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import numeral from "numeral";
import React, { useEffect, useMemo, useState } from "react";
import { IoReceiptOutline } from "react-icons/io5";
import { DailyEntriesBox } from "../components/daily-entries-box";
import { DashboardHeader } from "../components/dashboard-header";
import { HourlyRateModal } from "../components/hourly-rate-modal";
import { InvoicePdfModal } from "../components/invoice-pdf-modal";
import { StatBox } from "../components/stat-box";
import { k } from "../lib/constants";
import { setCookie } from "../lib/helpers/cookie-helper";
import { formatCurrency } from "../lib/helpers/currency-helper";
import { convertSecondsToHours, formatDecimalTime } from "../lib/helpers/duration-helper";
import { calculateEarnings } from "../lib/helpers/earnings-helper";
import { getDailyTimeEntries } from "../lib/helpers/entries-helper";
import { ClockifyDetailedReport } from "../lib/models/clockify-detailed-report";
import { ClockifyUser } from "../lib/models/clockify-user";
import { ClockifyWorkspace } from "../lib/models/clockify-workspace";
import { InvoiceConfig } from "../lib/models/invoice-config";
import { Period } from "../lib/models/period";
import { ResponseData } from "../lib/models/response-data";
import { clockifyApiService } from "../lib/services/clockify-api-service";

interface Props {
  user: ResponseData<ClockifyUser>;
  workspaces: ResponseData<ClockifyWorkspace[]>;
  invoiceConfig: InvoiceConfig | null;
}

const Index = (props: Props) => {
  const {
    isOpen: isHourRateModalOpen,
    onOpen: onHourlyRateModalOpen,
    onClose: onHourlyRateModalClose,
  } = useDisclosure();
  const {
    isOpen: isInvoiceModalOpen,
    onOpen: onInvoiceModalOpen,
    onClose: onInvoiceModalClose,
  } = useDisclosure();

  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ClockifyDetailedReport | null>(null);
  const [period, setPeriod] = useState<Period>("weekly");
  const [hourlyRate, setHourlyRate] = useState(props.invoiceConfig?.hourlyRate || 0);
  const [range, setRange] = useState({
    // dayjs start of week is Sunday, but clockify start of week is Monday
    start: dayjs().utc().startOf("week").add(1, "day"),
    // dayjs end of week is Saturday, but clockify end of week is Sunday
    end: dayjs().utc().endOf("week").add(1, "day"),
  });
  const [workspaceId, setWorkspace] = useState<string | null>(
    props.user.status === "success" ? props.user.data.defaultWorkspace : null
  );

  // Listens to changes in [range] and updates the report data accordingly
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

  // Listens to changes in [period] and updates the range accordingly
  useEffect(() => {
    if (period === "semi-monthly") {
      setRange((prevRange) => {
        const start = prevRange.start;
        const fifteenth = dayjs.utc([start.year(), start.month(), 15]);
        return start.date() < 15
          ? { start: start.startOf("month"), end: fifteenth.endOf("date") }
          : { start: fifteenth.add(1, "day").startOf("date"), end: start.endOf("month") };
      });
    } else {
      setRange((prevRange) => ({
        start: prevRange.start.startOf("week").add(1, "day"),
        end: prevRange.start.endOf("week").add(1, "day"),
      }));
    }
  }, [period]);

  const onSaveHourlyRate = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      rate: { value: string };
    };

    if (!target.rate.value) {
      return toast({
        title: "It's blank, you dumbass.",
        status: "error",
      });
    }

    const newInvoiceConfig = {
      ...props.invoiceConfig,
      hourlyRate: parseFloat(target.rate.value),
    };

    setCookie(k.INVOICE_CONFIG_JSON_KEY, JSON.stringify(newInvoiceConfig));
    setHourlyRate(newInvoiceConfig.hourlyRate);

    onHourlyRateModalClose();
  };

  const onNextRange = () => {
    if (period === "weekly") {
      setRange((prevRange) => ({
        start: prevRange.start.add(1, "week").startOf("date"),
        end: prevRange.end.add(1, "week").endOf("date"),
      }));
    } else {
      setRange((prevRange) => {
        const newStart = prevRange.end.add(1, "day");
        const fifteenth = dayjs.utc([newStart.year(), newStart.month(), 15]);
        const newEnd = newStart.date() > 15 ? newStart.endOf("month") : fifteenth;
        return {
          start: newStart.startOf("date"),
          end: newEnd.endOf("date"),
        };
      });
    }
  };

  const onPrevRange = () => {
    if (period === "weekly") {
      setRange((prevRange) => ({
        start: prevRange.start.subtract(1, "week").startOf("date"),
        end: prevRange.end.subtract(1, "week").endOf("date"),
      }));
    } else {
      setRange((prevRange) => {
        const newEnd = prevRange.start.subtract(1, "day");
        const sixteenth = dayjs.utc([newEnd.year(), newEnd.month(), 16]);
        const newStart = newEnd.date() > 15 ? sixteenth : newEnd.startOf("month");
        return {
          start: newStart.startOf("date"),
          end: newEnd.endOf("date"),
        };
      });
    }
  };

  const totals = useMemo(() => {
    const taxPercentDecimal = (props.invoiceConfig?.taxPercent || 0) / 100;
    const totalTimeInSeconds = report?.totals?.[0]?.totalTime || 0;
    const totalTimeInHours = convertSecondsToHours(totalTimeInSeconds);
    const earnings = calculateEarnings(totalTimeInHours, hourlyRate, taxPercentDecimal);
    return {
      totalTimeInSeconds,
      totalTimeInHours,
      ...earnings,
    };
  }, [hourlyRate, props.invoiceConfig?.taxPercent, report?.totals]);

  const reportStats = useMemo(
    () => [
      { name: "Total Time", value: formatDecimalTime(totals.totalTimeInSeconds, "seconds") },
      { name: "Total Earnings", value: formatCurrency(totals.totalEarnings) },
      { name: "Tax Withheld", value: formatCurrency(totals.taxWithheld) },
    ],
    [totals.taxWithheld, totals.totalEarnings, totals.totalTimeInSeconds]
  );

  const dailyTimeEntries = useMemo(
    () => getDailyTimeEntries(report?.timeentries || []),
    [report?.timeentries]
  );

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
              <DashboardHeader
                loading={loading}
                user={props.user.data}
                workspaces={props.workspaces.data}
                onWorkspaceChange={setWorkspace}
              />
              {/* end::Header */}
              {/* begin::Customizers */}
              <Flex alignItems="center" mt="8">
                <Box>
                  <HStack>
                    <Text as="kbd" fontWeight="bold" fontSize="lg">
                      ₱{numeral(hourlyRate).format("0,0.00")} /hr
                    </Text>
                    <IconButton
                      disabled={loading}
                      aria-label="Edit hourly rate"
                      variant="ghost"
                      icon={<EditIcon />}
                      onClick={onHourlyRateModalOpen}
                    />
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
                    <Box>
                      <Tooltip label="View invoice">
                        <IconButton
                          aria-label="View invoice"
                          icon={<Icon as={IoReceiptOutline} />}
                          variant="outline"
                          onClick={onInvoiceModalOpen}
                          isDisabled={loading}
                        />
                      </Tooltip>
                    </Box>
                    <Select
                      disabled={loading}
                      value={period}
                      onChange={(e) => setPeriod(e.target.value as Period)}>
                      <option value="semi-monthly">Semi-monthly</option>
                      <option value="weekly">Weekly</option>
                    </Select>
                    <ButtonGroup isAttached>
                      <IconButton
                        disabled={loading}
                        aria-label="Previous date range"
                        icon={<ArrowBackIcon />}
                        onClick={onPrevRange}
                      />
                      <Button>
                        {range.start.format("MMM DD")} - {range.end.format("MMM DD")}
                      </Button>
                      <IconButton
                        disabled={loading}
                        aria-label="Next date range"
                        icon={<ArrowForwardIcon />}
                        onClick={onNextRange}
                      />
                    </ButtonGroup>
                  </HStack>
                </Box>
              </Flex>
              {/* end::Customizers */}
              {/* begin::Report Stats */}
              <Grid templateColumns="repeat(3, 1fr)" gap={3} my="6">
                {reportStats.map((stat) => (
                  <StatBox key={stat.name} name={stat.name} value={stat.value} />
                ))}
              </Grid>
              {/* end::Report Stats */}
              {/* begin::Time Entries */}
              <Box>
                {dailyTimeEntries.map((dailyTimeEntry) => (
                  <DailyEntriesBox
                    key={dailyTimeEntry.dateStarted}
                    dailyTimeEntry={dailyTimeEntry}
                    hourlyRate={hourlyRate}
                  />
                ))}
              </Box>
              {/* end::Time Entries */}
            </>
          ) : (
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center">
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Failed to load page
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                <UnorderedList>
                  {props.user.status === "failure" && (
                    <ListItem>We could not get your Clockify profile</ListItem>
                  )}
                  {props.workspaces.status === "failure" && (
                    <ListItem>We could not get your Clockify workspaces</ListItem>
                  )}
                </UnorderedList>
              </AlertDescription>
              <Button mt="6" onClick={() => router.replace("/login")}>
                Go back to login
              </Button>
            </Alert>
          )}
        </Container>
      </Box>
      {/* end::Main Content */}
      {/* begin::Hourly Rate Modal */}
      <HourlyRateModal
        isOpen={isHourRateModalOpen}
        onSave={onSaveHourlyRate}
        onClose={onHourlyRateModalClose}
      />
      {/* end::Hourly Rate Modal */}
      {/* begin::Invoice Modal */}
      {props.user.status === "success" && (
        <InvoicePdfModal
          onClose={onInvoiceModalClose}
          isOpen={isInvoiceModalOpen}
          userData={{
            dailyEntries: dailyTimeEntries,
            profile: props.user.data,
            totals,
          }}
        />
      )}
      {/* end::Invoice Modal */}
    </>
  );
};

// This gets called on every request
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const apiKey = context.req.cookies[k.API_KEY_KEY];

  if (!apiKey) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const user = await clockifyApiService.getCurrentUser(null, { apiKey });
  const workspaces = await clockifyApiService.getCurrentWorkspaces(null, { apiKey });
  const invoiceConfigJson = context.req.cookies[k.INVOICE_CONFIG_JSON_KEY];

  let invoiceConfig: InvoiceConfig | null = null;
  if (invoiceConfigJson) {
    invoiceConfig = JSON.parse(invoiceConfigJson);
  }

  // Pass data to the page via props
  return {
    props: {
      user,
      workspaces,
      invoiceConfig,
    },
  };
}

export default Index;
