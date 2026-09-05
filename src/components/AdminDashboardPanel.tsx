import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CircleDollarSign, Clock, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiGet } from "@/lib/api";
import type { AdminDashboard as Dashboard } from "@/lib/types";

const BARS = ["#CE2027", "#2F55C8", "#E5B94C", "#1BA25C", "#8B5CF6"];

function money(value: number, currency: string) {
  return `${currency.toUpperCase()} $${value.toFixed(2)}`;
}

function monthLabel(key: string) {
  const [y, m] = key.split("-");
  if (!y || !m) return key;
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-CA", {
    month: "short",
    year: "2-digit",
  });
}

export default function AdminDashboardPanel() {
  const { data, isLoading } = useQuery<Dashboard>({
    queryKey: ["admin", "dashboard"],
    queryFn: () => apiGet<Dashboard>("/admin/dashboard"),
  });

  if (isLoading || !data) {
    return (
      <p className="py-10 text-sm text-muted-foreground" data-testid="dashboard-loading">
        Loading dashboard\u2026
      </p>
    );
  }

  const cur = data.primary_currency;
  const trend = data.revenue_trend.map((p) => ({ ...p, label: monthLabel(p.month) }));
  const byProgram = data.revenue_by_program.map((p) => ({ ...p, label: p.month }));

  return (
    <div data-testid="admin-dashboard">
      {/* ------------------------------------------------------------- KPIs */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={<CircleDollarSign className="size-4" />}
          label="Collected to date"
          value={money(data.collected_total, cur)}
          testid="dashboard-collected"
        />
        <Kpi
          icon={<Clock className="size-4" />}
          label="Outstanding"
          value={money(data.outstanding_total, cur)}
          testid="dashboard-outstanding"
        />
        <Kpi
          icon={<TrendingUp className="size-4" />}
          label="Paid transactions"
          value={String(data.paid_count)}
          testid="dashboard-paid-count"
        />
        <Kpi
          icon={<Users className="size-4" />}
          label="Awaiting payment"
          value={String(data.pending_count)}
          testid="dashboard-pending-count"
        />
      </div>

      {Object.keys(data.currency_totals).length > 1 ? (
        <Card className="mt-3 border-border" data-testid="dashboard-currency-split">
          <CardContent className="flex flex-wrap gap-8 p-5">
            {Object.entries(data.currency_totals).map(([code, amount]) => (
              <div key={code}>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Collected ({code})
                </p>
                <p
                  className="font-mono text-xl font-bold text-crimson-bright"
                  data-testid={`dashboard-currency-${code}`}
                >
                  ${amount.toFixed(2)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {/* ----------------------------------------------------------- charts */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="border-border">
          <CardContent className="p-5">
            <p className="font-heading text-sm font-semibold">Revenue trend by month</p>
            {trend.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground" data-testid="dashboard-trend-empty">
                No payments have cleared yet \u2014 the trend appears here after the first one.
              </p>
            ) : (
              <div className="mt-4 h-56" data-testid="dashboard-trend-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#939DBC", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#939DBC", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={46}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#12204F",
                        border: "1px solid #1E2745",
                        borderRadius: 10,
                        color: "#EEF1F8",
                        fontSize: 12,
                      }}
                      formatter={(v) => [money(Number(v ?? 0), cur), "Collected"]}
                    />
                    <Bar dataKey="total" fill="#CE2027" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5">
            <p className="font-heading text-sm font-semibold">Revenue by program</p>
            {byProgram.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground" data-testid="dashboard-program-empty">
                Program revenue appears once academy signups are paid.
              </p>
            ) : (
              <div className="mt-4 h-56" data-testid="dashboard-program-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byProgram} layout="vertical">
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: "#939DBC", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={{ fill: "#939DBC", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#12204F",
                        border: "1px solid #1E2745",
                        borderRadius: 10,
                        color: "#EEF1F8",
                        fontSize: 12,
                      }}
                      formatter={(v) => [money(Number(v ?? 0), cur), "Collected"]}
                    />
                    <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                      {byProgram.map((_, i) => (
                        <Cell key={i} fill={BARS[i % BARS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --------------------------------------------------- player payments */}
      <p className="mt-8 font-heading text-lg font-bold tracking-tight">Players & payments</p>
      <div
        className="mt-3 overflow-x-auto rounded-xl border border-border"
        data-testid="dashboard-players-table"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Classes</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead>Registration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-sm text-muted-foreground" data-testid="dashboard-players-empty">
                  No players registered yet.
                </TableCell>
              </TableRow>
            ) : (
              data.players.map((p) => (
                <TableRow key={p.player_id} data-testid={`dashboard-player-${p.player_id}`}>
                  <TableCell className="text-sm font-medium">{p.player_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.guardian_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.org_name}</TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {p.classes}
                    {p.enrollments > 0 ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({p.enrollments} prog)
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-pitch">
                    ${p.total_paid.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {p.outstanding > 0 ? (
                      <span className="text-crimson-bright">${p.outstanding.toFixed(2)}</span>
                    ) : (
                      <span className="text-muted-foreground">\u2014</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        p.registration_paid
                          ? "bg-pitch text-white"
                          : "bg-secondary text-secondary-foreground"
                      }
                    >
                      {p.registration_paid ? "Paid" : "Due"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  testid,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  testid: string;
}) {
  return (
    <Card className="border-border">
      <CardContent className="p-5">
        <div className="text-crimson-bright">{icon}</div>
        <p className="mt-3 font-mono text-xl font-bold sm:text-2xl" data-testid={testid}>
          {value}
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
