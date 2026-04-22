import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { CategoryManager } from './CategoryManager';
import { getFirebaseCategories } from '../../lib/api';
import { FileText, Image, Video, Code, BookOpen, Mic, PenTool, Sparkles, Users, Edit2 } from 'lucide-react';
import { Method } from '../data/methods';
import { useState, useMemo, useEffect } from 'react';
import { PasswordVerifyDialog } from './PasswordVerifyDialog';
import { EditGuideDialog } from './EditGuideDialog';

interface MethodGridProps {
  methods: Method[];
  onUpdateMethod?: (method: Method) => void;
}

const ITEMS_PER_PAGE = 9;

export function MethodGrid({ methods, onUpdateMethod }: MethodGridProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<Method | null>(null);
  const [categories, setCategories] = useState([
    { name: '전체', value: 'all' },
    { name: '문서작성', value: '문서작성' },
    { name: '디자인', value: '디자인' },
    { name: '멀티미디어', value: '멀티미디어' },
    { name: '개발', value: '개발' },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const saved = await getFirebaseCategories();
        if (saved && saved.length > 0) {
          const categoryFilters = [
            { name: '전체', value: 'all' },
            ...saved.map((cat: any) => ({
              name: cat.name,
              value: cat.value,
            })),
          ];
          setCategories(categoryFilters);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Filter methods by category
  const filteredMethods = useMemo(() => {
    if (selectedCategory === 'all') {
      return methods;
    }
    return methods.filter(method => method.tag === selectedCategory);
  }, [methods, selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredMethods.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentMethods = filteredMethods.slice(startIndex, endIndex);

  // Reset to page 1 when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of grid smoothly
    document.getElementById('methods')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEditClick = (e: React.MouseEvent, method: Method) => {
    e.stopPropagation();
    setSelectedMethod(method);
    
    if (method.password) {
      setShowPasswordDialog(true);
    } else {
      setShowEditDialog(true);
    }
  };

  const handlePasswordVerify = (password: string) => {
    if (selectedMethod && selectedMethod.password === password) {
      setShowPasswordDialog(false);
      setShowEditDialog(true);
    } else {
      alert('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleEditSubmit = async (updatedMethod: Method) => {
    if (onUpdateMethod) {
      onUpdateMethod(updatedMethod);
    }
    setShowEditDialog(false);
    setSelectedMethod(null);
  };

  return (
    <section id="methods" className="py-24 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            팀원들이 직접 작성한 실무 중심 가이드를 확인하세요
          </motion.p>
        </div>

        {/* Category Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                selectedCategory === category.value
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentMethods.map((method, index) => {
            const Icon = method.icon;
            const hasPassword = method.password !== undefined;
            return (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer relative"
              >
                {/* Edit Button - Only for user-created guides with password */}
                {hasPassword && onUpdateMethod && (
                  <button
                    onClick={(e) => handleEditClick(e, method)}
                    className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg p-2 text-gray-600 hover:text-blue-600 transition-all shadow-md hover:shadow-lg"
                    title="수정하기"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                
                <div onClick={() => navigate(`/method/${method.id}`)}>
                  {/* Thumbnail Image */}
                  {method.image && (
                    <div className="w-full h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={method.image}
                        alt={method.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium mb-2 ${method.tagColor}`}>
                          {method.tag}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors">
                          {method.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        작성자: <span className="text-gray-700 font-medium">{method.author}</span>
                      </p>
                      <motion.span
                        className="text-blue-600 group-hover:translate-x-1 transition-transform inline-block"
                      >
                        →
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center items-center gap-2 mt-12"
          >
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              이전
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              // Show first page, last page, current page, and pages around current
              const showPage =
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

              const showEllipsis =
                (pageNumber === 2 && currentPage > 3) ||
                (pageNumber === totalPages - 1 && currentPage < totalPages - 2);

              if (showEllipsis) {
                return (
                  <span key={pageNumber} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }

              if (!showPage) return null;

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all ${
                    currentPage === pageNumber
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              다음
            </button>
          </motion.div>
        )}
      </div>
      {showPasswordDialog && selectedMethod && (
        <PasswordVerifyDialog
          isOpen={showPasswordDialog}
          onVerify={handlePasswordVerify}
          onClose={() => {
            setShowPasswordDialog(false);
            setSelectedMethod(null);
          }}
        />
      )}
      {showEditDialog && selectedMethod && (
        <EditGuideDialog
          isOpen={showEditDialog}
          guide={selectedMethod}
          onSubmit={handleEditSubmit}
          onClose={() => {
            setShowEditDialog(false);
            setSelectedMethod(null);
          }}
        />
      )}
    </section>
  );
}