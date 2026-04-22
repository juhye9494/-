import { useState, useEffect } from 'react';
import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { MethodGrid } from './MethodGrid';
import { Footer } from './Footer';
import { SearchDialog } from './SearchDialog';
import { CreateGuideDialog, NewGuideData } from './CreateGuideDialog';
import { methods as defaultMethods, Method } from '../data/methods';
import { FileText, Image, Video, Code, Sparkles, Users, BookOpen, Mic, PenTool, Loader2 } from 'lucide-react';
import { uploadImageToFirebase, dataURLtoFile } from '../../lib/uploadImage';
import { motion, AnimatePresence } from 'motion/react';
import { getFirebaseGuides, createFirebaseGuide, updateFirebaseGuide } from '../../lib/api';

const iconMap: Record<string, any> = {
  '문서작성': FileText,
  '디자인': Image,
  '멀티미디어': Video,
  '개발': Code,
};

const tagColorMap: Record<string, string> = {
  '문서작성': 'bg-blue-100 text-blue-700',
  '디자인': 'bg-pink-100 text-pink-700',
  '멀티미디어': 'bg-purple-100 text-purple-700',
  '개발': 'bg-green-100 text-green-700',
};

export function Home() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateGuideOpen, setIsCreateGuideOpen] = useState(false);
  const [methods, setMethods] = useState<Method[]>(defaultMethods);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Load user guides from Firebase on mount
  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const firebaseGuides = await getFirebaseGuides();
        const hydratedGuides = firebaseGuides.map(guide => ({
          ...guide,
          icon: iconMap[guide.tag] || Sparkles,
          tagColor: tagColorMap[guide.tag] || 'bg-blue-100 text-blue-700'
        }));
        setMethods([...hydratedGuides, ...defaultMethods]);
      } catch (error) {
        console.error('Failed to load user guides from Firebase:', error);
      }
    };
    fetchGuides();
  }, []);

  const handleCreateGuide = async (guideData: NewGuideData) => {
    try {
      setIsUploading(true);
      setUploadProgress('가이드 데이터 저장 중...');

      const newMethod: Method = {
        id: `user-${Date.now()}`,
        title: guideData.title,
        author: guideData.author,
        tag: guideData.tag,
        icon: iconMap[guideData.tag] || Sparkles,
        tagColor: tagColorMap[guideData.tag] || 'bg-blue-100 text-blue-700',
        description: guideData.description,
        steps: guideData.steps || [],
        tips: guideData.tips || [],
        tools: guideData.tools || [],
        references: guideData.references || [],
        image: guideData.image || '',
        video: guideData.video || undefined,
        attachments: guideData.attachments || [],
        password: guideData.password,
      };

      // Firestore에 React 컴포넌트인 icon, tagColor 등을 넘길 수 없으므로 제외합니다.
      const { id: _, icon: __, tagColor: ___, ...guideDataToSave } = newMethod as any;
      const newId = await createFirebaseGuide(guideDataToSave);
      const newFirebaseMethod = { ...newMethod, id: newId };
      
      const updatedMethods = [newFirebaseMethod, ...methods];
      setMethods(updatedMethods);

      setIsUploading(false);
      setUploadProgress('');
      
      alert('가이드가 성공적으로 공유되었습니다! 🎉');
    } catch (error) {
      console.error('가이드 생성 실패:', error);
      setIsUploading(false);
      setUploadProgress('');
      alert('가이드 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleUpdateMethod = async (updatedMethod: Method) => {
    const updatedMethods = methods.map(m => 
      m.id === updatedMethod.id ? updatedMethod : m
    );
    setMethods(updatedMethods);

    // Save to Firebase (기본 제공 가이드가 아닌 경우만)
    if (!defaultMethods.find(m => m.id === updatedMethod.id)) {
      try {
        const { id, icon, tagColor, ...updateData } = updatedMethod as any;
        await updateFirebaseGuide(updatedMethod.id, updateData);
      } catch (error) {
        console.error('Failed to update guide to Firebase:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        onCreateGuideClick={() => setIsCreateGuideOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
      />
      <Hero onSearchClick={() => setIsSearchOpen(true)} />
      <MethodGrid methods={methods} onUpdateMethod={handleUpdateMethod} />
      <Footer />
      <SearchDialog 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        methods={methods}
      />
      <CreateGuideDialog
        isOpen={isCreateGuideOpen}
        onClose={() => setIsCreateGuideOpen(false)}
        onSubmit={handleCreateGuide}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
      />
    </div>
  );
}