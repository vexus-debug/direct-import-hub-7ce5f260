import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  UserPlus, CalendarPlus, FileText, ChevronRight,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  useDashboardStats, useWeeklyAppointments, useRevenueData,
  useTodaySchedule, useRecentActivity, useTreatmentDistribution,
} from "@/hooks/useDashboardData";
import { format } from "date-fns";
import { useOrg } from "@/hooks/useOrg";
import { hasPageAccess } from "@/config/roleAccess";
import { cn } from "@/lib/utils";
import { PageTourButton } from "@/components/dashboard/tour/PageTourButton";

/* Status styles — one shared set, semantic only */
const statusStyles: Record<string, string> = {
  scheduled: "border-border text-foreground",
  "in-progress": "border-amber-500/40 text-amber-700",
  completed: "border-emerald-500/40 text-emerald-700",
  cancelled: "border-destructive/40 text-destructive",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", minimumFractionDigits: 0,
  }).format(amount);
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: "12px",
  boxShadow: "0 1px 2px hsl(var(--foreground) / 0.08)",
};

export default function DashboardHome() {
  const { data: stats } = useDashboardStats();
  const { data: weeklyData } = useWeeklyAppointments();
  const { data: revenueData } = useRevenueData();
  const { data: todayAppointments } = useTodaySchedule();
  const { data: activities } = useRecentActivity();
  const { data: treatmentDist, isLoading: treatmentDistLoading } = useTreatmentDistribution();
  const { currentOrg, basePath } = useOrg();
  const orgRole = currentOrg?.role || "receptionist";

  const s = stats || { totalPatients: 0, todayAppointments: 0, pendingPayments: 0, monthlyRevenue: 0 };
  const schedule = todayAppointments || [];
  const recentActivities = activities || [];

  const canSeePatients = hasPageAccess(orgRole, "patients");
  const canSeeBilling = hasPageAccess(orgRole, "billing");
  const canSeeAppointments = hasPageAccess(orgRole, "appointments");

  const quickActions = [
    canSeePatients && { to: `${basePath}/patients`, icon: UserPlus, title: "Register patient" },
    canSeeAppointments && { to: `${basePath}/appointments`, icon: CalendarPlus, title: "Book appointment" },
    canSeeBilling && { to: `${basePath}/billing`, icon: FileText, title: "Create invoice" },
  ].filter(Boolean) as any[];

  const completedToday = schedule.filter((a) => a.status === "completed").length;
  const inProgressToday = schedule.filter((a) => a.status === "in-progress").length;
  const cancelledToday = schedule.filter((a) => a.status === "cancelled").length;
  const upcomingToday = schedule.filter((a) => a.status === "scheduled").length;
  const nowHHmm = format(new Date(), "HH:mm");
  const nextAppointment =
    schedule.find((a) => a.status === "scheduled" && a.time >= nowHHmm) ||
    schedule.find((a) => a.status === "scheduled");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div
        className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between"
        data-tour="page-header"
      >
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Today</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d")} · {schedule.length} appointment
            {schedule.length !== 1 ? "s" : ""} scheduled
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0" data-tour="dashboard-quick-actions">
          <PageTourButton />
          {quickActions.map((action: any) => (
            <Button key={action.to} size="sm" variant="outline" asChild>
              <Link to={action.to}>
                <action.icon className="h-3.5 w-3.5" />
                {action.title}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div
        className="grid grid-cols-2 overflow-hidden rounded-md border border-border bg-card lg:grid-cols-4"
        data-tour="dashboard-kpi-cards"
      >
        {canSeePatients && (
          <div className="border-b border-r border-border p-4 lg:border-b-0">
            <p className="text-sm text-muted-foreground">Total patients</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.totalPatients}</p>
          </div>
        )}
        {canSeeAppointments && (
          <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
            <p className="text-sm text-muted-foreground">Appointments today</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.todayAppointments}</p>
            <p className="mt-1 text-sm text-muted-foreground">{completedToday} completed</p>
          </div>
        )}
        {canSeeBilling && (
          <div className="border-r border-border p-4">
            <p className="text-sm text-muted-foreground">Pending payments</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{s.pendingPayments}</p>
          </div>
        )}
        {canSeeBilling && (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Revenue in {format(new Date(), "MMMM")}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">{formatCurrency(s.monthlyRevenue)}</p>
          </div>
        )}
      </div>

      {/* Today's schedule — primary working surface */}
      {canSeeAppointments && (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border py-3">
            <div>
              <CardTitle className="text-base font-semibold" data-tour="dashboard-today-schedule">
                Today's schedule
              </CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {upcomingToday} upcoming · {inProgressToday} in progress · {completedToday} done
                {cancelledToday > 0 ? ` · ${cancelledToday} cancelled` : ""}
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`${basePath}/appointments`}>
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {nextAppointment && (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-b border-border bg-muted/40 px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">Next up</span>
                <span className="font-medium text-foreground">{nextAppointment.time}</span>
                <span className="text-foreground">{nextAppointment.patientName}</span>
                <span className="text-muted-foreground">
                  {nextAppointment.treatment}
                  {nextAppointment.chair ? ` · ${nextAppointment.chair}` : ""}
                </span>
              </div>
            )}
            {schedule.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <p className="text-sm text-muted-foreground">No appointments today</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`${basePath}/appointments`}>Book appointment</Link>
                </Button>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto scroll-momentum">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2 font-medium">Time</th>
                      <th className="px-4 py-2 font-medium">Patient</th>
                      <th className="hidden px-4 py-2 font-medium sm:table-cell">Treatment</th>
                      <th className="hidden px-4 py-2 font-medium md:table-cell">Provider</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((apt) => (
                      <tr key={apt.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                        <td className="px-4 py-2.5 tabular-nums text-foreground">{apt.time}</td>
                        <td className="px-4 py-2.5 font-medium text-foreground">{apt.patientName}</td>
                        <td className="hidden px-4 py-2.5 text-muted-foreground sm:table-cell">{apt.treatment}</td>
                        <td className="hidden px-4 py-2.5 text-muted-foreground md:table-cell">{apt.dentist}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs",
                              statusStyles[apt.status] || "border-border text-muted-foreground"
                            )}
                          >
                            {apt.status.replace("-", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Week volume */}
        {canSeeAppointments && (
          <Card>
            <CardHeader className="border-b border-border py-3">
              <CardTitle className="text-base font-semibold">This week</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">Appointments per day</p>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData || []} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent activity */}
        <Card>
          <CardHeader className="border-b border-border py-3">
            <CardTitle className="text-base font-semibold" data-tour="dashboard-activity-feed">
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentActivities.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <ul className="max-h-[280px] divide-y divide-border overflow-y-auto scroll-momentum">
                {recentActivities.map((activity) => (
                  <li key={activity.id} className="flex items-baseline justify-between gap-4 px-4 py-2.5">
                    <span className="text-sm text-foreground">{activity.description}</span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {format(new Date(activity.created_at), "MMM d, h:mm a")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary strip — deeper analysis lives in Reports */}
      {canSeeBilling && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border py-3">
            <div>
              <CardTitle className="text-base font-semibold" data-tour="dashboard-revenue-chart">
                Revenue by month
              </CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">Last {(revenueData || []).length} months (₦)</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to={`${basePath}/reports`}>
                Reports <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData || []} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} formatter={(v: number) => [formatCurrency(v), "Revenue"]} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Treatment mix */}
      <Card data-tour="dashboard-treatment-breakdown">
        <CardHeader className="border-b border-border py-3">
          <CardTitle className="text-base font-semibold">Treatment mix</CardTitle>
          <p className="mt-0.5 text-sm text-muted-foreground">Share of recorded treatments</p>
        </CardHeader>
        <CardContent className="pt-4">
          {treatmentDistLoading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-3 w-full animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : (treatmentDist || []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Distribution appears once appointments are linked to treatments.
            </p>
          ) : (
            <ul className="space-y-3">
              {(treatmentDist || []).map((item) => (
                <li key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {item.value}% ({item.count})
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
