import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * 전송받은 파일을 Firebase Storage에 업로드하고 진행률을 콜백으로 전달합니다
 * @param file - 업로드할 파일
 * @param folderPath - Storage 내 저장 경로
 * @param onProgress - 진행률 업데이트 콜백 (0-100)
 * @returns 업로드된 파일의 다운로드 URL
 */
export async function uploadFileWithProgress(
  file: File,
  folderPath: string = 'guides',
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // 고유한 파일명 생성
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const originalName = file.name;
      const fileExtension = originalName.split('.').pop();
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      
      const storageRef = ref(storage, `${folderPath}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          console.error('Firebase Storage 업로드 실패:', error);
          reject(new Error('파일 업로드에 실패했습니다.'));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    } catch (error) {
      console.error('Firebase Storage 초기화 실패:', error);
      reject(error);
    }
  });
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
 * 전송받은 파일을 Firebase Storage에 업로드하고 다운로드 URL을 반환합니다
 * (하위 호환성을 위해 유지)
 */
export async function uploadFileToFirebase(
  file: File,
  folderPath: string = 'guides'
): Promise<string> {
  try {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;
    
    const storageRef = ref(storage, `${folderPath}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Firebase Storage 업로드 실패:', error);
    throw new Error('파일 업로드에 실패했습니다.');
  }
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

