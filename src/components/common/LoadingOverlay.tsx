import { useLoadingStore } from "../../store/loadingStore";

export default function LoadingOverlay() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[12000] backdrop-blur-[2px]">
      <div className="w-12 h-12 border-[3px] border-white/30 border-t-[#6F00B6] rounded-full animate-spin shadow-lg" />
    </div>
  );
}
