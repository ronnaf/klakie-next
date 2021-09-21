import { Modal, ModalContent, ModalOverlay } from "@chakra-ui/modal";
import { Font, PDFViewer } from "@react-pdf/renderer";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { k } from "../lib/constants";
import { ClockifyUser } from "../lib/models/clockify-user";
import { DailyEntry } from "../lib/models/daily-entry";
import { InvoiceConfig } from "../lib/models/invoice-config";
import { EhrlichInvoiceTemplate } from "./invoice-templates/ehrlich-template";

type Props = {
  isOpen: boolean;
  userData: {
    profile: ClockifyUser;
    dailyEntries: DailyEntry[];
    totals: {
      earnings: number;
      taxWithheld: number;
      totalEarnings: number;
      totalTimeInSeconds: number;
      totalTimeInHours: number;
    };
  };
  onClose: () => void;
};

export const InvoicePdfModal = (props: Props) => {
  const [invoiceConfig, setInvoiceConfig] = useState<InvoiceConfig | null>(null);

  // Fetch invoice config from cookies on mount
  useEffect(() => {
    const invoiceConfigJson = Cookies.get(k.INVOICE_CONFIG_JSON_KEY);
    if (!invoiceConfigJson) {
      return;
    }
    setInvoiceConfig(JSON.parse(invoiceConfigJson));
  }, []);

  if (!invoiceConfig) {
    return null;
  }
  return (
    <Modal size="4xl" scrollBehavior="inside" isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent height="100%">
        <PDFViewer width="100%" height="100%">
          <EhrlichInvoiceTemplate
            from={{
              address: invoiceConfig.address,
              bank: invoiceConfig.bankName,
              bankAccount: invoiceConfig.bankAccount,
              email: props.userData.profile.email,
              employmentType: invoiceConfig.employmentType,
              hourlyRate: invoiceConfig.hourlyRate,
              name: invoiceConfig.name,
              taxPercent: invoiceConfig.taxPercent,
              tin: invoiceConfig.tin,
            }}
            to={{
              address: invoiceConfig.employerAddress,
              email: invoiceConfig.employerEmail,
              employer: invoiceConfig.employer,
              tin: invoiceConfig.employerTin,
            }}
            dailyEntries={props.userData.dailyEntries}
            totals={props.userData.totals}
          />
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
