import { useQuery } from "@tanstack/react-query";
import AppShell from "@/components/AppShell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiGet } from "@/lib/api";
import type { Standing } from "@/lib/types";

export default function Standings() {
  const { data, isError } = useQuery<Standing[]>({
    queryKey: ["standings"],
    queryFn: () => apiGet<Standing[]>("/standings"),
  });

  const rows = isError ? [] : (data ?? []);
  const leagues = Array.from(new Set(rows.map((r) => r.league_name)));

  return (
    <AppShell>
      <h1 className="font-heading text-3xl font-black uppercase tracking-tighter">
        League standings
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Maintained by the club admin — most amateur leagues publish no API.
      </p>

      {leagues.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground" data-testid="standings-empty">
          Standings will appear here once the admin publishes them.
        </p>
      ) : (
        leagues.map((league) => (
          <section key={league} className="mt-8" data-testid={`standings-league-${league}`}>
            <h2 className="font-heading text-lg font-bold tracking-tight">{league}</h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>P</TableHead>
                    <TableHead>W</TableHead>
                    <TableHead>D</TableHead>
                    <TableHead>L</TableHead>
                    <TableHead>Pts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows
                    .filter((r) => r.league_name === league)
                    .map((r) => (
                      <TableRow key={r.id} data-testid={`standing-row-${r.id}`}>
                        <TableCell className="text-sm">
                          <span className="flex items-center gap-2">
                            {r.logo_url ? (
                              <img
                                src={r.logo_url}
                                alt=""
                                loading="lazy"
                                className="size-6 shrink-0 rounded-full border border-border object-cover"
                              />
                            ) : null}
                            <span className={r.team_name.includes("Ooty") ? "font-semibold text-gold" : ""}>
                              {r.team_name}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{r.played}</TableCell>
                        <TableCell className="font-mono text-sm">{r.wins}</TableCell>
                        <TableCell className="font-mono text-sm">{r.draws}</TableCell>
                        <TableCell className="font-mono text-sm">{r.losses}</TableCell>
                        <TableCell className="font-mono text-sm font-bold">{r.points}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </section>
        ))
      )}
    </AppShell>
  );
}
