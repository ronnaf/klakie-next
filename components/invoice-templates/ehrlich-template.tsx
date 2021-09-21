import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import dayjs from "dayjs";
import _ from "lodash";
import numeral from "numeral";
import React, { useMemo } from "react";
import { DailyEntry } from "../../lib/models/daily-entry";

type Props = {
  from: {
    name: string;
    address: string;
    email: string;
    tin: string;
    employmentType: string;
    taxPercent: number;
    bank: string;
    bankAccount: string;
    hourlyRate: number;
  };
  to: {
    employer: string;
    address: string;
    email: string;
    tin: string;
  };
  totals: {
    earnings: number;
    taxWithheld: number;
    totalEarnings: number;
    totalTimeInSeconds: number;
    totalTimeInHours: number;
  };
  dailyEntries: DailyEntry[];
};

const tableColumns = [
  {
    id: "date",
    contentAlign: "right" as const,
    align: "left" as const,
    title: "Date",
    width: "10%",
  },
  {
    id: "description",
    contentAlign: "left" as const,
    align: "left" as const,
    title: "Description",
    width: "43%",
  },
  {
    id: "weekNumber",
    contentAlign: "center" as const,
    align: "center" as const,
    title: "Week #",
    width: "8%",
  },
  {
    id: "weekTotal",
    contentAlign: "center" as const,
    align: "center" as const,
    title: "Week total (hours)",
    width: "15%",
  },
  {
    id: "qty",
    contentAlign: "center" as const,
    align: "center" as const,
    title: "QTY (hours)",
    width: "12%",
    bold: true,
  },
  {
    id: "due",
    contentAlign: "center" as const,
    align: "center" as const,
    title: "DUE (pesos)",
    width: "12%",
    bold: true,
  },
];

const tableSummaryColumns = [
  { id: "bank_label", align: "left" as const, width: "10%" },
  { id: "bank_value", align: "left" as const, width: "20%" },
  { id: "empty_column", align: "center" as const, width: "46%" },
  { id: "summary_label", align: "center" as const, width: "12%" },
  { id: "summary_value", align: "center" as const, width: "12%", bold: true },
];

const getCurrentPeriodCode = (date: string) => {
  return (dayjs(date).format("MMMYYYY") + (dayjs(date).date() === 1 ? "a" : "b")).toLowerCase();
};

export const EhrlichInvoiceTemplate = (props: Props) => {
  const watermark = useMemo(
    () => props.from.name.split(" ").join("").toLowerCase(),
    [props.from.name]
  );
  const period = useMemo(
    () => getCurrentPeriodCode(props.dailyEntries[0]?.dateStarted),
    [props.dailyEntries]
  );
  const ascendingDailyEntries = [...props.dailyEntries].sort((a, b) => {
    const dateA = a.dateStarted;
    const dateB = b.dateStarted;
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0;
  });

  return (
    <Document title="Invoice">
      <Page size="A4" style={[styles.page, fontSizes.body]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.username, fontSizes.heading]}>{props.from.name}</Text>
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
                {props.from.name}
              </Text>
              <Text style={styles.doubleSpace}>{props.from.address}</Text>
              <View style={[styles.inlineSpaceEvenly, styles.doubleSpace]}>
                <Text style={{ width: "80%" }}>{props.from.email}</Text>
                <Text style={{ width: "20%" }}>{props.from.employmentType.toUpperCase()}</Text>
              </View>
              <View style={styles.inlineSpaceEvenly}>
                <Text style={{ width: "80%" }}>TIN: {props.from.tin}</Text>
                <Text style={{ width: "20%" }}>{props.from.taxPercent}%</Text>
              </View>
            </View>
          </View>
          <View style={styles.inlineBox}>
            <Text style={{ marginBottom: 4 }}>To</Text>
            <View style={styles.addressBox}>
              <Text style={[fontSizes.body, styles.doubleSpace, { fontWeight: "bold" }]}>
                {props.to.employer}
              </Text>
              <Text>{props.to.address}</Text>
              <Text>{props.to.email}</Text>
              {props.to.tin && <Text>TIN: {props.to.tin}</Text>}
            </View>
          </View>
          <View style={{ width: "65%", alignItems: "flex-end" }}>
            <Text style={{ color: "#fff" }}>Period</Text>
            <View style={styles.flex}>
              <Text>period:</Text>
              <Text style={styles.period}>{period}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.watermarkPeriod}>{period}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.watermarkText}>{watermark}</Text>
        {/* begin::Table */}
        <View>
          {/* begin::Table Header */}
          <View style={[styles.flex, fontSizes.label, styles.tableHeader]}>
            {tableColumns.map((header, i) => {
              const isSecondToLast = i === tableColumns.length - 2;
              const isLast = i === tableColumns.length - 1;
              return (
                <View
                  key={header.title.toLowerCase()}
                  style={{
                    padding: 4,
                    width: header.width,
                    borderTop: isSecondToLast || isLast ? "2px solid black" : 0,
                    borderLeft: isSecondToLast ? "2px solid black" : 0,
                    borderRight: isLast ? "2px solid black" : 0,
                  }}>
                  <Text
                    style={{
                      textAlign: header.align,
                      fontWeight: header.bold ? "bold" : "normal",
                    }}>
                    {header.title}
                  </Text>
                </View>
              );
            })}
          </View>
          {/* end::Table Header */}
          <View>
            {/* begin::Table Body */}
            {ascendingDailyEntries.map((dailyEntry, i) => {
              const columns = [
                // Date
                dayjs(dailyEntry.dateStarted).format("M/D"),
                // Description
                _.truncate(dailyEntry.groupedTimeEntries.map((e) => e.description).join(", "), {
                  length: 48,
                }),
                // Week #
                dayjs(dailyEntry.dateStarted).week(),
                // Week total (hours)
                " ",
                // QTY (hours)
                dailyEntry.totalDayHours.toFixed(2),
                // DUE (pesos)
                numeral(dailyEntry.totalDayHours * props.from.hourlyRate).format("0,0.00"),
              ];
              const isLastEntry = i === ascendingDailyEntries.length - 1;
              return (
                <View key={dailyEntry.dateStarted} style={[styles.flex, fontSizes.body]}>
                  {tableColumns.map((header, i) => {
                    const isFirst = i === 0;
                    const isSecondToLast = i === tableColumns.length - 2;
                    const isLast = i === tableColumns.length - 1;
                    return (
                      <View
                        key={header.title.toLowerCase()}
                        style={{
                          paddingHorizontal: 4,
                          paddingVertical: 3,
                          width: header.width,
                          borderLeft: isSecondToLast ? "2px solid black" : 0,
                          borderRight: isLast ? "2px solid black" : 0,
                          borderBottom: isLastEntry ? "2px solid black" : "1px dotted black",
                        }}>
                        <Text
                          style={{
                            paddingRight: isFirst ? 12 : 0,
                            textAlign: header.contentAlign,
                          }}>
                          {columns[i]}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              );
            })}
            {/* begin::Totals */}
            <View style={[styles.flex, fontSizes.body]}>
              {tableColumns.map((header, i) => {
                const isSecondToLast = i === tableColumns.length - 2;
                const isLast = i === tableColumns.length - 1;
                return (
                  <View
                    key={header.title.toLowerCase()}
                    style={{
                      paddingHorizontal: 4,
                      paddingVertical: 3,
                      width: header.width,
                      borderLeft: isSecondToLast ? "2px solid black" : 0,
                      borderRight: isLast ? "2px solid black" : 0,
                      borderBottom: isSecondToLast || isLast ? "2px solid black" : 0,
                    }}>
                    <Text
                      style={{
                        textAlign: header.contentAlign,
                      }}>
                      {isSecondToLast && props.totals.totalTimeInHours.toFixed(2)}
                      {isLast && numeral(props.totals.earnings).format("0,0.00")}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={[styles.flex, fontSizes.body]}>
              {tableSummaryColumns.map((col, i) => {
                const isFirst = i === 0;
                const isSecond = i === 1;
                const isSecondToLast = i === tableSummaryColumns.length - 2;
                const isLast = i === tableSummaryColumns.length - 1;
                return (
                  <View
                    key={col.id}
                    style={{
                      paddingHorizontal: 4,
                      paddingVertical: 3,
                      width: col.width,
                      textAlign: col.align,
                      backgroundColor: isFirst || isSecond ? colors.BACKGROUND : undefined,
                    }}>
                    {isFirst && <Text style={fontSizes.label}>Bank:</Text>}
                    {isSecond && <Text style={fontSizes.label}>{props.from.bank}</Text>}
                    {isSecondToLast && <Text style={fontSizes.label}>Tax withheld:</Text>}
                    {isLast && <Text>{numeral(props.totals.taxWithheld).format("0,0.00")}</Text>}
                  </View>
                );
              })}
            </View>
            <View style={[styles.flex, fontSizes.body]}>
              {tableSummaryColumns.map((col, i) => {
                const isFirst = i === 0;
                const isSecond = i === 1;
                const isSecondToLast = i === tableSummaryColumns.length - 2;
                const isLast = i === tableSummaryColumns.length - 1;
                return (
                  <View
                    key={col.id}
                    style={{
                      paddingHorizontal: 4,
                      paddingVertical: 3,
                      width: col.width,
                      textAlign: col.align,
                      backgroundColor:
                        isFirst || isSecond || isLast ? colors.BACKGROUND : undefined,
                    }}>
                    {isFirst && <Text style={fontSizes.label}>Bank acct.:</Text>}
                    {isSecond && <Text style={fontSizes.label}>{props.from.bankAccount}</Text>}
                    {isSecondToLast && <Text style={fontSizes.label}>Due amount:</Text>}
                    {isLast && (
                      <Text style={{ fontWeight: "bold" }}>
                        {numeral(props.totals.totalEarnings).format("0,0.00")}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
            {/* end::Totals */}
            {/* begin::Remarks */}
            <View style={{ marginTop: 20 }}>
              <View style={styles.paperRule}>
                <Text style={[fontSizes.label, { fontWeight: "bold" }]}>
                  Other details / Remarks:
                </Text>
              </View>
              <View style={[styles.paperRule, styles.flex]}>
                <Text style={[fontSizes.label]}>Hourly:</Text>
                <Text style={[fontSizes.label, { marginLeft: 24 }]}>{props.from.hourlyRate}</Text>
              </View>
              <View style={styles.paperRule}>
                <Text style={[fontSizes.label, { fontWeight: "bold" }]}>&nbsp;</Text>
              </View>
            </View>
            {/* end::Remarks */}
          </View>
          {/* end::Table Body */}
        </View>
        {/* end::Table */}
      </Page>
    </Document>
  );
};

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
  TABLE_HEADER: "#D9D9D9",
  LINE: "#B7B7B7",
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
  tableHeader: {
    backgroundColor: colors.TABLE_HEADER,
  },
  paperRule: {
    borderBottom: "1px solid " + colors.LINE,
    paddingHorizontal: 4,
    paddingVertical: 5,
  },
});
