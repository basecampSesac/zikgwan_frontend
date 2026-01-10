import { BiShareAlt } from "react-icons/bi";

interface ShareButtonProps {
  url?: string;
}

export default function ShareButton({ url }: ShareButtonProps) {
const handleShare = async () => {
    const shareUrl = url || window.location.href;
    try {
      if (navigator.share) {
await navigator.share({
          title: "직관 티켓",
          text: "이 티켓을 확인해보세요!",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
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
