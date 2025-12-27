import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const HorizonHero = () => {
  return (
    <div className="relative h-screen w-full bg-gradient-to-b from-[#0A0A0F] via-[#1a1a2e] to-[#2d1b3d] overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute top-20 right-1/4 w-96 h-96 bg-[#065A82] rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-96 h-96 bg-[#FF6B35] rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl"
        >
          <motion.h1 
            className="text-7xl md:text-9xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Strategy Before            <br />
            <br />            <br />
            Tactics,              Digitised.
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-white/70 max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Strategic clarity in a sea of marketing chaos. Diagnosis → Strategy → Execution.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <Link to="/diagnosis">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all text-lg font-medium"
              >
                Start Diagnosis →
              </motion.button>
            </Link>
            <Link to="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-transparent border border-white/30 rounded-full text-white/80 hover:border-white/50 hover:text-white transition-all text-lg font-medium"
              >
                View Pricing
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
          <motion.div 
            className="w-1.5 h-1.5 bg-white rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </div>
  );
};