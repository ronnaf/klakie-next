import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/modal";
import { Document, Font, Page, PDFViewer, StyleSheet, Text, View } from "@react-pdf/renderer";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { k } from "../lib/constants";
import { InvoiceConfig } from "../lib/models/invoice-config";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const InvoicePdfModal = ({ isOpen, onClose }: Props) => {
  const [invoiceConfig, setInvoiceConfig] = useState<InvoiceConfig | null>(null);

  useEffect(() => {
    const invoiceConfigJson = Cookies.get(k.INVOICE_CONFIG_JSON_KEY);
    if (!invoiceConfigJson) {
      return;
    }

    setInvoiceConfig(JSON.parse(invoiceConfigJson));
  }, []);

  const watermark = invoiceConfig?.name.split(" ").join("").toLowerCase();

  return (
    <Modal size="4xl" scrollBehavior="inside" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent height="100%">
        <PDFViewer width="100%" height="100%">
          <Document title="Invoice">
            <Page size="A4" style={[styles.page, fontSizes.body]}>
              <View style={styles.header}>
                <View>
                  <Text style={[styles.username, fontSizes.heading]}>{invoiceConfig?.name}</Text>
                </View>
                <View style={styles.titleBox}>
                  <Text style={[styles.invoiceText, fontSizes.display]}>INVOICE</Text>
                </View>
              </View>
              <Text style={styles.watermarkText}>{watermark}</Text>
              <View style={[styles.inlineSpaceEvenly, fontSizes.label]}>
                <View style={styles.inlineBox}>
                  <Text style={{ marginBottom: 4 }}>From</Text>
                  <View style={styles.addressBox}>
                    <Text style={[styles.username, fontSizes.body, styles.doubleSpace]}>
                      {invoiceConfig?.name}
                    </Text>
                    <Text style={styles.doubleSpace}>{invoiceConfig?.address}</Text>
                    <View style={[styles.inlineSpaceEvenly, styles.doubleSpace]}>
                      <Text style={{ width: "80%" }}>ronnwiseley@gmail.com</Text>
                      <Text style={{ width: "20%" }}>
                        {invoiceConfig?.employmentType.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.inlineSpaceEvenly}>
                      <Text style={{ width: "80%" }}>TIN: {invoiceConfig?.tin}</Text>
                      <Text style={{ width: "20%" }}>{invoiceConfig?.tax}%</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.inlineBox}>
                  <Text style={{ marginBottom: 4 }}>To</Text>
                  <View style={styles.addressBox}>
                    <Text style={[fontSizes.body, styles.doubleSpace, { fontWeight: "bold" }]}>
                      {invoiceConfig?.employer}
                    </Text>
                    <Text>{invoiceConfig?.employerAddress}</Text>
                    <Text>{invoiceConfig?.employerEmail}</Text>
                    <Text>TIN: {invoiceConfig?.employerTin}</Text>
                  </View>
                </View>
                <View style={{ width: "65%", alignItems: "flex-end" }}>
                  <Text style={{ color: "#fff" }}>Period</Text>
                  <View style={styles.flex}>
                    <Text>period:</Text>
                    <Text style={styles.period}>aug2021a</Text>
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.watermarkPeriod}>aug2021a</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.watermarkText}>{watermark}</Text>
              {/* begin::Table */}
              <View></View>
              {/* end::Table */}
            </Page>
          </Document>
        </PDFViewer>
      </ModalContent>
    </Modal>
  );
};

Font.register({
  family: "HelveticaNeue",
  fonts: [
    { fontWeight: "400", src: "/fonts/HelveticaNeue.ttf" },
    { fontWeight: "400", fontStyle: "italic", src: "/fonts/HelveticaNeue-Italic.ttf" },
    { fontWeight: "700", src: "/fonts/HelveticaNeue-Bold.ttf" },
    { fontWeight: "700", fontStyle: "italic", src: "/fonts/HelveticaNeue-BoldItalic.ttf" },
  ],
});

const fontSizes = StyleSheet.create({
  heading: { fontSize: 12.29 },
  display: { fontSize: 10.53 },
  body: { fontSize: 8.78 },
  label: { fontSize: 7.02 },
});

const colors = {
  PRIMARY: "#1155CD",
  BACKGROUND: "#CFE3F3",
  WATERMARK: "#F3F3F3",
};

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "HelveticaNeue",
    paddingVertical: "1.18in",
    paddingLeft: "1.32in",
    paddingRight: "0.31in",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 4,
    borderBottom: "3px solid " + colors.BACKGROUND,
  },
  titleBox: {
    backgroundColor: colors.BACKGROUND,
    paddingVertical: 10,
    paddingHorizontal: 54,
  },
  username: {
    fontWeight: "bold",
    color: colors.PRIMARY,
    textDecoration: "underline",
  },
  invoiceText: {
    fontWeight: "bold",
  },
  watermarkText: {
    color: colors.WATERMARK,
    fontStyle: "italic",
  },
  inlineSpaceBetween: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inlineSpaceEvenly: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  inlineBox: {
    width: "100%",
    paddingRight: "5%",
  },
  addressBox: {
    backgroundColor: colors.BACKGROUND,
    padding: 4,
  },
  doubleSpace: {
    marginBottom: 4,
  },
  flex: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  period: {
    fontWeight: "bold",
    backgroundColor: colors.BACKGROUND,
    padding: "4px 32px 4px 4px",
    marginLeft: 4,
  },
  watermarkPeriod: {
    color: colors.WATERMARK,
    padding: "2px 32px 2px 4px",
  },
});
