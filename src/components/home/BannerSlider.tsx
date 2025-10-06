import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";

export default function BannerSlider() {
  const banners = [
    {
      id: 1,
      title: "🎟️ 2매 구매 시 30% 할인",
      desc: "티켓 양도 시 자동 쿠폰 발급 이벤트 진행 중",
      image: "/fans.jpg",
    },
    {
      id: 2,
      title: "🔥 포스트시즌 모임 폭주!",
      desc: "지금 바로 모임을 만들고 친구들과 응원하세요!",
      image: "/view.jpg",
    },
    {
      id: 3,
      title: "📅 10월 직관 일정 공개!",
      desc: "가을야구 일정 확인하고 티켓 미리 예매하세요 ⚾",
      image: "/ball.jpg",
    },
  ];

  return (
    <div className="relative w-full max-w-[1104px] mx-auto mt-10 mb-4">
      <Swiper
        modules={[Navigation, Autoplay]}
        slidesPerView={2.0} // 한 번에 1.2개 보이게 (양 옆 살짝 노출)
        spaceBetween={24}
        centeredSlides={false} // ✨ 중심 고정 해제 → 번쩍임 사라짐
        loop={true}
        speed={900} // 전환 속도 (자연스럽게)
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        navigation={{
          nextEl: ".banner-next",
          prevEl: ".banner-prev",
        }}
        className="overflow-visible select-none"
      >
        {banners.map((b) => (
          <SwiperSlide key={b.id}>
            <div className="relative h-[360px] rounded-2xl overflow-hidden shadow-lg">
              <img
                src={b.image}
                alt={b.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/45" />
              <div className="relative z-10 flex flex-col justify-center h-full px-8 text-white">
                <h2 className="text-3xl font-extrabold mb-2 drop-shadow-md">
                  {b.title}
                </h2>
                <p className="text-lg opacity-90">{b.desc}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 좌우 버튼 */}
      <div className="absolute inset-0 flex justify-between items-center -left-10 -right-10 pointer-events-none">
        <button
          className="banner-prev pointer-events-auto w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:scale-105 hover:bg-white transition"
          aria-label="Previous"
        >
          <ChevronLeft className="text-gray-700" size={20} />
        </button>
        <button
          className="banner-next pointer-events-auto w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:scale-105 hover:bg-white transition"
          aria-label="Next"
        >
          <ChevronRight className="text-gray-700" size={20} />
        </button>
      </div>
    </div>
  );
}
