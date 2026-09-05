import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from "@/lib/api";
import type { Fixture, NewsItem, OkResponse, Program, Standing } from "@/lib/types";

type FieldType = "text" | "number" | "textarea" | "date" | "url" | "lines" | "select";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  hint?: string;
}

type Row = Record<string, unknown> & { id: string };

function errText(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    const body = err.body as { detail?: unknown } | null;
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail)) {
      const first = body.detail[0] as { msg?: string } | undefined;
      if (first?.msg) return first.msg;
    }
  }
  return fallback;
}

/** One CRUD panel: list of rows, an add dialog and an edit dialog, all field-driven. */
function ContentSection<T extends Row>({
  title,
  resource,
  queryKey,
  fields,
  blank,
  primary,
  secondary,
  thumb,
  testid,
}: {
  title: string;
  resource: string;
  queryKey: string;
  fields: FieldDef[];
  blank: Record<string, unknown>;
  primary: (row: T) => string;
  secondary: (row: T) => string;
  thumb?: (row: T) => string;
  testid: string;
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const list = useQuery<T[]>({
    queryKey: [queryKey],
    queryFn: () => apiGet<T[]>(`/${resource}`),
  });

  function refresh(message: string) {
    qc.invalidateQueries({ queryKey: [queryKey] });
    qc.invalidateQueries({ queryKey: ["public", "summary"] });
    setEditing(null);
    setEditId(null);
    toast.success(message);
  }

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editId
        ? apiPatch<T>(`/${resource}/${editId}`, payload)
        : apiPost<T>(`/${resource}`, payload),
    onSuccess: () => refresh(editId ? `${title} updated` : `${title} added`),
    onError: (e) => toast.error(errText(e, `Could not save ${title.toLowerCase()}`)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => apiDelete<OkResponse>(`/${resource}/${id}`),
    onSuccess: () => refresh(`${title} removed`),
    onError: (e) => toast.error(errText(e, "Delete failed")),
  });

  function openAdd() {
    setEditId(null);
    setEditing({ ...blank });
  }

  function openEdit(row: T) {
    const draft: Record<string, unknown> = {};
    fields.forEach((f) => {
      draft[f.key] = f.type === "lines" ? (row[f.key] as string[] | undefined) ?? [] : row[f.key] ?? "";
    });
    setEditId(row.id);
    setEditing(draft);
  }

  function submit() {
    if (!editing) return;
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      const raw = editing[f.key];
      if (f.type === "number") payload[f.key] = Number(raw ?? 0);
      else if (f.type === "lines")
        payload[f.key] = Array.isArray(raw)
          ? raw
          : String(raw ?? "")
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean);
      else payload[f.key] = raw ?? "";
    });
    save.mutate(payload);
  }

  const rows = list.data ?? [];

  return (
    <div data-testid={`${testid}-section`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {list.isLoading ? "Loading\u2026" : `${rows.length} item${rows.length === 1 ? "" : "s"}`}
        </p>
        <Button
          className="h-11 bg-crimson text-white hover:bg-crimson-bright"
          onClick={openAdd}
          data-testid={`${testid}-add-button`}
        >
          <Plus className="mr-1.5 size-4" /> Add {title.toLowerCase()}
        </Button>
      </div>

      <div className="mt-4 space-y-3" data-testid={`${testid}-list`}>
        {!list.isLoading && rows.length === 0 ? (
          <p className="text-sm text-muted-foreground" data-testid={`${testid}-empty`}>
            Nothing here yet \u2014 use \"Add {title.toLowerCase()}\".
          </p>
        ) : (
          rows.map((row) => (
            <Card key={row.id} className="border-border" data-testid={`${testid}-row-${row.id}`}>
              <CardContent className="flex items-center gap-4 p-4">
                {thumb && thumb(row) ? (
                  <img
                    src={thumb(row)}
                    alt=""
                    loading="lazy"
                    className="size-12 shrink-0 rounded bg-white object-contain p-1"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-semibold">{primary(row)}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{secondary(row)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-11"
                    onClick={() => openEdit(row)}
                    aria-label={`Edit ${primary(row)}`}
                    data-testid={`${testid}-edit-${row.id}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-11"
                    onClick={() => remove.mutate(row.id)}
                    aria-label={`Delete ${primary(row)}`}
                    data-testid={`${testid}-delete-${row.id}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog
        open={editing !== null}
        onOpenChange={(v) => {
          if (!v) {
            setEditing(null);
            setEditId(null);
          }
        }}
      >
        <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase tracking-tight">
              {editId ? `Edit ${title.toLowerCase()}` : `Add ${title.toLowerCase()}`}
            </DialogTitle>
            <DialogDescription>
              Changes go live on the public club page as soon as you save.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(ev) => {
              ev.preventDefault();
              submit();
            }}
            data-testid={`${testid}-form`}
          >
            {fields.map((f) => {
              const value = editing?.[f.key];
              const testId = `${testid}-${f.key}-input`;
              return (
                <div key={f.key} className="space-y-2">
                  <Label htmlFor={testId}>{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea
                      id={testId}
                      value={String(value ?? "")}
                      placeholder={f.placeholder}
                      onChange={(ev) => setEditing({ ...editing, [f.key]: ev.target.value })}
                      data-testid={testId}
                    />
                  ) : f.type === "lines" ? (
                    <Textarea
                      id={testId}
                      value={Array.isArray(value) ? value.join("\n") : String(value ?? "")}
                      placeholder={f.placeholder}
                      onChange={(ev) =>
                        setEditing({ ...editing, [f.key]: ev.target.value.split("\n") })
                      }
                      data-testid={testId}
                    />
                  ) : f.type === "select" ? (
                    <Select
                      value={String(value ?? "")}
                      onValueChange={(v: string) => setEditing({ ...editing, [f.key]: v })}
                    >
                      <SelectTrigger className="h-12 w-full" id={testId} data-testid={testId}>
                        <SelectValue>{(v) => String(v ?? "Choose")}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {(f.options ?? []).map((o) => (
                          <SelectItem key={o} value={o} data-testid={`${testId}-option-${o}`}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={testId}
                      type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      inputMode={f.type === "number" ? "numeric" : f.type === "url" ? "url" : undefined}
                      min={f.type === "number" ? 0 : undefined}
                      className="h-12"
                      placeholder={f.placeholder}
                      value={String(value ?? "")}
                      onChange={(ev) => setEditing({ ...editing, [f.key]: ev.target.value })}
                      data-testid={testId}
                    />
                  )}
                  {f.hint ? <p className="text-xs text-muted-foreground">{f.hint}</p> : null}
                </div>
              );
            })}
            <Button
              type="submit"
              className="h-12 w-full bg-crimson text-white hover:bg-crimson-bright"
              disabled={save.isPending}
              data-testid={`${testid}-submit`}
            >
              {save.isPending ? "Saving\u2026" : editId ? "Save changes" : `Add ${title.toLowerCase()}`}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminContent() {
  return (
    <Tabs defaultValue="programs" data-testid="admin-content">
      <TabsList data-testid="content-tabs">
        <TabsTrigger value="programs" data-testid="content-tab-programs">
          Programs
        </TabsTrigger>
        <TabsTrigger value="fixtures" data-testid="content-tab-fixtures">
          Fixtures
        </TabsTrigger>
        <TabsTrigger value="news" data-testid="content-tab-news">
          News
        </TabsTrigger>
        <TabsTrigger value="standings" data-testid="content-tab-standings">
          League table
        </TabsTrigger>
      </TabsList>

      <TabsContent value="programs" className="mt-4">
        <ContentSection<Program & Row>
          title="Program"
          resource="programs"
          queryKey="programs"
          testid="program"
          thumb={(r) => r.image_url}
          primary={(r) => r.name}
          secondary={(r) => `${r.age_range} \u00b7 order ${r.sort_order}`}
          blank={{
            name: "",
            age_range: "",
            image_url: "",
            summary: "",
            highlights: [],
            sort_order: 0,
          }}
          fields={[
            { key: "name", label: "Program name", type: "text", placeholder: "Youth Development" },
            { key: "age_range", label: "Age range", type: "text", placeholder: "Age 5 \u2013 12" },
            { key: "image_url", label: "Image URL or path", type: "url", placeholder: "https://\u2026 or /partners/logo.png" },
            { key: "summary", label: "Summary", type: "textarea" },
            {
              key: "highlights",
              label: "Highlights",
              type: "lines",
              hint: "One bullet per line.",
            },
            { key: "sort_order", label: "Display order", type: "number" },
          ]}
        />
      </TabsContent>

      <TabsContent value="fixtures" className="mt-4">
        <ContentSection<Fixture & Row>
          title="Fixture"
          resource="fixtures"
          queryKey="fixtures"
          testid="fixture"
          thumb={(r) => r.home_logo}
          primary={(r) => `${r.home_team} vs ${r.away_team}`}
          secondary={(r) => `${r.league_name} \u00b7 ${r.venue} \u00b7 ${r.kickoff}`}
          blank={{
            league_name: "Toronto Premier League",
            home_team: "",
            home_logo: "",
            away_team: "",
            away_logo: "",
            venue: "",
            kickoff: "",
          }}
          fields={[
            { key: "league_name", label: "League", type: "text" },
            { key: "home_team", label: "Home team", type: "text" },
            { key: "home_logo", label: "Home logo URL or path", type: "url", placeholder: "https://\u2026 or /partners/logo.png" },
            { key: "away_team", label: "Away team", type: "text" },
            { key: "away_logo", label: "Away logo URL or path", type: "url", placeholder: "https://\u2026 or /partners/logo.png" },
            { key: "venue", label: "Venue", type: "text", placeholder: "Toronto" },
            { key: "kickoff", label: "Kickoff date", type: "date" },
          ]}
        />
      </TabsContent>

      <TabsContent value="news" className="mt-4">
        <ContentSection<NewsItem & Row>
          title="News item"
          resource="news"
          queryKey="news"
          testid="news"
          thumb={(r) => r.image_url}
          primary={(r) => r.title}
          secondary={(r) => `${r.category} \u00b7 ${r.published_on}`}
          blank={{
            title: "",
            category: "latest-news",
            image_url: "",
            excerpt: "",
            published_on: "",
          }}
          fields={[
            { key: "title", label: "Headline", type: "text" },
            { key: "category", label: "Category", type: "text", placeholder: "latest-news" },
            { key: "image_url", label: "Image URL or path", type: "url", placeholder: "https://\u2026 or /partners/logo.png" },
            { key: "excerpt", label: "Excerpt", type: "textarea" },
            { key: "published_on", label: "Published on", type: "date" },
          ]}
        />
      </TabsContent>

      <TabsContent value="standings" className="mt-4">
        <ContentSection<Standing & Row>
          title="Table row"
          resource="standings"
          queryKey="standings"
          testid="standing"
          thumb={(r) => r.logo_url}
          primary={(r) => r.team_name}
          secondary={(r) =>
            `${r.league_name} \u00b7 P${r.played} W${r.wins} D${r.draws} L${r.losses} \u00b7 ${r.points} pts`
          }
          blank={{
            league_name: "Toronto Premier League",
            country: "CA",
            team_name: "",
            logo_url: "",
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
          }}
          fields={[
            { key: "league_name", label: "League", type: "text" },
            { key: "team_name", label: "Team", type: "text" },
            { key: "logo_url", label: "Crest URL or path", type: "url", placeholder: "https://\u2026 or /crest.png" },
            { key: "country", label: "Country", type: "select", options: ["CA", "US"] },
            { key: "played", label: "Played", type: "number" },
            { key: "wins", label: "Wins", type: "number" },
            { key: "draws", label: "Draws", type: "number" },
            {
              key: "losses",
              label: "Losses",
              type: "number",
              hint: "Points are calculated automatically: 3 per win, 1 per draw.",
            },
          ]}
        />
      </TabsContent>
    </Tabs>
  );
}
