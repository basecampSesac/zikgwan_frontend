import { useState, useCallback } from "react";

export interface TicketFormData {
  title: string;
  description: string;
  price: string;
  ticketCount: string;
  home: string;
  away: string;
  stadium: string;
  adjacentSeat: boolean;
}

export interface TicketFormProps {
  mode?: "create" | "edit";
  initialValues?: Partial<{
    tsId: number;
    title: string;
    description: string;
    price: number;
    ticketCount: number;
    home: string;
    away: string;
    stadium: string;
    adjacentSeat: string;
    gameDay: string;
    imageUrl: string;
  }>;
  onClose?: () => void;
  onSuccess?: () => void;
}

export interface UseTicketFormReturn {
  form: TicketFormData;
  gameDay: Date | null;
  image: File | null;
  existingImageUrl: string | null;
  isSubmitting: boolean;
  inputKey: number;
  setForm: (form: TicketFormData | ((prev: TicketFormData) => TicketFormData)) => void;
  setGameDay: (date: Date | null) => void;
  setImage: (file: File | null) => void;
  setExistingImageUrl: (url: string | null) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setInputKey: (key: number) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleCheckbox: () => void;
  handleFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetForm: () => void;
}

/**
 * 티켓 폼 상태 관리를 위한 커스텀 훅
 */
export function useTicketForm(initialValues?: TicketFormProps['initialValues']): UseTicketFormReturn {
  const [form, setForm] = useState<TicketFormData>({
    title: initialValues?.title || "",
    description: initialValues?.description || "",
    price: initialValues?.price?.toString() || "",
    ticketCount: initialValues?.ticketCount?.toString() || "",
    home: initialValues?.home || "",
    away: initialValues?.away || "",
    stadium: initialValues?.stadium || "",
    adjacentSeat: initialValues?.adjacentSeat === "Y",
  });

  const [gameDay, setGameDay] = useState<Date | null>(
    initialValues?.gameDay ? new Date(initialValues.gameDay) : null
  );

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(() => {
    if (!initialValues?.imageUrl) return null;
    if (initialValues.imageUrl.includes("/stadiums/")) return null;
    return initialValues.imageUrl.startsWith("http")
      ? initialValues.imageUrl
      : `${API_URL}/images/${initialValues.imageUrl.replace(/^\/+/, "")}`;
  });

  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputKey, setInputKey] = useState<number>(Date.now());

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCheckbox = useCallback(() => {
    setForm(prev => ({ ...prev, adjacentSeat: !prev.adjacentSeat }));
  }, []);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
      setExistingImageUrl(null);
    }
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      price: initialValues?.price?.toString() || "",
      ticketCount: initialValues?.ticketCount?.toString() || "",
      home: initialValues?.home || "",
      away: initialValues?.away || "",
      stadium: initialValues?.stadium || "",
      adjacentSeat: initialValues?.adjacentSeat === "Y",
    });
    setGameDay(initialValues?.gameDay ? new Date(initialValues.gameDay) : null);
    setImage(null);
    setExistingImageUrl(null);
    setIsSubmitting(false);
    setInputKey(Date.now());
  }, [initialValues]);

  return {
    form,
    gameDay,
    image,
    existingImageUrl,
    isSubmitting,
    inputKey,
    setForm,
    setGameDay,
    setImage,
    setExistingImageUrl,
    setIsSubmitting,
    setInputKey,
    handleChange,
    handleCheckbox,
    handleFile,
    resetForm,
  };
}