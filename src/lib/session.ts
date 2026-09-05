import { useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, ApiError } from "@/lib/api";
import type { MeResponse, OkResponse } from "@/lib/types";

export const meKey = ["auth", "me"] as const;

export function useSession() {
  const query = useQuery<MeResponse | null>({
    queryKey: meKey,
    retry: false,
    queryFn: async () => {
      try {
        return await apiGet<MeResponse>("/auth/me");
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
  });
  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}

export function beginSession(qc: QueryClient) {
  return qc.invalidateQueries();
}

export async function endSession(qc: QueryClient) {
  try {
    await apiPost<OkResponse>("/auth/logout");
  } finally {
    qc.clear();
    await qc.invalidateQueries();
  }
}

export function useQueryClientSafe() {
  return useQueryClient();
}

export const ROLE_LABEL: Record<string, string> = {
  admin: "Club Admin",
  coach: "Coach",
  guardian: "Guardian",
  player: "Player",
};
