import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

export function Terms() {
  return (
    <div className="min-h-screen bg-cream-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-slate_blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-slate_blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
              <p className="text-slate-600">Last updated: January 27, 2025</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Agreement to Terms</h2>
              <p className="text-slate-700 leading-relaxed">
                These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your")
                and cmoxpert ("Company," "we," "our," or "us") governing your access to and use of the cmoxpert platform,
                including our website, applications, and services (collectively, the "Service").
              </p>
              <p className="text-slate-700 leading-relaxed mt-4">
                By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms,
                you may not access or use the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Eligibility</h2>
              <p className="text-slate-700 leading-relaxed">
                You must be at least 18 years old and have the legal capacity to enter into contracts to use the Service.
                By using the Service, you represent and warrant that you meet these requirements.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <CheckCircle className="w-5 h-5 text-slate_blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Account Registration and Security</h2>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Account Creation</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>You must provide accurate, complete, and current information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must immediately notify us of any unauthorized access or security breaches</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>One person or entity may not maintain multiple accounts</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Account Security</h3>
              <p className="text-slate-700 leading-relaxed">
                We recommend enabling multi-factor authentication and using strong, unique passwords. You agree to
                take reasonable measures to protect your account and not share your credentials with others.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Service Description</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                cmoxpert provides an AI-powered marketing co-pilot platform that offers:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Client management and tracking tools</li>
                <li>AI-generated marketing playbooks and strategies</li>
                <li>Performance analytics and reporting</li>
                <li>Revenue attribution and forecasting</li>
                <li>Competitive intelligence insights</li>
                <li>Content creation and management</li>
                <li>Integration with third-party marketing tools</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mt-4">
                Features, functionality, and availability may vary based on your subscription plan and may be modified
                at our discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Acceptable Use</h2>

              <p className="text-slate-700 leading-relaxed mb-4">You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>

              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span>Violate any applicable laws, regulations, or third-party rights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span>Use the Service for fraudulent, abusive, or illegal activities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span>Attempt to gain unauthorized access to the Service or other users' accounts</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span>Reverse engineer, decompile, or disassemble any part of the Service</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span>Upload malware, viruses, or any harmful code</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span>Scrape, crawl, or use automated tools to extract data without permission</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span>Interfere with or disrupt the Service or servers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span>Impersonate any person or entity or misrepresent your affiliation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span>Use the Service to spam, harass, or send unsolicited communications</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-600 mr-2">✗</span>
                    <span>Resell, sublicense, or redistribute the Service without authorization</span>
                  </li>
                </ul>
              </div>

              <p className="text-slate-700 leading-relaxed">
                Violation of these terms may result in immediate termination of your account and legal action.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="w-5 h-5 text-slate_blue-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Intellectual Property Rights</h2>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Our Rights</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                The Service, including all content, features, functionality, software, and technology, is owned by
                cmoxpert and is protected by copyright, trademark, patent, and other intellectual property laws.
                Our trademarks, logos, and service marks may not be used without our prior written consent.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Your Content</h3>
              <p className="text-slate-700 leading-relaxed">
                You retain ownership of any content, data, or information you submit to the Service ("User Content").
                By submitting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use,
                reproduce, modify, and display your User Content solely to provide and improve the Service.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">AI-Generated Content</h3>
              <p className="text-slate-700 leading-relaxed">
                Content generated by our AI features based on your inputs and data is provided to you for your use.
                You are responsible for reviewing and verifying all AI-generated content before use. We do not claim
                ownership of AI-generated output created specifically for you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Subscription and Payment</h2>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Fees and Billing</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Subscription fees are billed in advance on a recurring basis (monthly or annually)</li>
                <li>All fees are non-refundable except as required by law or explicitly stated</li>
                <li>You must provide current, complete, and accurate billing information</li>
                <li>You authorize us to charge your payment method for all fees incurred</li>
                <li>Prices may change with 30 days' notice to active subscribers</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Cancellation</h3>
              <p className="text-slate-700 leading-relaxed">
                You may cancel your subscription at any time. Cancellation takes effect at the end of your current
                billing period. You will continue to have access to the Service until that date.
              </p>
            </section>

            <section className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h2 className="text-2xl font-semibold text-slate-900">Disclaimers and Limitations</h2>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold text-amber-900 mb-3">SERVICE PROVIDED "AS IS"</h3>
                <p className="text-amber-800 text-sm leading-relaxed">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS
                  OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
                  PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE. WE DO NOT WARRANT THAT THE SERVICE WILL BE
                  UNINTERRUPTED, ERROR-FREE, OR SECURE.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">AI-Generated Content Disclaimer</h3>
              <p className="text-slate-700 leading-relaxed">
                AI-generated insights, recommendations, and content are for informational purposes only and should not
                be relied upon as professional, legal, financial, or strategic advice. You are solely responsible for
                evaluating and verifying all AI-generated content before use.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Limitation of Liability</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL CMOXPERT BE LIABLE FOR ANY INDIRECT,
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Loss of data or corruption of data</li>
                <li>Cost of procurement of substitute services</li>
                <li>Business interruption or loss of goodwill</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mt-4">
                OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE 12 MONTHS PRECEDING THE EVENT
                GIVING RISE TO THE CLAIM.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Indemnification</h2>

              <p className="text-slate-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless cmoxpert, its affiliates, officers, directors,
                employees, and agents from any claims, liabilities, damages, losses, and expenses (including reasonable
                attorneys' fees) arising from: (a) your use of the Service; (b) your violation of these Terms;
                (c) your User Content; or (d) your violation of any rights of another party.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Termination</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                We may suspend or terminate your access to the Service immediately, without prior notice or liability,
                for any reason, including but not limited to:
              </p>

              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of fees</li>
                <li>Prolonged inactivity</li>
                <li>At our sole discretion</li>
              </ul>

              <p className="text-slate-700 leading-relaxed mt-4">
                Upon termination, your right to use the Service will immediately cease. We may delete your account
                and User Content after termination, subject to our data retention policies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Governing Law and Disputes</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction],
                without regard to its conflict of law provisions.
              </p>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Dispute Resolution</h3>
              <p className="text-slate-700 leading-relaxed">
                Any disputes arising from these Terms or the Service shall first be addressed through good faith
                negotiation. If not resolved within 30 days, disputes may be resolved through binding arbitration
                in accordance with applicable arbitration rules.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to Terms</h2>

              <p className="text-slate-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of material changes
                via email or through the Service. Your continued use after changes constitutes acceptance of the
                modified Terms. If you do not agree to the changes, you must stop using the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Miscellaneous</h2>

              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and cmoxpert</li>
                <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect</li>
                <li><strong>No Waiver:</strong> Failure to enforce any right does not waive that right</li>
                <li><strong>Assignment:</strong> You may not assign your rights; we may assign ours with notice</li>
                <li><strong>Force Majeure:</strong> We are not liable for delays due to circumstances beyond our control</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Information</h2>

              <p className="text-slate-700 leading-relaxed mb-4">
                For questions about these Terms or the Service, please contact us:
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <p className="font-semibold text-slate-900 mb-2">cmoxpert Legal Team</p>
                <p className="text-slate-700">Email: <a href="mailto:legal@cmoxpert.com" className="text-slate_blue-600 hover:underline">legal@cmoxpert.com</a></p>
                <p className="text-slate-700">Support: <a href="mailto:support@cmoxpert.com" className="text-slate_blue-600 hover:underline">support@cmoxpert.com</a></p>
              </div>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <p className="text-blue-900 font-semibold mb-2">Acknowledgment</p>
              <p className="text-blue-800 text-sm">
                By using cmoxpert, you acknowledge that you have read, understood, and agree to be bound by these
                Terms of Service. If you have questions or concerns, please contact us before using the Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
