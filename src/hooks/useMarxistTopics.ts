import { useCallback, useEffect, useState } from "react";
import axiosInstance from "@/services/constant/axiosInstance";
import { GET_AVAILABLE_MARXIST_PHILOSOPHY_TOPICS_ENDPOINT } from "@/services/constant/apiConfig";
import {
  IMarxistPhilosophyAvailableTopicsResponse,
  IMarxistPhilosophyTopicGroup,
  IMarxistPhilosophyTopicOption,
} from "@/interfaces/IMarxist";
import { handleApiError } from "@/utils/errorHandler";

interface UseMarxistTopicsResult {
  topics: IMarxistPhilosophyTopicOption[];
  groupedTopics: Record<string, IMarxistPhilosophyTopicGroup>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMarxistTopics = (): UseMarxistTopicsResult => {
  const [topics, setTopics] = useState<IMarxistPhilosophyTopicOption[]>([]);
  const [groupedTopics, setGroupedTopics] = useState<
    Record<string, IMarxistPhilosophyTopicGroup>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTopics = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get<
        IMarxistPhilosophyAvailableTopicsResponse
      >(GET_AVAILABLE_MARXIST_PHILOSOPHY_TOPICS_ENDPOINT, {
        signal,
      });

      if (response.data.success) {
        setTopics(response.data.data.topics || []);
        setGroupedTopics(response.data.data.groupedTopics || {});
      }
    } catch (err) {
      if (signal?.aborted) {
        return;
      }
      setError(handleApiError(err));
      setTopics([]);
      setGroupedTopics({});
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTopics(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchTopics]);

  const refetch = useCallback(async () => {
    await fetchTopics();
  }, [fetchTopics]);

  return { topics, groupedTopics, loading, error, refetch };
};

export default useMarxistTopics;
