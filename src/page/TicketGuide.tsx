import {
  FiUserPlus,
  FiUpload,
  FiMessageCircle,
  FiCheckCircle,
} from "react-icons/fi";

export default function TicketGuidePage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-700">티켓 거래 안내</h1>
        <p className="text-gray-500 mb-10">
          티켓 거래가 처음이신가요? 아래 절차에 따라{" "}
          <span className="font-semibold">안전하고 간단하게</span> 거래를
          진행해보세요.
        </p>

        {/* 판매자 절차 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">판매자</h2>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm flex gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6F00B6] text-white font-bold">
                1
              </span>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <FiUserPlus className="text-[#6F00B6]" /> 회원가입
                </h3>
                <p className="mt-2 text-gray-700 text-lg leading-relaxed">
                  서비스 이용을 위해 먼저{" "}
                  <span className="font-bold">회원가입 및 로그인</span>을
                  진행합니다.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm flex gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6F00B6] text-white font-bold">
                2
              </span>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <FiUpload className="text-[#6F00B6]" /> 티켓 등록
                </h3>
                <p className="mt-2 text-gray-700 text-lg leading-relaxed">
                  판매자는{" "}
                  <span className="font-bold">경기 일정, 구장, 좌석, 가격</span>{" "}
                  정보를 입력해 티켓을 등록합니다. 등록된 티켓은 즉시 목록에
                  노출됩니다.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm flex gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6F00B6] text-white font-bold">
                3
              </span>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <FiMessageCircle className="text-[#6F00B6]" /> 채팅 응대
                </h3>
                <p className="mt-2 text-gray-700 text-lg leading-relaxed">
                  구매자가 관심을 가지면{" "}
                  <span className="text-[#6F00B6] font-semibold">
                    채팅 요청
                  </span>
                  이 들어옵니다. 판매자는 채팅으로 거래 조건(가격, 시간, 전달
                  방식 등)을 협의합니다.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm flex gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6F00B6] text-white font-bold">
                4
              </span>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <FiCheckCircle className="text-[#6F00B6]" /> 거래 완료
                </h3>
                <p className="mt-2 text-gray-700 text-lg leading-relaxed">
                  약속한 방식으로 <span className="font-bold">티켓 전달</span>을
                  완료하면 거래가 종료됩니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 구매자 절차 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">구매자</h2>
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm flex gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6F00B6] text-white font-bold">
                1
              </span>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <FiUserPlus className="text-[#6F00B6]" /> 회원가입
                </h3>
                <p className="mt-2 text-gray-700 text-lg leading-relaxed">
                  구매자도 마찬가지로{" "}
                  <span className="font-bold">회원가입 후 로그인</span>이
                  필요합니다.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm flex gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6F00B6] text-white font-bold">
                2
              </span>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <FiUpload className="text-[#6F00B6]" /> 티켓 선택
                </h3>
                <p className="mt-2 text-gray-700 text-lg leading-relaxed">
                  목록에서 원하는 티켓을 고르고{" "}
                  <span className="text-[#6F00B6] font-semibold">
                    상세 페이지
                  </span>
                  에서 정보를 확인합니다.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm flex gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6F00B6] text-white font-bold">
                3
              </span>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <FiMessageCircle className="text-[#6F00B6]" /> 채팅 참여
                </h3>
                <p className="mt-2 text-gray-700 text-lg leading-relaxed">
                  마음에 드는 티켓이 있으면{" "}
                  <span className="text-[#6F00B6] font-semibold">
                    "채팅 시작하기"
                  </span>{" "}
                  버튼을 눌러 판매자와 직접 대화하며 거래 조건을 맞춥니다.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 bg-gray-50 rounded-lg shadow-sm flex gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#6F00B6] text-white font-bold">
                4
              </span>
              <div>
                <h3 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
                  <FiCheckCircle className="text-[#6F00B6]" /> 거래 완료
                </h3>
                <p className="mt-2 text-gray-700 text-lg leading-relaxed">
                  판매자가 전달한 방식에 따라 티켓을 받으면 거래가 끝납니다.{" "}
                  <span className="font-semibold">안전한 직거래</span>를
                  권장하며, 거래 후{" "}
                  <span className="font-semibold text-[#6F00B6]">
                    매너 평가
                  </span>
                  를 꼭 남겨주세요.
                </p>
                {/* 강조 박스 */}
                <div className="mt-3 p-3 bg-purple-100 text-purple-800 text-sm rounded">
                  🙌 거래 후에는 꼭 매너 평가를 남겨 서로 신뢰를 쌓아가세요!
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
