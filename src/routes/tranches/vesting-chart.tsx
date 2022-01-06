import { format, startOfMonth } from "date-fns";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  Label,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Colors } from "../../config";
import data from "./data.json";

const ORDER = ["community", "publicSale", "earlyInvestors", "team"];

export const VestingChart = () => {
  const { t } = useTranslation();
  const currentDate = React.useMemo(
    () => format(startOfMonth(new Date()), "yyyy-MM-dd"),
    []
  );
  return (
    <div style={{ marginBottom: 25 }}>
      <ResponsiveContainer height={400} width="100%">
        <AreaChart data={data}>
          <Tooltip
            contentStyle={{ backgroundColor: Colors.BLACK }}
            separator=":"
            formatter={(value: any) => {
              return (
                <div
                  style={{
                    display: "flex",
                    textAlign: "right",
                  }}
                >
                  {Intl.NumberFormat().format(value)}
                </div>
              );
            }}
            itemSorter={(label: any) => {
              return ORDER.indexOf(label.dataKey) + 1;
            }}
          />
          <YAxis type="number" width={100}>
            <Label
              angle={270}
              value={t("VEGA").toString()}
              position="left"
              offset={-5}
              fill={Colors.WHITE}
            />
          </YAxis>
          <XAxis dataKey="date">
            <Label
              value={t("date").toString()}
              position="bottom"
              offset={5}
              fill={Colors.WHITE}
            />
          </XAxis>
          <ReferenceLine
            x={currentDate}
            stroke={Colors.WHITE}
            strokeWidth={2}
            label={{
              position: "right",
              value: currentDate,
              fill: Colors.WHITE,
            }}
          />
          <Area
            dot={false}
            type="linear"
            dataKey="team"
            stroke={Colors.PINK}
            fill={Colors.PINK}
            yAxisId={0}
            strokeWidth={2}
            fillOpacity={0.85}
            stackId="1"
            name={t("Team")}
          />
          <Area
            dot={false}
            type="monotone"
            dataKey="earlyInvestors"
            stroke={Colors.VEGA_GREEN}
            fill={Colors.VEGA_GREEN}
            yAxisId={0}
            strokeWidth={2}
            fillOpacity={0.85}
            stackId="1"
            name={t("Early Investors")}
          />
          <Area
            dot={false}
            type="monotone"
            dataKey="publicSale"
            stroke={Colors.VEGA_YELLOW}
            fill={Colors.VEGA_YELLOW}
            yAxisId={0}
            strokeWidth={2}
            stackId="1"
            fillOpacity={0.85}
            name={t("Public Sale")}
          />
          <Area
            dot={false}
            type="monotone"
            dataKey="community"
            stroke={Colors.VEGA_ORANGE}
            fill={Colors.VEGA_ORANGE}
            yAxisId={0}
            strokeWidth={2}
            fillOpacity={0.85}
            stackId="1"
            name={t("Community")}
          />
          <Legend wrapperStyle={{ position: "relative" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
