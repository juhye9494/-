import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Search } from 'lucide-react';

interface NavigationProps {
  onCreateGuideClick?: () => void;
  onSearchClick?: () => void;
}

export function Navigation({ onCreateGuideClick, onSearchClick }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900"></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSearchClick}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">검색하기</span>
            </button>
            
            <button 
              onClick={onCreateGuideClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              나만의 가이드 공유하기
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}