import axiosInstance from "../lib/axiosInstance";

// 이미지 업로드 (FormData 방식)
// @param type 이미지 종류 ("U" | "T" | "C") - 유저 / 티켓 / 커뮤니티
// @param file 업로드할 이미지 파일
// @param refId 연관 ID (userId / ticketId / communityId)
export async function uploadImage(
  type: "U" | "T" | "C",
  file: File,
  refId?: number
) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    console.log("📤 업로드 요청 FormData", [...formData.entries()]);

    const { data } = await axiosInstance.post(
      `/api/images/${type}${refId ? `?refId=${refId}` : ""}`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    if (data.status === "success") {
      console.log("✅ 업로드 성공:", data.data);
      return data.data; // { imageId, imagePath, ... }
    } else {
      throw new Error(data.message || "이미지 업로드 실패");
    }
  } catch (error) {
    console.error("🚨 이미지 업로드 오류:", error);
    throw error;
  }
}

// 이미지 조회 URL 생성
export function getImageUrl(path?: string | null) {
  /*
  if (!path) return "";
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

  if (path.startsWith("http")) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
  */
  if (!path) return "";
  
  return path;
}

// 이미지 삭제
export async function deleteImage(imageId: number) {
  try {
    const { data } = await axiosInstance.delete(
      `/api/images/delete/${imageId}`
    );
    if (data.status !== "success") {
      throw new Error(data.message || "이미지 삭제 실패");
    }
  } catch (error) {
    console.error("🚨 이미지 삭제 오류:", error);
    throw error;
  }
}
