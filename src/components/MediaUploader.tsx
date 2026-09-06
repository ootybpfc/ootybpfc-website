import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiPost } from "@/lib/api";
import type { CloudinaryConfig, CloudinarySignature, MediaCreatePayload, MediaPost } from "@/lib/types";

async function uploadToCloudinary(file: File, sig: CloudinarySignature): Promise<{ secure_url: string; public_id: string; resource_type: string }> {
  const form = new FormData();
  form.append("file", file); form.append("api_key", sig.api_key); form.append("timestamp", String(sig.timestamp)); form.append("signature", sig.signature); form.append("folder", sig.folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/${sig.resource_type}/upload`, { method: "POST", body: form });
  if (!res.ok) { const body = await res.json().catch(() => null) as { error?: { message?: string } } | null; throw new Error(body?.error?.message ?? "Cloudinary rejected the upload"); }
  return await res.json() as { secure_url: string; public_id: string; resource_type: string };
}

export default function MediaUploader({ playerId }: { playerId: string }) {
  const qc = useQueryClient(); const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState(""); const [pastedUrl, setPastedUrl] = useState(""); const [busy, setBusy] = useState(false);
  const config = useQuery<CloudinaryConfig>({ queryKey: ["cloudinary", "config"], queryFn: () => apiGet<CloudinaryConfig>("/cloudinary/config") });
  const record = useMutation({ mutationFn: (payload: MediaCreatePayload) => apiPost<MediaPost>("/media", payload), onSuccess: () => { qc.invalidateQueries({ queryKey: ["media"] }); setCaption(""); setPastedUrl(""); if (fileRef.current) fileRef.current.value = ""; toast.success("Submitted for approval"); }, onError: () => toast.error("Could not save that media post") });
  async function handleFile(file: File) { if (!caption.trim()) { toast.error("Add a caption first"); return; } setBusy(true); try { const isVideo = file.type.startsWith("video/"); const sig = await apiGet<CloudinarySignature>(`/cloudinary/signature?player_id=${playerId}&resource_type=${isVideo ? "video" : "image"}`); const uploaded = await uploadToCloudinary(file, sig); record.mutate({ player_id: playerId, caption: caption.trim(), url: uploaded.secure_url, kind: isVideo ? "video" : "photo", public_id: uploaded.public_id, resource_type: uploaded.resource_type }); } catch (err) { toast.error(err instanceof Error ? err.message : "Upload failed"); } finally { setBusy(false); } }
  const ready = config.data?.configured === true;
  return (<Card className="mt-6 border-border" data-testid="media-uploader"><CardContent className="space-y-4 p-5"><p className="font-heading text-sm font-semibold">Submit media for approval</p><div className="space-y-2"><Label htmlFor="media-caption">Caption</Label><Input id="media-caption" className="h-12" placeholder="Hat-trick against Etobicoke Rangers" value={caption} onChange={(e) => setCaption(e.target.value)} data-testid="media-caption-input" /></div>{ready ? (<><input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void handleFile(file); }} data-testid="media-file-input" /><Button className="h-12 w-full bg-crimson text-white hover:bg-crimson-bright" disabled={busy || record.isPending} onClick={() => fileRef.current?.click()} data-testid="media-upload-button">{busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <CloudUpload className="mr-2 size-4" />}{busy ? "Uploading…" : "Choose a photo or video"}</Button></>) : (<><div className="space-y-2"><Label htmlFor="media-url">Media URL</Label><div className="relative"><Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="media-url" className="h-12 pl-10" placeholder="https://…" value={pastedUrl} onChange={(e) => setPastedUrl(e.target.value)} data-testid="media-url-input" /></div></div><Button className="h-12 w-full bg-crimson text-white hover:bg-crimson-bright" disabled={!caption.trim() || !pastedUrl.trim() || record.isPending} onClick={() => record.mutate({ player_id: playerId, caption: caption.trim(), url: pastedUrl.trim(), kind: /\.(mp4|mov|webm)$/i.test(pastedUrl) ? "video" : "photo" })} data-testid="media-url-submit-button">Submit link for approval</Button></>)}</CardContent></Card>);
}
