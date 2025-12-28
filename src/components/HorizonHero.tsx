import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const HorizonHero = () => {
  return (
    <div className="relative h-screen w-full bg-horizon-900 overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute top-20 right-1/4 w-96 h-96 bg-horizon-700/20 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-96 h-96 bg-horizon-600/20 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
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
            className="text-7xl md:text-9xl font-bold text-white mb-6 leading-tight tracking-tighter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Strategy Before            <br />
            <br />            <br />
            Tactics,              <span className="text-horizon-200">Digitised.</span>.
          </motion.h1>

          <motion.p
            className="text-xl text-horizon-200/80 max-w-2xl mx-auto mb-12"
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
                className="px-8 py-4 bg-white text-horizon-900 rounded-full shadow-glow hover:shadow-xl hover:scale-105 transition-all text-lg font-bold"
              >
                Start Diagnosis
              </motion.button>
            </Link>
            <Link to="/pricing">
              <motion.button
                className="px-8 py-4 bg-transparent border border-horizon-200/20 rounded-full text-horizon-200 hover:bg-white/5 hover:text-white transition-all text-lg font-medium"
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