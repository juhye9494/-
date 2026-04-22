import { motion } from 'motion/react';
import Masonry from 'react-responsive-masonry';
import { Star, ThumbsUp } from 'lucide-react';

const reviews = [
  {
    name: 'Sarah Chen',
    role: 'Product Designer',
    tool: 'Midjourney',
    rating: 5,
    text: 'Midjourney has completely transformed how I approach visual brainstorming. The quality of generated images is incredible, and it speeds up my design process by 10x.',
    tip: 'Use the --chaos parameter for more creative variations!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Software Engineer',
    tool: 'GitHub Copilot',
    rating: 5,
    text: 'An absolute game-changer for development. Copilot understands context incredibly well and suggests not just code, but often the exact solution I need.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    name: 'Emily Thompson',
    role: 'Content Strategist',
    tool: 'ChatGPT',
    rating: 5,
    text: 'ChatGPT is my daily co-pilot for content ideation. It helps me break through writer\'s block and explore angles I wouldn\'t have considered.',
    tip: 'Create custom instructions for consistent brand voice across all outputs.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
  },
  {
    name: 'David Park',
    role: 'Marketing Manager',
    tool: 'Jasper AI',
    rating: 4,
    text: 'Jasper has streamlined our content creation workflow significantly. The templates are incredibly helpful for maintaining consistency.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
  },
  {
    name: 'Lisa Anderson',
    role: 'UX Researcher',
    tool: 'Claude',
    rating: 5,
    text: 'Claude excels at analyzing research data and identifying patterns. The long context window is perfect for processing interview transcripts.',
    tip: 'Upload multiple documents at once for comparative analysis.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
  },
  {
    name: 'James Mitchell',
    role: 'Video Editor',
    tool: 'Runway ML',
    rating: 5,
    text: 'The AI video tools in Runway are mind-blowing. What used to take hours of manual editing now takes minutes.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
  },
  {
    name: 'Nina Patel',
    role: 'Data Analyst',
    tool: 'Perplexity',
    rating: 4,
    text: 'Perplexity has become my go-to for research. The citations make it easy to verify information and dive deeper into topics.',
    tip: 'Use the collections feature to organize research by project.',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop',
  },
  {
    name: 'Tom Harrison',
    role: 'Creative Director',
    tool: 'DALL-E',
    rating: 5,
    text: 'DALL-E is perfect for rapid prototyping of visual concepts. The inpainting feature is especially useful for iterating on designs.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
  },
];

export function FeaturedReviews() {
  return (
    <section id="reviews" className="py-24 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Featured Reviews
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Real insights and tips from our team members using AI tools daily
          </motion.p>
        </div>

        <Masonry columnsCount={3} gutter="24px" className="masonry-grid">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{review.name}</h4>
                  <p className="text-sm text-gray-500">{review.role}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full mb-3">
                  {review.tool}
                </span>
                <p className="text-gray-700 leading-relaxed">{review.text}</p>
              </div>

              {review.tip && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-start gap-2">
                    <ThumbsUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900 mb-1">Pro Tip</p>
                      <p className="text-sm text-blue-800">{review.tip}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </Masonry>
      </div>
    </section>
  );
}
