import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, Mail, UserCheck, ArrowLeft } from 'lucide-react';

export function Privacy() {
  return (
    <div className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-slate_blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-slate_blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
              <p className="text-slate-600">Last updated: January 27, 2025</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Introduction</h2>
              <p className="text-slate-700 leading-relaxed">
                Welcome to cmoxpert ("we," "our," or "us"). We are committed to protecting your privacy and ensuring
                the security of your personal information. This Privacy Policy explains how we collect, use, disclose,
                and safeguard your information when you use our AI-powered marketing co-pilot platform.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="w-5 h-5 text-slate_blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Information We Collect</h2>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Account Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Email address (required for account creation and authentication)</li>
                <li>Password (encrypted and never stored in plain text)</li>
                <li>Account role and permissions</li>
                <li>Profile information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Business Data</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Client information (names, domains, industries, contact details)</li>
                <li>Marketing campaign data (budgets, performance metrics, ROI)</li>
                <li>Revenue attribution data (deals, touchpoints, conversion data)</li>
                <li>Content and documents you upload to the platform</li>
                <li>Performance metrics and analytics data</li>
                <li>Integration data from connected third-party services</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Usage Information</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Log data (IP address, browser type, access times)</li>
                <li>Device information (device type, operating system)</li>
                <li>Feature usage and interaction patterns</li>
                <li>Error reports and diagnostic data</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="w-5 h-5 text-slate_blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">How We Use Your Information</h2>
              </div>

              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Provide Services:</strong> To operate and maintain the cmoxpert platform and deliver requested features</li>
                <li><strong>Account Management:</strong> To create and manage your account, authenticate access, and provide customer support</li>
                <li><strong>AI-Powered Features:</strong> To generate marketing insights, playbooks, competitive analysis, and recommendations</li>
                <li><strong>Analytics:</strong> To analyze usage patterns, improve our services, and develop new features</li>
                <li><strong>Communications:</strong> To send service updates, security alerts, and respond to your inquiries</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues, fraud, and security vulnerabilities</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
              </ul>
            </section>

            <section className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Lock className="w-5 h-5 text-slate_blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Data Security</h2>
              </div>

              <p className="text-slate-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>

              <div className="bg-slate_blue-50 border border-slate_blue-200 rounded-lg p-6 mb-4">
                <ul className="space-y-3 text-slate-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Encryption:</strong> All data is encrypted in transit (TLS/SSL) and at rest (AES-256)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Authentication:</strong> Secure password hashing and optional multi-factor authentication</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Access Control:</strong> Row-level security policies ensure users only access their own data</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Infrastructure:</strong> Hosted on secure, SOC 2 compliant cloud infrastructure (Supabase)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Monitoring:</strong> 24/7 security monitoring and automated threat detection</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span><strong>Backups:</strong> Regular automated backups with point-in-time recovery</span>
                  </li>
                </ul>
              </div>

              <p className="text-slate-700 leading-relaxed">
                While we implement strong security measures, no method of transmission over the internet or electronic
                storage is 100% secure. We cannot guarantee absolute security but continuously work to protect your data.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <UserCheck className="w-5 h-5 text-slate_blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Your Data Rights</h2>
              </div>

              <p className="text-slate-700 leading-relaxed mb-4">You have the following rights regarding your data:</p>

              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information at any time through your account settings</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Export:</strong> Download your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain data processing activities</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for specific data uses where applicable</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mt-4">
                To exercise these rights, contact us at <a href="mailto:privacy@cmoxpert.com" className="text-slate_blue-600 hover:underline">privacy@cmoxpert.com</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Sharing and Disclosure</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Service Providers:</strong> With trusted third-party vendors who assist in operating our platform (e.g., hosting, analytics) under strict confidentiality agreements</li>
                <li><strong>AI Services:</strong> With AI service providers to generate insights and recommendations (data is anonymized where possible)</li>
                <li><strong>Legal Requirements:</strong> When required by law, legal process, or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice provided)</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize sharing with third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Retention</h2>

              <p className="text-slate-700 leading-relaxed">
                We retain your information for as long as your account is active or as needed to provide services.
                When you delete your account, we will delete or anonymize your personal data within 90 days, except
                where we must retain it for legal, regulatory, or security purposes. Backup copies may persist for
                up to 30 additional days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cookies and Tracking</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                We use essential cookies and similar technologies to:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Maintain your session and keep you logged in</li>
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns to improve our services</li>
                <li>Ensure security and prevent fraud</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mt-4">
                You can control cookies through your browser settings, but disabling certain cookies may limit
                platform functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Third-Party Services</h2>

              <p className="text-slate-700 leading-relaxed">
                cmoxpert may integrate with third-party services (e.g., CRM systems, marketing platforms, analytics tools).
                When you authorize these integrations, data may be shared according to those services' privacy policies.
                We recommend reviewing their policies before connecting.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">International Data Transfers</h2>

              <p className="text-slate-700 leading-relaxed">
                Your data may be processed and stored in the United States and other countries where our service
                providers operate. We ensure appropriate safeguards are in place for international transfers in
                compliance with applicable data protection laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Children's Privacy</h2>

              <p className="text-slate-700 leading-relaxed">
                cmoxpert is not intended for individuals under 18 years of age. We do not knowingly collect personal
                information from children. If we become aware that a child has provided personal information, we will
                take steps to delete it promptly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to This Policy</h2>

              <p className="text-slate-700 leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of material changes via email or
                prominent notice within the platform. Continued use after changes constitutes acceptance of the
                updated policy.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Mail className="w-5 h-5 text-slate_blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Contact Us</h2>
              </div>

              <p className="text-slate-700 leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices:
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <p className="font-semibold text-slate-900 mb-2">cmoxpert Privacy Team</p>
                <p className="text-slate-700">Email: <a href="mailto:privacy@cmoxpert.com" className="text-slate_blue-600 hover:underline">privacy@cmoxpert.com</a></p>
                <p className="text-slate-700">Support: <a href="mailto:support@cmoxpert.com" className="text-slate_blue-600 hover:underline">support@cmoxpert.com</a></p>
              </div>
            </section>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
              <p className="text-green-900 font-semibold mb-2">Your Privacy Matters</p>
              <p className="text-green-800 text-sm">
                We are committed to transparency and protecting your data. This policy reflects our dedication to
                earning and maintaining your trust. If you have any concerns, we're here to help.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
