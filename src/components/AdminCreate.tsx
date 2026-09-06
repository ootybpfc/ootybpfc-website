import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, Handshake, UserCog, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type {
  AppUser,
  Coach,
  ClubEvent,
  Organization,
  Player,
  PriceOption,
  Sponsor,
} from "@/lib/types";

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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export default function AdminCreate() {
  const qc = useQueryClient();
  const [open, setOpen] = useState<string | null>(null);

  const orgs = useQuery<Organization[]>({
    queryKey: ["organizations"],
    queryFn: () => apiGet<Organization[]>("/organizations"),
  });