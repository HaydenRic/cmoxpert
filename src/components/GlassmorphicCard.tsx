import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassmorphicCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  delay?: number;
}

export const GlassmorphicCard = ({ icon, title, description, delay = 0 }: GlassmorphicCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl hover:border-white/20 transition-all group"
    >
      <motion.div 
        className="text-white/80 mb-4 group-hover:text-white transition-colors"
        whileHover={{ scale: 1.1 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-white/60 leading-relaxed">{description}</p>
    </motion.div>
  );
};