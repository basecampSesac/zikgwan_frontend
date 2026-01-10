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
      image: "/fans.webp",
    },
    {
      id: 2,
      title: "🔥 포스트시즌 모임 폭주!",
      desc: "지금 바로 모임을 만들고 친구들과 응원하세요!",
      image: "/view.webp",
    },
    {
      id: 3,
      title: "📅 10월 직관 일정 공개!",
      desc: "가을야구 일정 확인하고 티켓 미리 예매하세요",
      image: "/ball.webp",
    },
  ];

  return (
    <div className="w-full mt-10 mb-4">
      <div className="relative w-full max-w-[1104px] mx-auto px-4 sm:px-6 lg:px-0">
        <Swiper
          modules={[Navigation, Autoplay]}
          loop
          speed={900}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          navigation={{ nextEl: ".banner-next", prevEl: ".banner-prev" }}
          breakpoints={{
            0: { slidesPerView: 1, spaceBetween: 12 },
            640: { slidesPerView: 1.15, spaceBetween: 16 },
            768: { slidesPerView: 1.4, spaceBetween: 20 },
            1024: { slidesPerView: 2, spaceBetween: 24 },
          }}
          className="overflow-visible select-none"
        >
          {banners.map((b, idx) => (
            <SwiperSlide key={b.id}>
              <div className="relative overflow-hidden rounded-2xl shadow-lg h-[220px] sm:h-[260px] lg:h-[360px]">
                <img
                  src={b.image}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={idx === 0 ? "eager" : "lazy"}
                  fetchPriority={idx === 0 ? "high" : "auto"}
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/58" />
                <div className="relative z-10 flex flex-col justify-center h-full px-5 sm:px-7 lg:px-8 text-white">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold mb-2 drop-shadow-md">
                    {b.title}
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg opacity-90">
                    {b.desc}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="hidden lg:flex absolute inset-0 justify-between items-center -left-10 -right-10 pointer-events-none">
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
    </div>
  );
}
