import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Method } from '../data/methods';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  methods: Method[];
}

export function SearchDialog({ isOpen, onClose, methods }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const filteredMethods = methods.filter((method) => {
    const query = searchQuery.toLowerCase();
    return (
      method.title.toLowerCase().includes(query) ||
      method.description.toLowerCase().includes(query) ||
      method.tag.toLowerCase().includes(query) ||
      method.author.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleMethodClick = (id: string) => {
    navigate(`/method/${id}`);
    onClose();
    setSearchQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            >
              {/* Search Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="가이드 제목, 작성자, 카테고리로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto p-4">
                {searchQuery === '' ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">검색어를 입력하여 가이드를 찾아보세요</p>
                    <p className="text-sm text-gray-400 mt-2">
                      총 {methods.length}개의 가이드가 있습니다
                    </p>
                  </div>
                ) : filteredMethods.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-2">
                      "{searchQuery}"에 대한 검색 결과가 없습니다
                    </p>
                    <p className="text-sm text-gray-400">
                      다른 검색어로 시도해보세요
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-4 px-2">
                      {filteredMethods.length}개의 가이드를 찾았습니다
                    </p>
                    {filteredMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <motion.div
                          key={method.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => handleMethodClick(method.id)}
                          className="group p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-gray-200"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                              <Icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {method.title}
                                </h3>
                                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {method.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${method.tagColor}`}>
                                  {method.tag}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {method.author}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono">
                    ESC
                  </kbd>{' '}
                  키를 눌러 닫기
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}