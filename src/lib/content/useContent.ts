import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { defaultContent } from "./default-data";
import { loadContent, saveContent, type ContentState } from "./store";
import type { SiteContent } from "./schema";

export const contentQueryKey = ["site-content"] as const;

export const contentQueryOptions = {
  queryKey: contentQueryKey,
  queryFn: loadContent,
  staleTime: 60_000,
  placeholderData: { content: defaultContent, source: "default" } as ContentState,
};

/** Read website content. Always returns something renderable. */
export function useContent() {
  const query = useQuery(contentQueryOptions);
  const state = query.data ?? ({ content: defaultContent, source: "default" } as ContentState);
  return {
    content: state.content,
    source: state.source,
    contentError: state.error,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

/** Dashboard mutation: validate, back up, write, then refresh caches. */
export function useSaveContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { next: SiteContent; expectedUpdatedAt?: string }) =>
      saveContent(input.next, input.expectedUpdatedAt),
    onSuccess: (saved) => {
      queryClient.setQueryData(contentQueryKey, { content: saved, source: "remote" } as ContentState);
    },
  });
}
