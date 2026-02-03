import { useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../lib/axiosInstance";
import { useLoadingStore } from "../store/loadingStore";
import type { AxiosRequestConfig } from "axios";

const LOADING_DELAY = 300;
const pendingRequests = new Map<string, AbortController>();

export function useApi() {
  const location = useLocation();
  const { show, hide, clear } = useLoadingStore.getState();
  const activeKeys = useRef<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // 페이지 이동 시 모든 요청 취소
  useEffect(() => {
    return () => {
      activeKeys.current.forEach((key) => {
        const controller = pendingRequests.get(key);
        if (controller) {
          controller.abort();
          pendingRequests.delete(key);
        }
        const timer = timers.current.get(key);
        if (timer) clearTimeout(timer);
      });
      activeKeys.current.clear();
      timers.current.clear();
      clear();
    };
  }, [location.pathname]);

  const request = useCallback(
    async <T>(
      config: AxiosRequestConfig & { key?: string }
    ): Promise<T> => {
      const key = config.key || `${config.method || "get"}-${config.url}`;

      // 중복 호출 방지
      if (pendingRequests.has(key)) {
        const existing = pendingRequests.get(key);
        existing?.abort();
        pendingRequests.delete(key);
        hide(key);
        const timer = timers.current.get(key);
        if (timer) {
          clearTimeout(timer);
          timers.current.delete(key);
        }
      }

      const controller = new AbortController();
      pendingRequests.set(key, controller);
      activeKeys.current.add(key);

      // 300ms 후 로딩 표시
      const timer = setTimeout(() => {
        if (pendingRequests.has(key)) {
          show(key);
        }
      }, LOADING_DELAY);
      timers.current.set(key, timer);

      try {
        const response = await axiosInstance({
          ...config,
          signal: controller.signal,
        });
        return response.data as T;
      } finally {
        clearTimeout(timer);
        timers.current.delete(key);
        pendingRequests.delete(key);
        activeKeys.current.delete(key);
        hide(key);
      }
    },
    []
  );

  const get = useCallback(
    <T>(url: string, config?: AxiosRequestConfig & { key?: string }) =>
      request<T>({ ...config, method: "get", url }),
    [request]
  );

  const post = useCallback(
    <T>(url: string, data?: unknown, config?: AxiosRequestConfig & { key?: string }) =>
      request<T>({ ...config, method: "post", url, data }),
    [request]
  );

  const put = useCallback(
    <T>(url: string, data?: unknown, config?: AxiosRequestConfig & { key?: string }) =>
      request<T>({ ...config, method: "put", url, data }),
    [request]
  );

  const patch = useCallback(
    <T>(url: string, data?: unknown, config?: AxiosRequestConfig & { key?: string }) =>
      request<T>({ ...config, method: "patch", url, data }),
    [request]
  );

  const del = useCallback(
    <T>(url: string, config?: AxiosRequestConfig & { key?: string }) =>
      request<T>({ ...config, method: "delete", url }),
    [request]
  );

  // 특정 요청 취소
  const cancel = useCallback((key: string) => {
    const controller = pendingRequests.get(key);
    if (controller) {
      controller.abort();
      pendingRequests.delete(key);
    }
    const timer = timers.current.get(key);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(key);
    }
    activeKeys.current.delete(key);
    hide(key);
  }, []);

  return { request, get, post, put, patch, del, cancel };
}
