import { BiShareAlt } from "react-icons/bi";

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
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#6F00B6] transition"
    >
      <BiShareAlt size={16} />
      공유
    </button>
  );
}
