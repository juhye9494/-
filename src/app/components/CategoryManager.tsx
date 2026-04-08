import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, Trash2, FileText, Image, Video, Code, Save, X } from 'lucide-react';
import { getFirebaseCategories, saveFirebaseCategories } from '../../lib/api';

export interface Category {
  id: string;
  name: string;
  value: string;
  icon: string;
  color: string;
}

const iconOptions = [
  { value: 'FileText', label: '문서', icon: FileText },
  { value: 'Image', label: '이미지', icon: Image },
  { value: 'Video', label: '비디오', icon: Video },
  { value: 'Code', label: '코드', icon: Code },
];

const colorOptions = [
  { value: 'bg-blue-100 text-blue-700', label: '블루' },
  { value: 'bg-pink-100 text-pink-700', label: '핑크' },
  { value: 'bg-purple-100 text-purple-700', label: '퍼플' },
  { value: 'bg-green-100 text-green-700', label: '그린' },
  { value: 'bg-yellow-100 text-yellow-700', label: '옐로우' },
  { value: 'bg-red-100 text-red-700', label: '레드' },
  { value: 'bg-indigo-100 text-indigo-700', label: '인디고' },
  { value: 'bg-orange-100 text-orange-700', label: '오렌지' },
];

const defaultCategories: Category[] = [
  { id: 'document', name: '문서작성', value: '문서작성', icon: 'FileText', color: 'bg-blue-100 text-blue-700' },
  { id: 'design', name: '디자인', value: '디자인', icon: 'Image', color: 'bg-pink-100 text-pink-700' },
  { id: 'multimedia', name: '멀티미디어', value: '멀티미디어', icon: 'Video', color: 'bg-purple-100 text-purple-700' },
  { id: 'development', name: '개발', value: '개발', icon: 'Code', color: 'bg-green-100 text-green-700' },
];

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    icon: 'FileText',
    color: 'bg-blue-100 text-blue-700',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const saved = await getFirebaseCategories();
        if (saved && saved.length > 0) {
          setCategories(saved);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const saveCategories = async (newCategories: Category[]) => {
    setCategories(newCategories);
    try {
      await saveFirebaseCategories(newCategories);
    } catch (error) {
      console.error('Failed to save categories:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleAdd = () => {
    if (!formData.name || !formData.value) {
      alert('카테고리 이름과 값을 입력하세요.');
      return;
    }

    const newCategory: Category = {
      id: `category-${Date.now()}`,
      ...formData,
    };

    saveCategories([...categories, newCategory]);
    setFormData({ name: '', value: '', icon: 'FileText', color: 'bg-blue-100 text-blue-700' });
    setIsAdding(false);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      value: category.value,
      icon: category.icon,
      color: category.color,
    });
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.value) {
      alert('카테고리 이름과 값을 입력하세요.');
      return;
    }

    const updated = categories.map(cat =>
      cat.id === editingId ? { ...cat, ...formData } : cat
    );
    saveCategories(updated);
    setEditingId(null);
    setFormData({ name: '', value: '', icon: 'FileText', color: 'bg-blue-100 text-blue-700' });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('이 카테고리를 삭제하시겠습니까?')) {
      saveCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', value: '', icon: 'FileText', color: 'bg-blue-100 text-blue-700' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">카테고리 관리</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          카테고리 추가
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border-2 border-blue-200 p-6 space-y-4"
        >
          <h3 className="font-semibold text-gray-900">
            {isAdding ? '새 카테고리 추가' : '카테고리 수정'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: AI 도구"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리 값
              </label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: ai-tools"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이콘
              </label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {iconOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                색상
              </label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {colorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={editingId ? handleUpdate : handleAdd}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingId ? '수정' : '추가'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              취소
            </button>
          </div>
        </motion.div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                이름
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                값
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                아이콘
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                색상
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => {
              const IconComponent = iconOptions.find(opt => opt.value === category.icon)?.icon || FileText;
              return (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      {category.icon}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${category.color}`}>
                      {category.color.split(' ')[0].replace('bg-', '').replace('-100', '')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
