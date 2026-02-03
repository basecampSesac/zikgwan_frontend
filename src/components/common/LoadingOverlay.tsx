import { useLoadingStore } from "../../store/loadingStore";

export default function LoadingOverlay() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gray-100/50 flex items-center justify-center z-[12000]">
      <div className="w-10 h-10 border-[3px] border-gray-200 border-t-[#6F00B6] rounded-full animate-spin" />
    </div>
  );
}
