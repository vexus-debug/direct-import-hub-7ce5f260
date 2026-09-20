import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Users, CalendarDays, CreditCard, TrendingUp, UserPlus, CalendarPlus, FileText,
  Clock, Activity, Zap, ChevronRight, CalendarCheck,
  CircleDot, BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart,
} from "recharts";
import {
  useDashboardStats, useWeeklyAppointments, useRevenueData,
  useTodaySchedule, useRecentActivity, useTreatmentDistribution,
} from "@/hooks/useDashboardData";
import { format } from "date-fns";
import { useOrg } from "@/hooks/useOrg";
import { hasPageAccess } from "@/config/roleAccess";
import { AnimatedCounter } from "@/components/dashboard/AnimatedCounter";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PageTourButton } from "@/components/dashboard/tour/PageTourButton";

/* ─── Colour maps ────────────────────────────────────────────── */
const statusColors: Record<string, string> = {
  scheduled:    "bg-primary/[0.05] text-primary border-primary/20",
  "in-progress": "bg-amber-500/10 text-amber-700 border-amber-500/20",
  completed:    "bg-emerald-500/[0.05] text-emerald-700 border-emerald-500/20",
  cancelled:    "bg-red-500/[0.05] text-red-700 border-red-500/20",
};
const statusDots: Record<string, string> = {
  scheduled:    "bg-primary",
  "in-progress": "bg-amber-500",
  completed:    "bg-emerald-500",
  cancelled:    "bg-red-500",
};
const activityColors: Record<string, string> = {
  appointment:  "bg-primary/[0.05] text-primary",
  payment:      "bg-emerald-500/[0.05] text-emerald-600",
  patient:      "bg-primary/[0.05] text-primary",
  lab:          "bg-amber-500/10 text-amber-600",
  prescription: "bg-rose-500/10 text-rose-600",
};
const activityIcons: Record<string, typeof Activity> = {
  appointment:  CalendarDays,
  payment:      CreditCard,
  patient:      Users,
  lab:          FileText,
  prescription: FileText,
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", minimumFractionDigits: 0,
  }).format(amount);
}

const stagger = {
  container: { hidden: {}, visible: {} },
  item: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
};

/* ─── Tooltip style ──────────────────────────────────────────── */
const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "6px",
  fontSize: "12px",
  boxShadow: "0 1px 2px hsl(var(--foreground) / 0.08)",
};

/* ─── Greeting helper ────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════════
   Dashboard Home — Premium Bento Layout
═══════════════════════════════════════════════════════════════ */
export default function DashboardHome() {
  const [revPeriod, setRevPeriod] = useState<"6M" | "1Y">("6M");

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

  const canSeePatients     = hasPageAccess(orgRole, "patients");
  const canSeeBilling      = hasPageAccess(orgRole, "billing");
  const canSeeAppointments = hasPageAccess(orgRole, "appointments");

  /* Quick actions */
  const quickActions = [
    canSeePatients    && { to: `${basePath}/patients`,     icon: UserPlus,    title: "Register Patient" },
    canSeeAppointments && { to: `${basePath}/appointments`, icon: CalendarPlus, title: "Book Appointment" },
    canSeeBilling     && { to: `${basePath}/billing`,      icon: FileText,    title: "Create Invoice" },
  ].filter(Boolean) as any[];

  /* Derived widget data */
  const completedToday = schedule.filter((a) => a.status === "completed").length;
  const inProgressToday = schedule.filter((a) => a.status === "in-progress").length;
  const cancelledToday = schedule.filter((a) => a.status === "cancelled").length;
  const completionPct = schedule.length ? Math.round((completedToday / schedule.length) * 100) : 0;
  const nowHHmm = format(new Date(), "HH:mm");
  const nextAppointment =
    schedule.find((a) => a.status === "scheduled" && a.time >= nowHHmm) ||
    schedule.find((a) => a.status === "scheduled");
  const revSeries = revenueData || [];
  const avgMonthlyRevenue = revSeries.length
    ? Math.round(revSeries.reduce((sum, r) => sum + r.revenue, 0) / revSeries.length)
    : 0;
  const bestMonth = revSeries.length
    ? revSeries.reduce((best, r) => (r.revenue > best.revenue ? r : best), revSeries[0])
    : null;

  return (
    <div className="space-y-5">

      <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between" data-tour="page-header">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Today</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d")} · {schedule.length} appointment{schedule.length !== 1 ? "s" : ""} scheduled
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

      <div className="grid grid-cols-2 overflow-hidden rounded-md border border-border bg-card lg:grid-cols-4" data-tour="dashboard-kpi-cards">
        {canSeePatients && (
          <div className="border-b border-r border-border p-4 lg:border-b-0">
            <p className="text-sm text-muted-foreground">Total patients</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums"><AnimatedCounter value={s.totalPatients} /></p>
          </div>
        )}
        {canSeeAppointments && (
          <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
            <p className="text-sm text-muted-foreground">Appointments today</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums"><AnimatedCounter value={s.todayAppointments} /></p>
            <p className="mt-1 text-xs text-muted-foreground">{completedToday} completed</p>
          </div>
        )}
        {canSeeBilling && (
          <div className="border-r border-border p-4">
            <p className="text-sm text-muted-foreground">Pending payments</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums"><AnimatedCounter value={s.pendingPayments} /></p>
          </div>
        )}
        {canSeeBilling && (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">Revenue in {format(new Date(), "MMMM")}</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums"><AnimatedCounter value={s.monthlyRevenue} formatter={formatCurrency} /></p>
          </div>
        )}
      </div>

      {/* ── Row 2b: Insight widgets ─────────────────────────────── */}
      <motion.div
        className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        data-tour="dashboard-insight-widgets"
        variants={stagger.container}
        initial="hidden"
        animate="visible"
      >
        {/* Next up */}
        {canSeeAppointments && (
          <motion.div variants={stagger.item} className="min-w-0">
            <Card className="border-border/50 bg-card h-full overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Next appointment</p>
                </div>
                {nextAppointment ? (
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{nextAppointment.patientName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {nextAppointment.time} · {nextAppointment.treatment} · {nextAppointment.chair}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Nothing left today</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Today's progress */}
        {canSeeAppointments && (
          <motion.div variants={stagger.item} className="min-w-0">
            <Card className="border-border/50 bg-card h-full overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  <p className="text-sm font-medium text-muted-foreground">Today's progress</p>
                </div>
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {completedToday}/{schedule.length || 0} <span className="text-xs font-medium text-muted-foreground">completed</span>
                </p>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  {inProgressToday} in progress · {cancelledToday} cancelled
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Revenue pace */}
        {canSeeBilling && (
          <motion.div variants={stagger.item} className="min-w-0">
            <Card className="border-border/50 bg-card h-full overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Revenue pace</p>
                </div>
                <p className="text-lg font-bold tabular-nums text-foreground truncate">{formatCurrency(avgMonthlyRevenue)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  6-month average · best {bestMonth ? `${bestMonth.month} (${formatCurrency(bestMonth.revenue)})` : "—"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>



      {/* ── Row 3: Revenue Chart (wide) + Treatment Breakdown (narrow) ── */}
      {(canSeeAppointments || canSeeBilling) && (
        <motion.div
          className="grid gap-4 lg:grid-cols-5"
          variants={stagger.container}
          initial="hidden"
          animate="visible"
        >
          {/* Revenue trend — sleek area */}
          {canSeeBilling && (
            <motion.div variants={stagger.item} className="lg:col-span-3 min-w-0">
              <Card className="border-border/50 bg-card h-full  transition-shadow duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/[0.05] flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold" data-tour="dashboard-revenue-chart">Revenue Overview</CardTitle>
                        <CardDescription className="text-[11px]">Monthly trend (₦)</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-0.5 bg-muted/60 rounded-lg p-0.5">
                      {(["6M", "1Y"] as const).map((label) => (
                        <button
                          key={label}
                          onClick={() => setRevPeriod(label)}
                          className={cn(
                            "px-3 py-1 text-[11px] font-semibold rounded-md transition-all",
                            revPeriod === label
                              ? "bg-card text-primary shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={revenueData || []}>
                      <defs>
                        <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                        axisLine={false} tickLine={false} width={44}
                        tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [formatCurrency(v), "Revenue"]} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#revGrad2)" dot={{ r: 3, fill: "hsl(var(--primary))", strokeWidth: 0 }} activeDot={{ r: 5, fill: "hsl(var(--primary))" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Treatment breakdown — horizontal bars */}
          <motion.div variants={stagger.item} className="lg:col-span-2 min-w-0">
            <Card className="border-border/50 bg-card h-full  transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gold/[0.05] flex items-center justify-center">
                    <CircleDot className="h-4 w-4 text-gold-deep" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold" data-tour="dashboard-treatment-breakdown">Treatments</CardTitle>
                    <CardDescription className="text-[11px]">Distribution by type</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3.5">
                {treatmentDistLoading ? (
                  <div className="space-y-3.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                        <div className="h-2 w-full bg-muted rounded-full animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : (treatmentDist || []).length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No treatment data yet</p>
                    <p className="text-[11px] text-muted-foreground">
                      Distribution appears once appointments are linked to treatments.
                    </p>
                  </div>
                ) : (treatmentDist || []).map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className="font-bold text-foreground tabular-nums">{item.value}% <span className="font-medium text-muted-foreground">({item.count})</span></span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: item.fill }}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* ── Row 4: Timeline Schedule + Weekly Heatmap + Activity ── */}
      <div className="grid gap-4 lg:grid-cols-12">

        {/* Today's Schedule — Timeline Cards */}
        {canSeeAppointments && (
          <Card className="lg:col-span-5 min-w-0 overflow-hidden border-border/50 bg-card  transition-shadow duration-300">

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/[0.05] flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold" data-tour="dashboard-today-schedule">Today's Schedule</CardTitle>
                    <CardDescription className="text-[11px]">
                      {schedule.filter(a => a.status === "completed").length} done · {schedule.filter(a => a.status === "scheduled").length} upcoming
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary text-xs gap-1" asChild>
                  <Link to={`${basePath}/appointments`}>
                    View all <ChevronRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4 max-h-[380px] overflow-y-auto scroll-momentum">
              {schedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No appointments today</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`${basePath}/appointments`}>Book Appointment</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {schedule.slice(0, 8).map((apt, i) => {
                    const initials = apt.patientName.split(" ").map((n: string) => n[0]).join("").slice(0, 2);
                    return (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 border border-transparent hover:border-border/50 transition-all group"
                      >
                        {/* Time pill */}
                        <div className="flex flex-col items-center justify-center bg-card border border-border/60 rounded-lg px-2 py-1.5 min-w-[52px] shadow-sm">
                          <span className="text-xs font-bold text-foreground tabular-nums leading-none">{apt.time}</span>
                        </div>
                        {/* Patient info */}
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary/[0.05] text-primary text-[10px] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{apt.patientName}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{apt.treatment} · {apt.dentist}</p>
                        </div>
                        {/* Status dot */}
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border",
                          statusColors[apt.status] || ""
                        )}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", statusDots[apt.status] || "")} />
                          {apt.status.replace("-", " ")}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Weekly Appointments — Vertical bars with day labels */}
        {canSeeAppointments && (
          <motion.div
            className="lg:col-span-4 min-w-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 bg-card h-full  transition-shadow duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/[0.05] flex items-center justify-center">
                      <CalendarCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">This Week</CardTitle>
                      <CardDescription className="text-[11px]">Appointment volume</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary text-xs gap-1" asChild>
                    <Link to={`${basePath}/appointments`}>
                      Calendar <ChevronRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={weeklyData || []} barCategoryGap="24%">
                    <defs>
                      <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--clinic-teal-light))" stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/20" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="url(#barGrad2)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Activity Feed — Compact Timeline */}
        <Card className="lg:col-span-3 min-w-0 overflow-hidden border-border/50 bg-card  transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/[0.05] flex items-center justify-center">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold" data-tour="dashboard-activity-feed">Activity</CardTitle>
                <CardDescription className="text-[11px]">Latest updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 pb-3 max-h-[340px] overflow-y-auto scroll-momentum">
            {recentActivities.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {recentActivities.map((activity) => {
                  const Icon = activityIcons[activity.event_type] || Activity;
                  const colorClass = activityColors[activity.event_type] || "bg-muted text-muted-foreground";
                  return (
                    <div key={activity.id} className="timeline-item flex gap-3 pb-3.5">
                      <div className={cn("h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ring-2 ring-card", colorClass)}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium leading-snug">{activity.description}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {format(new Date(activity.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
