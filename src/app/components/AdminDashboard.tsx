import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { LogOut, Edit2, Trash2, Search, Plus, BarChart3, FileText, Users, Lock, Settings, FolderTree } from 'lucide-react';
import { Method } from '../data/methods';
import { methods as defaultMethods } from '../data/methods';
import { EditGuideDialog } from './EditGuideDialog';
import { CategoryManager } from './CategoryManager';
import { SiteSettingsManager } from './SiteSettingsManager';
import { getFirebaseGuides, deleteFirebaseGuide, updateFirebaseGuide } from '../../lib/api';

type TabType = 'guides' | 'categories' | 'settings';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('guides');
  const [methods, setMethods] = useState<Method[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingGuide, setEditingGuide] = useState<Method | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    // 인증 확인
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (!isAuthenticated || !loginTime) {
      navigate('/admin/login');
      return;
    }

    // 24시간 후 자동 로그아웃
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - parseInt(loginTime) > twentyFourHours) {
      handleLogout();
      return;
    }

    // 가이드 로드
    loadMethods();
  }, [navigate]);

  const loadMethods = async () => {
    try {
      const firebaseGuides = await getFirebaseGuides();
      // Only show user-generated guides in admin dashboard (those that are not in defaultMethods)
      const defaultIds = defaultMethods.map(m => m.id);
      const userGuides = firebaseGuides.filter(m => !defaultIds.includes(m.id));
      setMethods(userGuides);
    } catch (error) {
      console.error('Failed to load methods:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('adminLoginTime');
    navigate('/admin/login');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('정말로 이 가이드를 삭제하시겠습니까?')) {
      try {
        await deleteFirebaseGuide(id);
        const updatedMethods = methods.filter(m => m.id !== id);
        setMethods(updatedMethods);
      } catch (error) {
        console.error('Failed to delete guide:', error);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleEdit = (guide: Method) => {
    setEditingGuide(guide);
    setShowEditDialog(true);
  };

  const handleEditSubmit = async (updatedGuide: Method) => {
    try {
      await updateFirebaseGuide(updatedGuide.id, updatedGuide);
      const updatedMethods = methods.map(m => 
        m.id === updatedGuide.id ? updatedGuide : m
      );
      setMethods(updatedMethods);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Failed to update guide:', error);
      alert('수정에 실패했습니다.');
    }
  };

  const filteredMethods = methods.filter(method => {
    const matchesSearch = method.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         method.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || method.tag === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: methods.length,
    document: methods.filter(m => m.tag === '문서작성').length,
    design: methods.filter(m => m.tag === '디자인').length,
    multimedia: methods.filter(m => m.tag === '멀티미디어').length,
    development: methods.filter(m => m.tag === '개발').length,
  };

  const categories = [
    { name: '전체', value: 'all' },
    { name: '문서작성', value: '문서작성' },
    { name: '디자인', value: '디자인' },
    { name: '멀티미디어', value: '멀티미디어' },
    { name: '개발', value: '개발' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">관리자 대시보드</h1>
              <p className="text-sm text-gray-500 mt-1">AI 업무 치트키 콘텐츠 관리 (사용자 생성 가이드)</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              >
                메인 페이지
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">관리 권한 안내</h3>
            <p className="text-sm text-blue-700">
              사용자가 "나만의 가이드 공유하기"를 통해 작성한 가이드만 수정 및 삭제가 가능합니다. 기본 제공 가이드는 메인 페이지에서만 확인할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('guides')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'guides'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            가이드 관리
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            카테고리 관리
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            사이트 설정
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'guides' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white"
              >
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.total}</span>
                </div>
                <p className="text-blue-100">사용자 가이드</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.document}</span>
                </div>
                <p className="text-gray-600 text-sm">문서작성</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-6 h-6 text-pink-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.design}</span>
                </div>
                <p className="text-gray-600 text-sm">디자인</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.multimedia}</span>
                </div>
                <p className="text-gray-600 text-sm">멀티미디어</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">{stats.development}</span>
                </div>
                <p className="text-gray-600 text-sm">개발</p>
              </motion.div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="제목이나 작성자로 검색..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                        selectedCategory === category.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        가이드
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        카테고리
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        작성자
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        단계 수
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMethods.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>등록된 사용자 가이드가 없습니다.</p>
                          <p className="text-sm mt-1">메인 페이지에서 "나만의 가이드 공유하기"로 가이드를 작성해주세요.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredMethods.map((method, index) => (
                        <motion.tr
                          key={method.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {method.image && (
                                <img
                                  src={method.image}
                                  alt={method.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{method.title}</p>
                                <p className="text-sm text-gray-500 line-clamp-1">{method.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${method.tagColor}`}>
                              {method.tag}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {method.author}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {method.steps.length}개
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(method)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="수정"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(method.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'categories' && (
          <CategoryManager />
        )}

        {activeTab === 'settings' && (
          <SiteSettingsManager />
        )}
      </div>

      {/* Edit Dialog */}
      {editingGuide && (
        <EditGuideDialog
          isOpen={showEditDialog}
          onClose={() => {
            setShowEditDialog(false);
            setEditingGuide(null);
          }}
          onSubmit={handleEditSubmit}
          guide={editingGuide}
        />
      )}
    </div>
  );
}