import { motion } from 'motion/react';
import { MessageSquare, Image, Sparkles, Code, FileText, Zap, Bot, Palette, Database } from 'lucide-react';

const tools = [
  {
    name: 'ChatGPT',
    icon: MessageSquare,
    description: 'Advanced conversational AI for content creation, coding, and problem-solving.',
    category: 'Text Generation',
    color: 'from-green-500 to-emerald-600',
  },
  {
    name: 'Midjourney',
    icon: Image,
    description: 'Create stunning AI-generated artwork and imagery from text descriptions.',
    category: 'Image Generation',
    color: 'from-purple-500 to-pink-600',
  },
  {
    name: 'Claude',
    icon: Sparkles,
    description: 'Intelligent AI assistant for analysis, writing, and complex reasoning tasks.',
    category: 'AI Assistant',
    color: 'from-amber-500 to-orange-600',
  },
  {
    name: 'GitHub Copilot',
    icon: Code,
    description: 'AI pair programmer that helps you write code faster and smarter.',
    category: 'Development',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    name: 'Jasper AI',
    icon: FileText,
    description: 'Professional content creation platform for marketing and copywriting.',
    category: 'Content Writing',
    color: 'from-red-500 to-rose-600',
  },
  {
    name: 'Runway ML',
    icon: Zap,
    description: 'Video editing and generation with AI-powered creative tools.',
    category: 'Video Generation',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    name: 'Perplexity',
    icon: Bot,
    description: 'AI-powered search engine that provides accurate, sourced answers.',
    category: 'Research',
    color: 'from-teal-500 to-green-600',
  },
  {
    name: 'DALL-E',
    icon: Palette,
    description: 'Generate realistic images and art from natural language descriptions.',
    category: 'Image Generation',
    color: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Notion AI',
    icon: Database,
    description: 'Intelligent writing assistant integrated into your workspace.',
    category: 'Productivity',
    color: 'from-gray-600 to-slate-700',
  },
];

export function ToolDirectory() {
  return (
    <section id="tools" className="py-24 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Tool Directory
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Explore our curated collection of AI tools, tested and reviewed by our team
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 from-blue-600 to-gray-900" />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{tool.name}</h3>
                    <span className="text-xs text-blue-600 font-medium">{tool.category}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {tool.description}
                  </p>
                  
                  <button className="text-blue-600 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Guide
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                    >
                      →
                    </motion.span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
