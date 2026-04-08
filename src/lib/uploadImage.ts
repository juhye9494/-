import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * 전송받은 파일을 Firebase Storage에 업로드하고 다운로드 URL을 반환합니다
 * @param file - 업로드할 파일 (이미지, 동영상, 문서 등)
 * @param folderPath - Storage 내 저장 경로 (예: 'guides', 'thumbnails', 'videos', 'attachments')
 * @returns 업로드된 파일의 다운로드 URL
 */
export async function uploadFileToFirebase(
  file: File,
  folderPath: string = 'guides'
): Promise<string> {
  try {
    // 고유한 파일명 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    
    // Storage 참조 생성
    const storageRef = ref(storage, `${folderPath}/${fileName}`);
    
    // 파일 업로드
    const snapshot = await uploadBytes(storageRef, file);
    
    // 다운로드 URL 가져오기
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Firebase Storage 업로드 실패:', error);
    throw new Error('파일 업로드에 실패했습니다. Firebase 설정을 확인하세요.');
  }
}

/**
 * 이미지 파일을 Firebase Storage에 업로드 (하위 호환성 유지)
 */
export async function uploadImageToFirebase(
  file: File,
  folderPath: string = 'guides'
): Promise<string> {
  return uploadFileToFirebase(file, folderPath);
}

/**
 * Base64 데이터 URL을 Blob으로 변환합니다
 * @param dataURL - Base64 데이터 URL
 * @returns Blob 객체
 */
export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
}

/**
 * Base64 데이터 URL을 File 객체로 변환합니다
 * @param dataURL - Base64 데이터 URL
 * @param fileName - 파일명
 * @returns File 객체
 */
export function dataURLtoFile(dataURL: string, fileName: string): File {
  const blob = dataURLtoBlob(dataURL);
  return new File([blob], fileName, { type: blob.type });
}
