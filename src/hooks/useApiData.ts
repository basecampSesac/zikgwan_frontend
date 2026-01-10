import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../lib/axiosInstance";
import { useToastStore } from "../store/toastStore";
import { logger } from "../utils/logger";

export interface UseApiDataOptions<T> {
  immediate?: boolean;
  errorMessage?: string;
  transform?: (data: unknown) => T;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
}

export interface UseApiDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: unknown | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

/**
 * 범용 API 데이터 페칭 커스텀 훅
 * - 로딩 상태 관리
 * - 에러 핸들링
 * - 자동 리패치 기능
 * - 데이터 변환 기능
 */
export function useApiData<T>(
  url: string,
  options: UseApiDataOptions<T> = {}
): UseApiDataReturn<T> {
  const {
    immediate = true,
    errorMessage = "데이터를 불러오지 못했습니다.",
    transform,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const { addToast } = useToastStore();

  const fetchData = useCallback(async () => {
    if (!url) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(url);
      
      if (response.data.status === "success" && response.data.data) {
        const transformedData = transform ? transform(response.data.data) : response.data.data;
        setData(transformedData);
        onSuccess?.(transformedData);
      } else {
        const error = new Error(response.data.message || errorMessage);
        setError(error);
        addToast(errorMessage, "error");
        onError?.(error);
      }
    } catch (err) {
      setError(err);
      addToast(errorMessage, "error");
      logger.error("API 데이터 페칭 실패", err, { url, errorMessage });
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [url, transform, onSuccess, onError, errorMessage, addToast]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (immediate && url) {
      fetchData();
    }
  }, [immediate, url, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
  };
}