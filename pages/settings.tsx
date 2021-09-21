import { Button, IconButton } from "@chakra-ui/button";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Box, Container, Flex, Heading, HStack, Text } from "@chakra-ui/layout";
import {
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from "@chakra-ui/react";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { k } from "../lib/constants";
import { setCookie } from "../lib/helpers/cookie-helper";
import { InvoiceConfig } from "../lib/models/invoice-config";

type Props = {
  invoiceConfig: InvoiceConfig;
};

const Settings = (props: Props) => {
  const toast = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      name: { value: string };
      address: { value: string };
      tin: { value: string };
      employmentType: { value: string };
      tax: { value: string };
      bankName: { value: string };
      bankAccount: { value: string };
      employer: { value: string };
      employerAddress: { value: string };
      employerEmail: { value: string };
      employerTin: { value: string };
    };

    const name = target.name.value;
    const address = target.address.value;
    const tin = target.tin.value;
    const employmentType = target.employmentType.value;
    const tax = parseInt(target.tax.value);
    const bankName = target.bankName.value;
    const bankAccount = target.bankAccount.value;
    const employer = target.employer.value;
    const employerAddress = target.employerAddress.value;
    const employerEmail = target.employerEmail.value;
    const employerTin = target.employerTin.value;

    const invoiceConfig: InvoiceConfig = {
      ...props.invoiceConfig,
      name,
      address,
      tin,
      employmentType,
      taxPercent: tax,
      bankName,
      bankAccount,
      employer,
      employerAddress,
      employerEmail,
      employerTin,
    };

    setCookie(k.INVOICE_CONFIG_JSON_KEY, JSON.stringify(invoiceConfig));
    toast({ title: "Invoice config saved", status: "success" });
  };

  const onBackButtonClick = () => {
    setLoading(true);
    router.push("/");
  };

  return (
    <>
      {/* begin::Head */}
      <Head>
        <title>Klakie - Settings</title>
        <meta name="description" content="Easily track your time entries from Clockify." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* end::Head */}
      {/* begin::Main Content */}
      <Box py="8">
        <Container maxW="container.md">
          {/* begin::Header */}
          <HStack>
            <IconButton
              aria-label="Go back to home"
              icon={<ArrowBackIcon boxSize="6" />}
              variant="ghost"
              onClick={onBackButtonClick}
              isLoading={loading}
              isDisabled={loading}
            />
            <Heading as="h3" size="lg">
              Settings
            </Heading>
          </HStack>
          {/* end::Header */}
          {/* begin::Invoice settings */}
          <Box mt="8">
            <Box>
              <Box mb="4">
                <Heading as="h4" size="md" mb="2">
                  Invoicing
                </Heading>
                <Text>The following properties will reflect in your invoice</Text>
              </Box>
              <form onSubmit={onSubmit}>
                <Tabs variant="enclosed">
                  <TabList>
                    <Tab>Basic information</Tab>
                    <Tab>Employer information</Tab>
                  </TabList>
                  <TabPanels border="1px" borderTop="0" borderColor="whiteAlpha.300">
                    <TabPanel>
                      <FormControl id="name" mb="4">
                        <FormLabel>Name</FormLabel>
                        <Input type="name" defaultValue={props.invoiceConfig.name} />
                      </FormControl>
                      <FormControl id="address" mb="4">
                        <FormLabel>Address</FormLabel>
                        <Input type="address" defaultValue={props.invoiceConfig.address} />
                      </FormControl>
                      <FormControl id="tin" mb="4">
                        <FormLabel>TIN</FormLabel>
                        <Input type="tin" defaultValue={props.invoiceConfig.tin} />
                      </FormControl>
                      <FormControl id="employmentType" mb="4">
                        <FormLabel>Employment type</FormLabel>
                        <Select defaultValue={props.invoiceConfig.employmentType}>
                          <option value="ftf">FTF</option>
                          <option value="fte">FTE</option>
                        </Select>
                      </FormControl>
                      <FormControl id="tax" mb="4">
                        <FormLabel>Tax percentage</FormLabel>
                        <NumberInput
                          name="tax"
                          max={100}
                          min={0}
                          defaultValue={props.invoiceConfig.taxPercent}>
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>
                      <FormControl id="bankName" mb="4">
                        <FormLabel>Bank name</FormLabel>
                        <Input type="bankName" defaultValue={props.invoiceConfig.bankName} />
                      </FormControl>
                      <FormControl id="bankAccount" mb="4">
                        <FormLabel>Bank account number</FormLabel>
                        <Input type="bankAccount" defaultValue={props.invoiceConfig.bankAccount} />
                      </FormControl>
                    </TabPanel>
                    <TabPanel>
                      <FormControl id="employer" mb="4">
                        <FormLabel>Employer</FormLabel>
                        <Input type="employer" defaultValue={props.invoiceConfig.employer} />
                      </FormControl>
                      <FormControl id="employerAddress" mb="4">
                        <FormLabel>Employer address</FormLabel>
                        <Input
                          type="employerAddress"
                          defaultValue={props.invoiceConfig.employerAddress}
                        />
                      </FormControl>
                      <FormControl id="employerEmail" mb="4">
                        <FormLabel>Employer email</FormLabel>
                        <Input
                          type="employerEmail"
                          defaultValue={props.invoiceConfig.employerEmail}
                        />
                      </FormControl>
                      <FormControl id="employerTin" mb="4">
                        <FormLabel>Employer TIN</FormLabel>
                        <Input type="employerTin" defaultValue={props.invoiceConfig.employerTin} />
                      </FormControl>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
                <Flex justifyContent="flex-end" mt="4">
                  <Button type="submit">Update settings</Button>
                </Flex>
              </form>
            </Box>
          </Box>
          {/* end::Invoice settings */}
        </Container>
      </Box>
    </>
  );
};

// This gets called on every request
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const apiKey = context.req.cookies[k.API_KEY_KEY];
  const invoiceConfigJson = context.req.cookies[k.INVOICE_CONFIG_JSON_KEY];

  if (!apiKey) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  let invoiceConfig = {};
  if (invoiceConfigJson) {
    invoiceConfig = JSON.parse(invoiceConfigJson);
  }

  return {
    props: {
      invoiceConfig,
    },
  };
}

export default Settings;
