import { createClient } from '@/utils/supabase/client'

/**
 * 브라우저 단에서 이미지를 압축하여 업로드 성능을 최적화합니다.
 */
async function compressImage(file: File): Promise<File | Blob> {
  // 500KB 미만은 압축 없이 진행
  if (file.size < 500 * 1024) return file;

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 최대 가로 1920px로 리사이징 (원본 비율 유지)
        const MAX_WIDTH = 1920;
        if (width > MAX_WIDTH) {
          height = (MAX_WIDTH / width) * height;
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 배경을 흰색으로 채움 (투명 PNG 대비)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 원본 파일명 유지하며 JPEG 형식으로 변환 (압축률 우수)
              resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8 // 80% 화질 최적화
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export async function uploadImage(file: File) {
  const supabase = createClient()
  
  // 업로드 전 자동 압축 수행
  const optimizedFile = await compressImage(file);
  
  const fileExt = optimizedFile instanceof File ? optimizedFile.name.split('.').pop() : 'jpg'
  const fileName = `${Math.random()}.${fileExt}`
  const filePath = `post-images/${fileName}`

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, optimizedFile)

  if (error) {
    console.error('이미지 업로드 실패:', error.message)
    throw error
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return publicUrl
}
