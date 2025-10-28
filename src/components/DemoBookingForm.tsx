import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DemoFormData {
  fullName: string;
  email: string;
  companyName: string;
  preferredDate: string;
  preferredTime: string;
  demoType: string;
  specificInterests: string[];
}

const demoTypes = [
  { value: 'standard', label: '30-Min Overview', description: 'Quick tour of core features' },
  { value: 'deep-dive', label: '60-Min Deep Dive', description: 'Detailed walkthrough with Q&A' },
  { value: 'custom', label: 'Custom Demo', description: 'Tailored to your specific needs' }
];

const interestOptions = [
  'Fraud Detection & Prevention',
  'Channel Performance Analytics',
  'Attribution Modeling',
  'Compliance Checking',
  'Competitive Intelligence',
  'Predictive Analytics',
  'ROI Optimization'
];

export default function DemoBookingForm() {
  const [formData, setFormData] = useState<DemoFormData>({
    fullName: '',
    email: '',
    companyName: '',
    preferredDate: '',
    preferredTime: '',
    demoType: 'standard',
    specificInterests: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      specificInterests: prev.specificInterests.includes(interest)
        ? prev.specificInterests.filter(i => i !== interest)
        : [...prev.specificInterests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const { data: leadData, error: leadError } = await supabase
        .from('pitch_leads')
        .upsert({
          email: formData.email,
          full_name: formData.fullName,
          company_name: formData.companyName,
          lead_source: 'demo-booking',
          interest_level: 'hot'
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (leadError) throw leadError;

      const { error: bookingError } = await supabase.from('demo_bookings').insert({
        lead_id: leadData.id,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        demo_type: formData.demoType,
        specific_interests: formData.specificInterests,
        booking_status: 'pending'
      });

      if (bookingError) throw bookingError;

      setSubmitStatus('success');
      setFormData({
        fullName: '',
        email: '',
        companyName: '',
        preferredDate: '',
        preferredTime: '',
        demoType: 'standard',
        specificInterests: []
      });
    } catch (error) {
      console.error('Error booking demo:', error);
      setErrorMessage('Unable to book demo. Please try again or contact us directly.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (submitStatus === 'success') {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-900 mb-2">Demo Requested!</h3>
        <p className="text-green-700 mb-4">
          We've received your demo request and will confirm the details within 4 hours.
        </p>
        <p className="text-sm text-green-600">
          You'll receive a calendar invitation with Zoom link at {formData.email}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Book Your Demo</h3>
        <p className="text-gray-600">
          See cmoxpert in action with a personalized walkthrough
        </p>
      </div>

      {submitStatus === 'error' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="John Smith"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              placeholder="john@company.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Your Company Ltd"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Demo Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {demoTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.demoType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="demoType"
                  value={type.value}
                  checked={formData.demoType === type.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="font-semibold text-gray-900 mb-1">{type.label}</span>
                <span className="text-xs text-gray-600">{type.description}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="preferredDate" className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Preferred Date *
            </label>
            <input
              type="date"
              id="preferredDate"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={handleChange}
              min={minDate}
              max={maxDate}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
          </div>

          <div>
            <label htmlFor="preferredTime" className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Preferred Time (GMT) *
            </label>
            <select
              id="preferredTime"
              name="preferredTime"
              value={formData.preferredTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value="">Select time</option>
              <option value="09:00">09:00 AM</option>
              <option value="10:00">10:00 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="12:00">12:00 PM</option>
              <option value="13:00">01:00 PM</option>
              <option value="14:00">02:00 PM</option>
              <option value="15:00">03:00 PM</option>
              <option value="16:00">04:00 PM</option>
              <option value="17:00">05:00 PM</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            What would you like to see? (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {interestOptions.map((interest) => (
              <label
                key={interest}
                className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.specificInterests.includes(interest)}
                  onChange={() => handleInterestToggle(interest)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Booking Demo...</span>
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5" />
              <span>Request Demo</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          We'll send a calendar invitation within 4 hours. Need urgent help? Email us directly.
        </p>
      </div>
    </form>
  );
}
