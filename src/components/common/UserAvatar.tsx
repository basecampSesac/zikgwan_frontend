import DefaultProfile from "/profileimage.png";

interface UserAvatarProps {
  imageUrl?: string | null;
  nickname?: string | null;
  size?: number; // 기본 36px, 필요시 조절 가능
  className?: string;
}

/**
 * UserAvatar 컴포넌트
 * - 프로필 이미지가 있으면 그대로 표시
 * - 없으면 public/profileimage.png 표시
 * - 그것마저 에러 시 닉네임 첫 글자 fallback
 */
export default function UserAvatar({
  imageUrl,
  nickname,
  size = 36,
  className = "",
}: UserAvatarProps) {
  const fallbackLetter = nickname?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div
      className={`flex items-center justify-center rounded-full overflow-hidden border border-gray-200 bg-gray-100 ${className}`}
      style={{ width: size, height: size }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`${nickname ?? "유저"} 프로필`}
          onError={(e) => {
            e.currentTarget.src = DefaultProfile; // 기본 이미지로 교체
          }}
          className="w-full h-full object-cover"
        />
      ) : (
        <img
          src={DefaultProfile}
          alt="기본 프로필"
          className="w-full h-full object-cover"
          onError={(e) => {
            // 기본 이미지 로드 실패 시 텍스트 fallback으로 교체
            const el = e.currentTarget;
            const parent = el.parentElement;
            if (parent) {
              parent.innerHTML = `<div class='flex items-center justify-center w-full h-full bg-gradient-to-tr from-[#7B3FE4] via-[#9D4EDD] to-[#B47AEA] text-white font-bold text-sm'>${fallbackLetter}</div>`;
            }
          }}
        />
      )}
    </div>
  );
}
