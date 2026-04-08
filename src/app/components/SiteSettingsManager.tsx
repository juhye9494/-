import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save } from 'lucide-react';
import { getFirebaseSiteSettings, saveFirebaseSiteSettings } from '../../lib/api';

export interface SiteSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  footerCompanyName: string;
  footerDescription: string;
  footerEmail: string;
}

const defaultSettings: SiteSettings = {
  heroTitle: 'AI 업무 치트키',
  heroSubtitle: '한경매거진앤북',
  heroDescription: '실무에서 바로 쓰는 AI 활용 노하우를 공유합니다',
  footerCompanyName: '한경매거진앤북 AI업무TIP 아카이브',
  footerDescription: '우리만의 AI 활용 노하우를 한 곳에. 실무에서 검증된 가이드로 업무 효율을 높이세요!',
  footerEmail: 'juhye94@hankyung.com',
};

export function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveFirebaseSiteSettings(settings);
      alert('설정이 저장되었습니다. 페이지를 새로고침하면 변경사항이 반영됩니다.');
    } catch (error) {
      console.error('Failed to save site settings:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('기본 설정으로 초기화하시겠습니까?')) {
      try {
        await saveFirebaseSiteSettings(defaultSettings);
        setSettings(defaultSettings);
      } catch (error) {
        console.error('Failed to reset site settings:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">사이트 설정</h2>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            초기화
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
            히어로 섹션
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메인 제목
            </label>
            <input
              type="text"
              value={settings.heroTitle}
              onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="AI 업무 치트키"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              부제목
            </label>
            <input
              type="text"
              value={settings.heroSubtitle}
              onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="한경매거진앤북"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={settings.heroDescription}
              onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="실무에서 바로 쓰는 AI 활용 노하우를 공유합니다"
            />
          </div>
        </motion.div>

        {/* Footer Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
            푸터 섹션
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              회사명
            </label>
            <input
              type="text"
              value={settings.footerCompanyName}
              onChange={(e) => setSettings({ ...settings, footerCompanyName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="한경매거진앤북 AI업무TIP 아카이브"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <textarea
              value={settings.footerDescription}
              onChange={(e) => setSettings({ ...settings, footerDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="우리만의 AI 활용 노하우를 한 곳에..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={settings.footerEmail}
              onChange={(e) => setSettings({ ...settings, footerEmail: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@example.com"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
