import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MetricCard {
  id: number;
  value: string;
  label: string;
  icon: string;
  color: string;
  delay: number;
}

const metrics: MetricCard[] = [
  {
    id: 1,
    value: '£127',
    label: 'CAC Reduction',
    icon: '📉',
    color: 'from-[#1C7293] to-[#065A82]',
    delay: 0.8,
  },
  {
    id: 2,
    value: '3.2x',
    label: 'ROAS',
    icon: '📈',
    color: 'from-[#065A82] to-[#1B3B6F]',
    delay: 1.0,
  },
  {
    id: 3,
    value: '89%',
    label: 'Compliance Score',
    icon: '✓',
    color: 'from-[#1B3B6F] to-[#21295C]',
    delay: 1.2,
  },
];

export const FloatingCards = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute bottom-20 left-0 right-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 100, rotateX: -30 }}
              animate={{
                opacity: 1,
                y: 0,
                rotateX: 0,
                x: mousePosition.x * (index - 1) * 0.3,
                y: mousePosition.y * (index - 1) * 0.3,
              }}
              transition={{
                duration: 0.8,
                delay: metric.delay,
                type: 'spring',
                stiffness: 100,
                damping: 15,
              }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: 5,
                transition: { duration: 0.3 },
              }}
              className="relative group perspective-1000"
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Card glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, #1C7293, #065A82)`,
                }}
              />

              {/* Main card */}
              <div
                className={`relative bg-gradient-to-br ${metric.color} p-6 rounded-2xl border border-[#9EB3C2]/20 backdrop-blur-lg shadow-2xl overflow-hidden`}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'translateZ(20px)',
                }}
              >
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <motion.div
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
                      backgroundSize: '50px 50px',
                    }}
                  />
                </div>

                {/* Icon */}
                <motion.div
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="text-4xl mb-4 relative"
                  style={{ transform: 'translateZ(40px)' }}
                >
                  {metric.icon}
                </motion.div>

                {/* Value */}
                <motion.div
                  className="text-5xl font-bold text-white mb-2 relative"
                  style={{ transform: 'translateZ(30px)' }}
                  animate={{
                    textShadow: [
                      '0 0 20px rgba(255,255,255,0.5)',
                      '0 0 30px rgba(255,255,255,0.8)',
                      '0 0 20px rgba(255,255,255,0.5)',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {metric.value}
                </motion.div>

                {/* Label */}
                <div
                  className="text-[#9EB3C2] font-medium text-lg relative"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  {metric.label}
                </div>

                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%', skewX: -20 }}
                  whileHover={{
                    x: '200%',
                    transition: { duration: 0.8, ease: 'easeInOut' },
                  }}
                />

                {/* Bottom accent line */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1C7293] via-[#9EB3C2] to-[#1C7293]"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
