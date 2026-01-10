import BannerSection from "../components/home/BannerSlider";
import TicketSection from "../components/home/TicketSection";
import GroupSection from "../components/home/GroupSection";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center bg-white min-h-screen">
      {/* 슬라이드 배너 */}
      <BannerSection />

      {/* 티켓 미리보기 섹션 */}
      <section className="w-full max-w-4xl sm:max-w-5xl md:max-w-6xl px-4 sm:px-6 mt-8 sm:mt-12">
        <TicketSection />
      </section>

      {/* 모임 미리보기 섹션 */}
      <section className="w-full max-w-4xl sm:max-w-5xl md:max-w-6xl px-4 sm:px-6 mt-8 sm:mt-12 mb-16 sm:mb-20">
        <GroupSection />
      </section>
    </main>
  );
}
