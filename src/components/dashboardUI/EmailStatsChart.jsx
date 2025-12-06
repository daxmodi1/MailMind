"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const chartConfig = {
  received: {
    label: "Received",
    color: "hsl(217, 91%, 60%)",
  },
  sent: {
    label: "Sent",
    color: "hsl(217, 91%, 80%)",
  },
}

export function EmailStatsChart({ data, title, description, timeRange = "daily" }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || "Email Activity"}</CardTitle>
        <CardDescription>
          {description || `Showing ${timeRange} email statistics`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id="fillReceived" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillSent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 80%)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="hsl(217, 91%, 80%)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="sent"
              type="natural"
              fill="url(#fillSent)"
              stroke="hsl(217, 91%, 80%)"
              strokeWidth={2}
            />
            <Area
              dataKey="received"
              type="natural"
              fill="url(#fillReceived)"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Helper function to process emails into daily stats
export function processEmailsToDaily(emails) {
  const last7Days = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    
    last7Days.push({
      date: dateStr,
      label: dayName,
      received: 0,
      sent: 0,
    })
  }
  
  emails.forEach(email => {
    const emailDate = new Date(email.date).toISOString().split('T')[0]
    const dayData = last7Days.find(d => d.date === emailDate)
    
    if (dayData) {
      const isSent = email.labelIds?.includes('SENT')
      if (isSent) {
        dayData.sent++
      } else {
        dayData.received++
      }
    }
  })
  
  return last7Days
}

// Helper function to process emails into weekly stats
export function processEmailsToWeekly(emails) {
  const last4Weeks = []
  const today = new Date()
  
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - (i * 7) - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    last4Weeks.push({
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      label: `Week ${4 - i}`,
      received: 0,
      sent: 0,
    })
  }
  
  emails.forEach(email => {
    const emailDate = new Date(email.date).toISOString().split('T')[0]
    
    const weekData = last4Weeks.find(w => 
      emailDate >= w.weekStart && emailDate <= w.weekEnd
    )
    
    if (weekData) {
      const isSent = email.labelIds?.includes('SENT')
      if (isSent) {
        weekData.sent++
      } else {
        weekData.received++
      }
    }
  })
  
  return last4Weeks
}

// Demo data for testing
export const demoWeeklyData = [
  { label: "Week 1", received: 45, sent: 12 },
  { label: "Week 2", received: 52, sent: 18 },
  { label: "Week 3", received: 38, sent: 15 },
  { label: "Week 4", received: 61, sent: 22 },
]

export const demoDailyData = [
  { label: "Mon", received: 12, sent: 3 },
  { label: "Tue", received: 18, sent: 5 },
  { label: "Wed", received: 15, sent: 4 },
  { label: "Thu", received: 22, sent: 8 },
  { label: "Fri", received: 19, sent: 6 },
  { label: "Sat", received: 8, sent: 2 },
  { label: "Sun", received: 5, sent: 1 },
]
