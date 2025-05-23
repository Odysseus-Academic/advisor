"use client"
import { Section } from "@prisma/client";
import { AreaChart, ChartTooltipProps, getFilteredChartTooltipPayload } from "@mantine/charts";
import '@mantine/charts/styles.css';
import { Paper, Text, Stack, Space } from '@mantine/core';

interface SectionsGraphProps {
  sections: Section[]
}

type CombinedGrades = {
  _key: number;
  term: string;
  numberSections: number;
  avgGPA: number;
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
  W: number;
};


function ChartTooltip({ label, payload }: ChartTooltipProps) {
  if (!payload) return null;
  const reversedPayload = [...payload].reverse();
  return (
    <Paper px="md" py="sm" withBorder shadow="md" radius="md">
      <Text fw={500} mb={5}>
        <b> {reversedPayload[0] && reversedPayload[0].name && reversedPayload[0].name === "W" ? "Withdrawal Rate" : label} </b>
      </Text>
      {getFilteredChartTooltipPayload(reversedPayload).map((item: any) => (
        <Text key={item.name} c={item.color} fz="sm">
          {item.name} :  { item.name === "W" ? (Math.round(item.value * 10) / 10) : (Math.round(item.value / item.payload.avgGPA * 1000) / 10)}% 
        </Text>
      ))}
    </Paper>
  );
}
const adjustSections = (prev: number, n: number, num: number) => {
  return ((prev * num) + n) / (num + 1)
}
export function SectionsGraph({ sections }: SectionsGraphProps) {
  const terms = { "Spring": 0, "Summer I": 1, "Summer II": 2, "Fall": 3, "Winter": 4 }
  const termData = Object.values(sections.map(section => {
    const gradeCount = section.gradeData
    return {
      _key: Number(section.year + "" + terms[section.term as keyof typeof terms]),
      term: `${section.term} ${section.year}`,
      numberSections: 1,
      avgGPA: section.gpa,
      A: gradeCount[0] + gradeCount[1],
      B: gradeCount[2] + gradeCount[3] + gradeCount[4],
      C: gradeCount[5] + gradeCount[6] + gradeCount[7],
      D: gradeCount[8] + gradeCount[9] + gradeCount[10],
      F: gradeCount[11],
      W: gradeCount[12]
    }
  }).reduce((acc, curr) => {
    if (!acc[curr.term]) {
      acc[curr.term] = { ...curr };
    } else {
      acc[curr.term].avgGPA = adjustSections(acc[curr.term].avgGPA, curr.avgGPA, acc[curr.term].numberSections);
      acc[curr.term].A = adjustSections(acc[curr.term].A, curr.A, acc[curr.term].numberSections);
      acc[curr.term].B = adjustSections(acc[curr.term].B, curr.B, acc[curr.term].numberSections);
      acc[curr.term].C = adjustSections(acc[curr.term].C, curr.C, acc[curr.term].numberSections);
      acc[curr.term].D = adjustSections(acc[curr.term].D, curr.D, acc[curr.term].numberSections);
      acc[curr.term].F = adjustSections(acc[curr.term].F, curr.F, acc[curr.term].numberSections);
      acc[curr.term].W = adjustSections(acc[curr.term].W, curr.W, acc[curr.term].numberSections);
      acc[curr.term].numberSections += 1
    }
    return acc;
  }, {} as Record<string, CombinedGrades>)).sort((a, b) => a._key - b._key);
  termData.forEach((currTerm, index) => {
    termData[index].W = currTerm.W
    termData[index].avgGPA = Math.round(currTerm.avgGPA * 100) / 100
    termData[index].A = currTerm.A * termData[index].avgGPA / ( 1 - termData[index].W / 100) / 100 
    termData[index].B = currTerm.B  * termData[index].avgGPA / ( 1 - termData[index].W / 100) / 100 
    termData[index].C = currTerm.C  * termData[index].avgGPA / ( 1 - termData[index].W / 100) / 100 
    termData[index].D = currTerm.D  * termData[index].avgGPA / ( 1 - termData[index].W / 100) / 100 
    termData[index].F = currTerm.F  * termData[index].avgGPA / ( 1 - termData[index].W / 100) / 100 

    // Make sure to add to 100
    termData[index].B = termData[index].avgGPA * (termData[index].B / termData[index].avgGPA + ((100-((Math.round(termData[index].A / termData[index].avgGPA * 1000) / 10) + (Math.round(termData[index].B / termData[index].avgGPA * 1000) / 10) + (Math.round(termData[index].C / termData[index].avgGPA * 1000) / 10) + (Math.round(termData[index].D / termData[index].avgGPA * 1000) / 10) + (Math.round(termData[index].F / termData[index].avgGPA * 1000)/10)))/100))
  })

  return (
    <Stack>
    <AreaChart h={300} data={termData} dataKey="term" type="stacked"
      tooltipProps={{
        content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
      }}
      curveType="monotone"
      // xAxisLabel="Term"
      withXAxis={false}
      yAxisLabel="GPA"
      yAxisProps={{ domain: [0, 4], ticks: [0, 1, 2, 3, 4] }}
      series={[
        { name: 'F', color: 'red.6' },
        { name: 'D', color: 'orange.6' },
        { name: 'C', color: 'yellow.6' },
        { name: 'B', color: 'green.6' },
        { name: 'A', color: 'cyan.6' },
      ]} 
      areaChartProps={{ syncId: 'outcomes' }}/>
      <Space />
      <AreaChart h={125} data={termData} dataKey="term" type="stacked"
      tooltipProps={{
        content: ({ label, payload }) => <ChartTooltip label={label} payload={payload} />,
      }}
      curveType="monotone"
      xAxisLabel="Term"
      yAxisLabel="% W"
      yAxisProps={{ domain: [0, 50], ticks: [0, 50] }}
      series={[
        { name: 'W', color: 'black' },
      ]} 
      areaChartProps={{ syncId: 'outcomes' }}/>
      </Stack>
  )
}