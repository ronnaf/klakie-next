import React from "react";
import { Document, Font, Page, PDFViewer, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Style } from "@react-pdf/types";
import { dataAttr } from "@chakra-ui/utils";

type Column = {
  /** The selector field for [data] */
  id: string;
  /** The header name of this column */
  name: string;
  /** The alignment of the header. default: center */
  headerAlign?: "left" | "center" | "right";
  /** The alignment of the content. default: center */
  contentAlign?: "left" | "center" | "right";
  /** The width in ratio this column would take. default: 100% */
  width?: number;
};

type Props = {
  data: Array<any>;
  columns: Column[];
};

export const RcPdfTable = (props: Props) => {
  return (
    <View>
      {/* begin::Header */}
      <_Row columns={props.columns}>{(col) => <Text>{col.name}</Text>}</_Row>
      {/* end::Header */}
      {/* begin::Table body */}
      {props.data.map((datum, i) => {
        const isLast = i === props.data.length - 1;
        return (
          <_Row key={i} columns={props.columns} columnStyle={{ borderBottom: 1 }}>
            {(col) => <Text>{datum[col.id]}</Text>}
          </_Row>
        );
      })}
      {/* end::Table body */}
    </View>
  );
};

type RowProps = {
  columns: Column[];
  children: (column: Column) => React.ReactNode;
  style?: Style;
  columnStyle?: Style;
};

const _Row = (props: RowProps) => {
  return (
    <View style={[styles.flex, props.style || {}]}>
      {props.columns.map((column, i) => {
        const isFirst = i === 0;
        const isLast = i === props.columns.length - 1;
        return (
          <View
            key={column.id}
            style={[
              styles.bordered,
              isFirst ? styles.firstColumnBorder : {},
              isLast ? styles.lastColumnBorder : {},
              !isFirst && !isLast ? styles.centerColumnsBorder : {},
              { width: column.width || "100%" },
              props.columnStyle || {},
            ]}>
            {props.children(column)}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  bordered: {
    borderColor: "#000",
    paddingHorizontal: 2,
  },
  firstColumnBorder: {
    borderTop: 1,
    borderLeft: 1,
    borderRight: 1,
  },
  lastColumnBorder: {
    borderTop: 1,
    borderRight: 1,
  },
  centerColumnsBorder: {
    borderTop: 1,
    borderRight: 1,
  },
});
