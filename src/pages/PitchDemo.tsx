import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  TrendingUp,
  Shield,
  Target,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import ROICalculator from '../components/ROICalculator';
import CaseStudies from '../components/CaseStudies';
import LeadCaptureForm from '../components/LeadCaptureForm';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function PitchDemo() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    trackPageView();
  }, []);

  const trackPageView = async () => {
    try {
      await supabase.from('pitch_analytics').insert({
        session_id: sessionId,
        page_path: '/pitch-demo',
        event_type: 'page_view',
        event_data: { referrer: document.referrer },
        device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const trackEvent = async (eventType: string, eventData: any = {}) => {
    try {
      await supabase.from('pitch_analytics').insert({
        session_id: sessionId,
        page_path: '/pitch-demo',
        event_type: eventType,
        event_data: eventData
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };

  const problems = [
    {
      icon: AlertTriangle,
      title: 'The Fraud Tax',
      stat: '34%',
      description: 'of FinTech marketing spend goes to fraudulent installs, fake accounts, and bot traffic'
    },
    {
      icon: TrendingUp,
      title: 'Customer Drop-off',
      stat: '22%',
      description: 'verification abandonment rate due to friction from legacy fraud prevention'
    },
    {
      icon: Target,
      title: 'Attribution Blindness',
      stat: '£2.4M',
      description: 'average annual waste from poor attribution and channel misallocation'
    }
  ];

  const solutions = [
    {
      icon: Shield,
      title: 'Real-Time Fraud Detection',
      description: 'AI-powered traffic quality scoring catches fraud before you pay for it'
    },
    {
      icon: BarChart3,
      title: 'True Attribution',
      description: 'Multi-touch attribution built for complex B2B and FinTech buyer journeys'
    },
    {
      icon: Zap,
      title: 'Predictive Intelligence',
      description: 'ML models forecast CAC, LTV, and channel performance 90 days ahead'
    },
    {
      icon: CheckCircle2,
      title: 'Automated Compliance',
      description: 'FCA-compliant campaign checking and documentation built-in'
    }
  ];

  const benefits = [
    { metric: '29%', label: 'Average CAC Reduction', color: 'blue' },
    { metric: '£3.2M', label: 'Avg Annual Fraud Savings', color: 'green' },
    { metric: '22%', label: 'LTV Improvement', color: 'purple' },
    { metric: '6 weeks', label: 'Time to ROI Positive', color: 'orange' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Stop Paying the<br />
              <span className="text-yellow-300">34% Fraud Tax</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              UK FinTech companies waste over £2.4M annually on fraudulent traffic and poor attribution.
              cmoxpert eliminates the waste and optimizes every pound.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/pricing"
                onClick={() => trackEvent('cta_click', { location: 'hero', action: 'see_pricing' })}
                className="bg-white text-blue-600 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                <span>See Pricing</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#calculator"
                onClick={() => trackEvent('cta_click', { location: 'hero', action: 'calculate_savings' })}
                className="bg-blue-700 text-white font-bold py-4 px-8 rounded-xl hover:bg-blue-800 transition-all border-2 border-blue-400 inline-flex items-center gap-2"
              >
                <span>Calculate Your Savings</span>
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-4 gap-6"
          >
            {benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">{benefit.metric}</div>
                <div className="text-blue-100">{benefit.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The Problem is Bigger Than You Think
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              While you focus on growth, fraud networks are draining your budget
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {problems.map((problem, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
              >
                <div className="p-4 bg-red-100 rounded-xl w-fit mb-4">
                  <problem.icon className="w-8 h-8 text-red-600" />
                </div>
                <div className="text-5xl font-bold text-red-600 mb-2">{problem.stat}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{problem.title}</h3>
                <p className="text-gray-600">{problem.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The cmoxpert Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Enterprise-grade marketing intelligence built specifically for UK FinTech
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {solutions.map((solution, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200"
              >
                <div className="p-4 bg-blue-600 rounded-xl w-fit mb-4">
                  <solution.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{solution.title}</h3>
                <p className="text-gray-700 leading-relaxed">{solution.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-12 text-white">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <Users className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <div className="text-3xl font-bold mb-2">500+</div>
                <p className="text-gray-300">FinTech Teams Served</p>
              </div>
              <div>
                <Clock className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <div className="text-3xl font-bold mb-2">24 Hours</div>
                <p className="text-gray-300">Average Setup Time</p>
              </div>
              <div>
                <Zap className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                <div className="text-3xl font-bold mb-2">Real-Time</div>
                <p className="text-gray-300">Fraud Detection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="calculator" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Calculate Your Savings
            </h2>
            <p className="text-xl text-gray-600">
              See exactly how much cmoxpert could save your business
            </p>
          </div>
          <ROICalculator />
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <CaseStudies />
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Stop Wasting Money?
              </h2>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Get a free CAC audit and see exactly where your budget is leaking.
                No credit card required. No sales pressure. Just honest analysis.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-blue-50">Free 30-day trial on all plans</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-blue-50">Full onboarding and integration support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-blue-50">ROI-positive in 6 weeks on average</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-300 flex-shrink-0" />
                  <span className="text-blue-50">Cancel anytime, no questions asked</span>
                </div>
              </div>
            </div>

            <div>
              <LeadCaptureForm
                source="pitch-demo-cta"
                onSuccess={() => trackEvent('lead_captured', { source: 'pitch-demo-cta' })}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 mb-4">
            Trusted by leading UK FinTech companies to optimize over £100M in marketing spend
          </p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            <div className="text-2xl font-bold">Digital Banks</div>
            <div className="text-2xl font-bold">Payment Platforms</div>
            <div className="text-2xl font-bold">Wealth Management</div>
            <div className="text-2xl font-bold">Lending Platforms</div>
          </div>
        </div>
      </section>
    </div>
  );
}
