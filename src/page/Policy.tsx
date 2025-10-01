// src/page/PolicyPage.tsx
export default function PolicyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 이용 약관 */}
        <h1 className="text-2xl font-bold text-gray-700">이용 약관</h1>
        <p className="text-gray-500 mt-2 mb-6">
          본 약관은 직관(가칭) 서비스(이하 "서비스") 이용과 관련하여 회사와
          이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다. 본
          문서는 개발 단계에서 작성된 예시이며, 실제 서비스 개시 시 별도의 법적
          검토 후 최종 반영됩니다.
        </p>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">
          제1조 (목적)
        </h2>
        <p className="text-gray-600 mt-2">
          이 약관은 회사가 제공하는 서비스의 이용 조건 및 절차, 회사와 회원 간의
          권리·의무 관계, 기타 필요한 사항을 규정함을 목적으로 합니다.
        </p>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">
          제2조 (정의)
        </h2>
        <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-2">
          <li>
            “서비스”라 함은 회사가 제공하는 모든 웹·모바일 기반 플랫폼을
            말합니다.
          </li>
          <li>
            “회원”이라 함은 본 약관에 동의하고 회사와 이용계약을 체결하여
            서비스를 이용하는 자를 말합니다.
          </li>
          <li>
            “게시물”이라 함은 회원이 서비스 내에 게시한 문자, 이미지, 영상,
            파일, 링크 등을 의미합니다.
          </li>
          <li>
            “콘텐츠”란 회사가 서비스 상에서 제공하는 모든 자료 및 정보 일체를
            의미합니다.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">
          제3조 (약관의 효력 및 변경)
        </h2>
        <p className="text-gray-600 mt-2">
          회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에
          게시합니다. 회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할
          수 있으며, 변경 시에는 적용일자 및 변경사유를 명시하여 사전에
          공지합니다.
        </p>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">
          제4조 (회원 가입 및 관리)
        </h2>
        <p className="text-gray-600 mt-2">
          회원은 본 약관에 동의하고, 회사가 요청하는 개인정보를 제공함으로써
          가입 신청을 합니다. 회사는 특별한 사유가 없는 한 이를 승인합니다. 단,
          타인의 정보를 도용하거나 허위 정보를 제공하는 경우 가입이 제한될 수
          있습니다.
        </p>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">
          제5조 (서비스 이용)
        </h2>
        <p className="text-gray-600 mt-2">
          회원은 본 약관과 회사가 정한 규칙을 준수하여야 하며, 다음 행위를
          하여서는 안 됩니다:
        </p>
        <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-2">
          <li>타인의 계정을 도용하거나 부정하게 사용하는 행위</li>
          <li>서비스 운영을 고의로 방해하는 행위</li>
          <li>법령에 위반되거나 공서양속에 반하는 행위</li>
          <li>회사 또는 제3자의 지적재산권을 침해하는 행위</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">
          제6조 (계약 해지 및 서비스 이용 제한)
        </h2>
        <p className="text-gray-600 mt-2">
          회원은 언제든지 서비스 내의 설정을 통해 탈퇴를 요청할 수 있습니다.
          회사는 회원이 본 약관에 위반되는 행위를 하는 경우, 사전 통지 후 서비스
          이용을 제한하거나 계약을 해지할 수 있습니다.
        </p>

        {/* 개인정보 처리방침 */}
        <h1 className="text-2xl font-bold text-gray-700 mt-12">
          개인정보 처리방침
        </h1>
        <p className="text-gray-500 mt-2 mb-6">
          회사는 회원의 개인정보를 소중히 여기며, 「개인정보 보호법」 및 관련
          법령을 준수하여 개인정보를 안전하게 관리합니다. 본 방침은 서비스 이용
          시 수집되는 개인정보의 항목, 이용 목적, 보관 기간 및 보호 조치를
          설명합니다.
        </p>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">
          제1조 (수집하는 개인정보 항목)
        </h2>
        <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-2">
          <li>회원가입 시: 이메일, 비밀번호, 닉네임</li>
          <li>
            서비스 이용 과정에서 자동 수집: 접속 로그, 쿠키, 기기정보, IP 주소
          </li>
          <li>선택 제공: 프로필 이미지, 관심 구단 정보, 모임 참여 이력</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">
          제2조 (개인정보의 이용 목적)
        </h2>
        <p className="text-gray-600 mt-2">
          회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다:
        </p>
        <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-2">
          <li>회원 식별 및 본인 확인</li>
          <li>서비스 제공 및 계약 이행</li>
          <li>부정 이용 방지 및 안전한 서비스 제공</li>
          <li>맞춤형 콘텐츠 및 광고 제공</li>
          <li>고객 문의 응대 및 민원 처리</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">
          제3조 (개인정보의 보관 및 파기)
        </h2>
        <p className="text-gray-600 mt-2">
          회사는 원칙적으로 개인정보 수집 및 이용 목적이 달성되면 지체 없이
          파기합니다. 다만, 관련 법령에 따라 일정 기간 보관할 수 있으며, 이 경우
          해당 법령에 따른 보존 사유와 기간을 명시합니다.
        </p>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">
          제4조 (개인정보의 제3자 제공)
        </h2>
        <p className="text-gray-600 mt-2">
          회사는 회원의 동의 없이는 개인정보를 제3자에게 제공하지 않습니다. 단,
          법령에 의해 요구되거나, 회원의 생명·안전을 위하여 긴급히 필요한
          경우에는 예외로 합니다.
        </p>

        <h2 className="text-xl font-semibold text-gray-700 mt-6">
          제5조 (개인정보 보호를 위한 조치)
        </h2>
        <p className="text-gray-600 mt-2">
          회사는 개인정보를 안전하게 보호하기 위하여 기술적·관리적·물리적 보안
          조치를 취하고 있으며, 주기적인 점검을 통해 보안 수준을 유지합니다.
        </p>
      </div>
    </div>
  );
}
