import { Sparkles, Mail, Shield } from 'lucide-react';
import { SiteSettingsManager } from './SiteSettingsManager';
import { getFirebaseSiteSettings } from '../../lib/api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const [settings, setSettings] = useState({
    footerCompanyName: '한경매거진앤북 AI업무TIP 아카이브',
    footerDescription: '우리만의 AI 활용 노하우를 한 곳에. 실무에서 검증된 가이드로 업무 효율을 높이세요!',
    footerEmail: 'juhye94@hankyung.com',
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
    <footer className="bg-gray-900 text-gray-300 py-16 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">{settings.footerCompanyName}</span>
            </div>
            <p className="text-gray-400 max-w-md leading-relaxed">{settings.footerDescription}</p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">퀵 링크</h3>
            <ul className="space-y-2">
              <li>
                <a href="#methods" className="text-gray-400 hover:text-white transition-colors">
                  가이드 보기
                </a>
              </li>
              <li>
                <Link to="/admin/login" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Shield className="w-4 h-4" />
                  관리자 페이지
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">문의하기</h3>
            <div className="flex gap-3">
              <a href={`mailto:${settings.footerEmail}`} className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500 text-center">© 2024 한경매거진앤북. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}