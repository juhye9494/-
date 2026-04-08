import { motion } from 'motion/react';
import { SiteSettingsManager } from './SiteSettingsManager';
import { getFirebaseSiteSettings } from '../../lib/api';
import { ArrowRight, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeroProps {
  onSearchClick: () => void;
}

export function Hero({ onSearchClick }: HeroProps) {
  const [settings, setSettings] = useState({
    heroTitle: 'AI 업무 활용TIP',
    heroSubtitle: '한경매거진앤북',
    heroDescription: '실무에 바로 쓰는 AI 활용 가이드 모음',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const saved = await getFirebaseSiteSettings();
        if (saved) {
          setSettings(saved);
        }
      } catch (error) {
        console.error('Failed to load site settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <section className="pt-32 pb-20 px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 -z-10" />
      
      {/* Animated circles */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl -z-10"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute bottom-20 left-10 w-80 h-80 bg-gray-200 rounded-full blur-3xl -z-10"
      />

      <div className="max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">{settings.heroSubtitle}<br /><span className="bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">{settings.heroTitle}</span></h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            {settings.heroDescription}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          
          <button 
            onClick={onSearchClick}
            className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-2xl border border-gray-200 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Search className="w-5 h-5" />
            검색하기
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-gray-500"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
            <span>실무 활용법</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
            <span>검증된 팁</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full" />
            <span>상시 업데이트</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}