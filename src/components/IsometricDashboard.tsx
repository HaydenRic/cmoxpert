import { motion } from 'framer-motion';
import { useState } from 'react';

export const IsometricDashboard = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative w-full h-[600px] perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        rotateX: isHovered ? 5 : 0,
        rotateY: isHovered ? -5 : 0,
      }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Main dashboard container with isometric transform */}
      <motion.div
        className="absolute inset-0"
        style={{
          transform: 'rotateX(60deg) rotateZ(-45deg)',
          transformStyle: 'preserve-3d',
        }}
        animate={{
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Dashboard base */}
        <div className="relative w-full h-full">
          {/* Main dashboard panel */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-br from-[#1B3B6F] to-[#21295C] rounded-2xl border-2 border-[#9EB3C2]/30 shadow-2xl overflow-hidden"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'translateZ(50px)',
            }}
          >
            {/* Dashboard header */}
            <div className="p-6 border-b border-[#9EB3C2]/20 bg-gradient-to-r from-[#21295C]/50 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#1C7293] animate-pulse"></div>
                  <div className="text-white font-semibold text-lg">Marketing Dashboard</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-2 bg-[#1C7293]/40 rounded-full"></div>
                  <div className="w-8 h-2 bg-[#065A82]/40 rounded-full"></div>
                  <div className="w-8 h-2 bg-[#9EB3C2]/40 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Dashboard content grid */}
            <div className="p-6 grid grid-cols-2 gap-4">
              {/* Chart 1 - Line chart */}
              <motion.div
                className="bg-[#065A82]/20 rounded-xl p-4 border border-[#1C7293]/30 backdrop-blur-sm"
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="text-[#9EB3C2] text-sm mb-3 font-medium">Revenue Trend</div>
                <div className="relative h-24">
                  {/* Animated line chart */}
                  <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                    <motion.path
                      d="M 0 80 Q 50 20, 100 40 T 200 10"
                      stroke="#1C7293"
                      strokeWidth="3"
                      fill="none"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                        ease: 'easeInOut',
                      }}
                    />
                    <motion.path
                      d="M 0 80 Q 50 20, 100 40 T 200 10 L 200 100 L 0 100 Z"
                      fill="url(#gradient1)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1C7293" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#1C7293" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </motion.div>

              {/* Chart 2 - Bar chart */}
              <motion.div
                className="bg-[#065A82]/20 rounded-xl p-4 border border-[#1C7293]/30 backdrop-blur-sm"
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5,
                }}
              >
                <div className="text-[#9EB3C2] text-sm mb-3 font-medium">Channel Performance</div>
                <div className="flex items-end justify-between h-24 gap-2">
                  {[60, 85, 45, 70, 90].map((height, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-[#1C7293] to-[#065A82] rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{
                        duration: 1,
                        delay: i * 0.1 + 0.5,
                        type: 'spring',
                        stiffness: 100,
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Metric cards */}
              <motion.div
                className="col-span-2 grid grid-cols-3 gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                {[
                  { label: 'CAC', value: '£127', change: '-23%' },
                  { label: 'ROAS', value: '3.2x', change: '+45%' },
                  { label: 'CVR', value: '12.4%', change: '+8%' },
                ].map((metric, i) => (
                  <motion.div
                    key={i}
                    className="bg-[#21295C]/40 rounded-lg p-3 border border-[#1C7293]/20"
                    whileHover={{ scale: 1.05, borderColor: '#1C7293' }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-[#9EB3C2] text-xs mb-1">{metric.label}</div>
                    <div className="text-white font-bold text-lg">{metric.value}</div>
                    <div className="text-[#1C7293] text-xs font-medium">{metric.change}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Floating particles for depth */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#9EB3C2] rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [-10, 10, -10],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </motion.div>

          {/* Side panel - left */}
          <motion.div
            className="absolute left-[calc(50%-280px)] top-1/2 -translate-y-1/2 w-[120px] h-[350px] bg-gradient-to-br from-[#065A82] to-[#1B3B6F] rounded-l-2xl border-2 border-[#9EB3C2]/20 shadow-xl"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'translateZ(25px) rotateY(-30deg)',
            }}
            animate={{
              x: isHovered ? -10 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-full h-8 bg-[#21295C]/50 rounded-lg border border-[#1C7293]/20"
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Side panel - right */}
          <motion.div
            className="absolute left-[calc(50%+160px)] top-1/2 -translate-y-1/2 w-[120px] h-[350px] bg-gradient-to-br from-[#1B3B6F] to-[#065A82] rounded-r-2xl border-2 border-[#9EB3C2]/20 shadow-xl"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'translateZ(25px) rotateY(30deg)',
            }}
            animate={{
              x: isHovered ? 10 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-4 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-full h-8 bg-[#21295C]/50 rounded-lg border border-[#1C7293]/20"
                  animate={{
                    opacity: [0.4, 0.8, 0.4],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2 + 0.5,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-[#1C7293]/20 via-transparent to-transparent blur-3xl pointer-events-none" />
    </motion.div>
  );
};
