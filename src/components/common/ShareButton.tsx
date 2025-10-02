import { FiShare2 } from "react-icons/fi";

export default function ShareButton() {
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "직관 티켓",
          text: "이 티켓을 확인해보세요!",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("링크가 복사되었습니다!");
      }
    } catch (err) {
      console.error("공유 실패", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 text-base rounded-lg border border-[#6F00B6] text-[#6F00B6] font-semibold hover:bg-purple-50 transition"
    >
      <FiShare2 size={18} /> 공유
    </button>
  );
}
