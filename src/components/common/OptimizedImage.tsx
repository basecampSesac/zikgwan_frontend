import { useState, useRef, useEffect } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fallbackSrc?: string;
  onError?: () => void;
}

/**
 * 최적화된 이미지 컴포넌트
 * - Lazy loading 지원
 * - WebP 형식 자동 지원
 * - 에러 핸들링
 * - 로딩 상태 처리
 */
export function OptimizedImage({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  fallbackSrc,
  onError,
}: OptimizedImageProps) {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">("loading");
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // WebP 지원 확인
  const checkWebPSupport = () => {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    });
  };

  // WebP URL 생성
  const createWebPUrl = (originalSrc: string) => {
    // 실제 프로덕션에서는 이미지 CDN을 통해 WebP 변환
    // 여기서는 간단한 예시만 보여줌
    if (originalSrc.includes("?")) {
      return `${originalSrc}&format=webp`;
    }
    return `${originalSrc}?format=webp`;
  };

  useEffect(() => {
    const loadImage = async () => {
      setImageState("loading");
      
      try {
        const supportsWebP = await checkWebPSupport();
        const imageSrc = supportsWebP ? createWebPUrl(src) : src;
        
        if (imgRef.current) {
          imgRef.current.src = imageSrc;
        }
        setCurrentSrc(imageSrc);
      } catch (error) {
        console.error("이미지 로드 실패:", error);
        if (fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
        setImageState("error");
      }
    };

    if (src) {
      loadImage();
    }
  }, [src, fallbackSrc]);

  const handleLoad = () => {
    setImageState("loaded");
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setImageState("error");
    }
    onError?.();
  };

  return (
    <div className={`relative ${className}`}>
      {/* 로딩 스피너 */}
      {imageState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-[#6F00B6] rounded-full animate-spin"></div>
        </div>
      )}

      {/* 에러 상태 */}
      {imageState === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <div className="text-center">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">이미지를 불러올 수 없습니다</p>
          </div>
        </div>
      )}

      {/* 실제 이미지 */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageState === "loaded" ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}