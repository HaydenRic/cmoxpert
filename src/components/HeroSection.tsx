import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { FloatingCards } from './FloatingCards';
import { IsometricDashboard } from './IsometricDashboard';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-[#21295C] via-[#1B3B6F] to-[#065A82] overflow-hidden flex items-center">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - text content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
              className="text-white space-y-8 z-10"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#1C7293]/30 backdrop-blur-sm rounded-full text-sm font-medium text-[#9EB3C2] border border-[#1C7293]/50">
                <Sparkles className="w-4 h-4" />
                Tech-Enabled Fractional CMO Services
              </span>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                Strategic Marketing{' '}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1C7293] to-[#9EB3C2]">
                  Leadership,
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1C7293] to-[#9EB3C2]">
                  Simplified
                </span>
              </h1>

              <p className="text-xl text-[#9EB3C2] leading-relaxed">
                Get expert strategic guidance combined with comprehensive reporting at a fraction of the cost of traditional agencies
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  to="/booking"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#1C7293] hover:bg-[#065A82] text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Get Free Marketing Audit
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#21295C]/50 hover:bg-[#21295C]/70 backdrop-blur-sm text-white font-semibold rounded-lg border-2 border-[#1C7293]/50 hover:border-[#1C7293] transition-all duration-200"
                >
                  View Pricing
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-8 text-[#9EB3C2] text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#1C7293]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>5.0 Client Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#1C7293]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>50+ FinTech Clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#1C7293]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>£127 Avg CAC Reduction</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column - visual elements */}
          <div className="relative lg:h-[600px] flex items-center justify-center">
            <FloatingCards />
            <IsometricDashboard />
          </div>
        </div>
      </div>
    </section>
  );
};
