import React from 'react';
import { StaticPageLayout } from './StaticPageLayout';
import { Link } from 'react-router-dom';

// These are still simple placeholders for protected routes within the main Layout
export function Reports() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="text-pakistan_green-600 mt-2">Reports page coming soon...</p>
    </div>
  );
}

export function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="text-pakistan_green-600 mt-2">Settings page coming soon...</p>
    </div>
  );
}

// Static pages using the new layout
export function Privacy() {
  return (
    <StaticPageLayout title="Privacy Policy">
      <p><strong>Last updated:</strong> 8 January 2025</p>
      <p>Welcome to cmoxpert. This Privacy Policy explains how cmoxpert ("we", "us", or "our") collects, uses, discloses, and protects your personal data when you use our website and services (collectively, the "Service"). We are committed to protecting your privacy and handling your data in an open and transparent manner, in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>

      <h2>1. Who We Are</h2>
      <p>cmoxpert is an AI Marketing Co-Pilot for B2B SaaS companies, providing strategic marketing intelligence and automation services to businesses across the United Kingdom and internationally.</p>
      <p>For any questions regarding this Privacy Policy or our data protection practices, please contact us at: privacy@cmoxpert.com</p>

      <h2>2. Data We Collect</h2>
      <p>We may collect and process the following types of personal data about you:</p>
      <ul>
        <li><strong>Identity Data:</strong> Name, username, or similar identifier.</li>
        <li><strong>Contact Data:</strong> Email address, telephone numbers, company address.</li>
        <li><strong>Technical Data:</strong> Internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
        <li><strong>Usage Data:</strong> Information about how you use our website, products, and services.</li>
        <li><strong>Marketing and Communications Data:</strong> Your preferences in receiving marketing from us and your communication preferences.</li>
        <li><strong>Business Data:</strong> Company information, industry sector, and business requirements relevant to our services.</li>
      </ul>

      <h2>3. How We Collect Your Data</h2>
      <p>We use different methods to collect data from and about you, including through:</p>
      <ul>
        <li><strong>Direct interactions:</strong> You may give us your Identity, Contact, and Business Data by filling in forms or by corresponding with us by post, phone, email, or otherwise. This includes personal data you provide when you:
          <ul>
            <li>Apply for our products or services.</li>
            <li>Create an account on our website.</li>
            <li>Subscribe to our service or publications.</li>
            <li>Request marketing to be sent to you.</li>
            <li>Give us feedback or contact us.</li>
          </ul>
        </li>
        <li><strong>Automated technologies or interactions:</strong> As you interact with our website, we may automatically collect Technical Data about your equipment, browsing actions, and patterns. We collect this personal data by using cookies, server logs, and other similar technologies.</li>
        <li><strong>Third parties or publicly available sources:</strong> We may receive personal data about you from various third parties and public sources, such as analytics providers (e.g., Google Analytics), advertising networks, and search information providers.</li>
      </ul>

      <h2>4. How We Use Your Data</h2>
      <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
      <ul>
        <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
        <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
        <li>Where we need to comply with a legal or regulatory obligation.</li>
        <li>Where you have given your consent.</li>
      </ul>
      <p>We use your data to:</p>
      <ul>
        <li>Provide and manage your access to our Service.</li>
        <li>Process your orders and manage your account.</li>
        <li>Improve our website and services through AI-powered analytics.</li>
        <li>Generate marketing insights and competitive intelligence reports.</li>
        <li>Send you marketing communications (where you have consented).</li>
        <li>Comply with legal obligations.</li>
      </ul>

      <h2>5. Data Retention</h2>
      <p>We will only retain your personal data for as long as necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements. To determine the appropriate retention period for personal data, we consider the amount, nature, and sensitivity of the personal data, the potential risk of harm from unauthorised use or disclosure of your personal data, the purposes for which we process your personal data and whether we can achieve those purposes through other means, and the applicable legal requirements.</p>

      <h2>6. Your Data Protection Rights (UK GDPR)</h2>
      <p>Under UK GDPR, you have the following rights:</p>
      <ul>
        <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
        <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
        <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
        <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
        <li><strong>The right to object to processing:</strong> You have the right to object to our processing of your personal data, under certain conditions.</li>
        <li><strong>The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
      </ul>
      <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us at privacy@cmoxpert.com.</p>

      <h2>7. Cookies</h2>
      <p>Our website uses cookies to enhance your experience and provide personalised AI-driven insights. Cookies are small text files placed on your device to collect standard Internet log information and visitor behaviour information. When you visit our websites, we may collect information from you automatically through cookies or similar technology.</p>
      <p>For further information, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer">allaboutcookies.org</a>.</p>
      <p>You can set your browser not to accept cookies, and the above website tells you how to remove cookies from your browser. However, in a few cases, some of our website features may not function as a result.</p>

      <h2>8. International Transfers</h2>
      <p>We may transfer your personal data outside the UK for processing by our service providers. Where we do this, we ensure that appropriate safeguards are in place to protect your personal data in accordance with UK data protection law.</p>

      <h2>9. Changes to Our Privacy Policy</h2>
      <p>We keep our Privacy Policy under regular review and place any updates on this web page. This Privacy Policy was last updated on the date stated at the top of this page.</p>

      <h2>10. How to Contact the Appropriate Authority</h2>
      <p>Should you wish to report a complaint or if you feel that we have not addressed your concern in a satisfactory manner, you may contact the Information Commissioner's Office (ICO), the UK supervisory authority for data protection issues.</p>
      <p>ICO website: <a href="https://www.ico.org.uk" target="_blank" rel="noopener noreferrer">https://www.ico.org.uk</a></p>
      <p>ICO helpline: 0303 123 1113</p>
    </StaticPageLayout>
  );
}

export function Terms() {
  return (
    <StaticPageLayout title="Terms of Service">
      <p><strong>Last updated:</strong> 8 January 2025</p>
      <p>Welcome to cmoxpert. These Terms of Service ("Terms") govern your use of our website and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.</p>

      <h2>1. Who We Are</h2>
      <p>cmoxpert is an AI Marketing Co-Pilot for B2B SaaS companies, providing strategic marketing intelligence and automation services.</p>
      <p>The terms "we", "us", and "our" refer to cmoxpert. The term "you" refers to the user or viewer of our Service.</p>

      <h2>2. Use of the Service</h2>
      <p>The content of the pages of this Service is for your general information and use only. It is subject to change without notice.</p>
      <p>Your use of any information or materials on this Service is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services, or information available through this Service meet your specific requirements.</p>
      <p>You may use our Service for lawful business purposes only. You agree not to use the Service:</p>
      <ul>
        <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
        <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
        <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
        <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
        <li>To submit false or misleading information</li>
      </ul>

      <h2>3. Accounts</h2>
      <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
      <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.</p>
      <p>You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

      <h2>4. Intellectual Property</h2>
      <p>The Service and its original content, features, and functionality are and will remain the exclusive property of cmoxpert and its licensors. The Service is protected by copyright, trademark, and other laws of both the United Kingdom and foreign countries.</p>
      <p>Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of cmoxpert.</p>

      <h2>5. AI Services and Data Processing</h2>
      <p>Our Service utilises artificial intelligence and machine learning technologies to provide marketing insights and competitive intelligence. By using our Service, you acknowledge and agree that:</p>
      <ul>
        <li>AI-generated content is provided for informational purposes and should be reviewed by qualified professionals</li>
        <li>We may process your business data to improve our AI algorithms and service quality</li>
        <li>You retain ownership of your business data, but grant us licence to process it for service delivery</li>
        <li>AI recommendations should be evaluated in the context of your specific business circumstances</li>
      </ul>

      <h2>6. Payment Terms</h2>
      <p>If you purchase services from us, you agree to pay all fees and charges associated with your account. All fees are non-refundable unless otherwise stated. We reserve the right to change our pricing at any time, with reasonable notice provided to existing customers.</p>
      <p>Payment terms are typically 30 days from invoice date unless otherwise agreed in writing. Late payments may incur interest charges at the rate of 8% per annum above the Bank of England base rate.</p>

      <h2>7. Links to Other Websites</h2>
      <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by cmoxpert.</p>
      <p>cmoxpert has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that cmoxpert shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.</p>
      <p>We strongly advise you to read the terms and conditions and privacy policies of any third-party web sites or services that you visit.</p>

      <h2>8. Termination</h2>
      <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
      <p>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service and contact us to request account deletion.</p>

      <h2>9. Limitation of Liability</h2>
      <p>In no event shall cmoxpert, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.</p>
      <p>Our total liability to you for any claims arising from or relating to these Terms or the Service shall not exceed the amount you have paid us in the 12 months preceding the claim.</p>

      <h2>10. Disclaimer</h2>
      <p>Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>
      <p>cmoxpert does not warrant that the Service will function uninterrupted, secure or available at any particular time or location; that any errors or defects will be corrected; that the Service is free of viruses or other harmful components; or that the results of using the Service will meet your requirements.</p>

      <h2>11. Governing Law</h2>
      <p>These Terms shall be governed and construed in accordance with the laws of England and Wales, without regard to its conflict of law provisions.</p>
      <p>Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

      <h2>12. Changes to Terms</h2>
      <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
      <p>By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.</p>

      <h2>13. Contact Us</h2>
      <p>If you have any questions about these Terms, please contact us:</p>
      <ul>
        <li>By email: legal@cmoxpert.com</li>
        <li>By visiting this page on our website: <Link to="/contact">Contact Us</Link></li>
      </ul>
    </StaticPageLayout>
  );
}

export function Support() {
  return (
    <StaticPageLayout title="Support">
      <p>Welcome to cmoxpert Support. We're here to help you get the most out of our AI Marketing Co-Pilot. Below you'll find various ways to get assistance and answers to common questions.</p>

      <h2>1. Getting Started</h2>
      <p>New to cmoxpert? Here are some quick resources to help you get up and running:</p>
      <ul>
        <li><strong>Quick Start Guide:</strong> Learn the basics of setting up your first client and generating market analysis reports</li>
        <li><strong>Video Tutorials:</strong> Watch step-by-step guides on using our AI-powered features</li>
        <li><strong>Best Practices:</strong> Discover how successful B2B SaaS companies use cmoxpert to accelerate growth</li>
      </ul>

      <h2>2. Frequently Asked Questions (FAQs)</h2>
      <p>Before reaching out, please check our comprehensive FAQ section. We've compiled answers to common queries regarding:</p>
      <ul>
        <li><strong>Account Management:</strong> Billing, subscription changes, and user permissions</li>
        <li><strong>AI Features:</strong> How our market analysis and playbook generation works</li>
        <li><strong>Data & Privacy:</strong> How we handle your business data and ensure GDPR compliance</li>
        <li><strong>Integrations:</strong> Connecting cmoxpert with your existing marketing tools</li>
        <li><strong>Troubleshooting:</strong> Common technical issues and their solutions</li>
      </ul>

      <h2>3. Contact Our Support Team</h2>
      <p>If you can't find the answer you're looking for in our FAQs, or if you need personalised assistance, please don't hesitate to contact our support team. We aim to respond to all inquiries within 4 business hours during UK business hours.</p>
      
      <h3>Support Channels:</h3>
      <ul>
        <li><strong>Email Support:</strong> For general inquiries, technical support, or account assistance, please email us at: <a href="mailto:support@cmoxpert.com">support@cmoxpert.com</a></li>
        <li><strong>Priority Support:</strong> Enterprise customers can reach our priority support line at: <a href="mailto:enterprise@cmoxpert.com">enterprise@cmoxpert.com</a></li>
        <li><strong>Contact Form:</strong> You can also reach us directly through our website's contact form: <Link to="/contact">Fill out our Contact Form</Link></li>
      </ul>

      <h3>Support Hours:</h3>
      <p><strong>Standard Support:</strong> Monday - Friday: 9:00 AM - 6:00 PM GMT (excluding UK public holidays)</p>
      <p><strong>Enterprise Support:</strong> Monday - Friday: 8:00 AM - 8:00 PM GMT, with emergency support available 24/7</p>

      <h2>4. Technical Documentation</h2>
      <p>For developers and technical users, we provide comprehensive documentation covering:</p>
      <ul>
        <li><strong>API Documentation:</strong> Integrate cmoxpert's AI capabilities into your existing workflows</li>
        <li><strong>Data Export Guides:</strong> Learn how to export and analyse your marketing data</li>
        <li><strong>Security & Compliance:</strong> Technical details about our security measures and compliance certifications</li>
        <li><strong>Webhook Configuration:</strong> Set up real-time notifications for report completion and insights</li>
      </ul>

      <h2>5. Training & Onboarding</h2>
      <p>Maximise your success with cmoxpert through our training programmes:</p>
      <ul>
        <li><strong>Live Onboarding Sessions:</strong> One-on-one sessions with our customer success team</li>
        <li><strong>Group Training Workshops:</strong> Monthly workshops covering advanced features and strategies</li>
        <li><strong>Certification Programme:</strong> Become a certified cmoxpert power user</li>
        <li><strong>Custom Training:</strong> Tailored training sessions for enterprise teams</li>
      </ul>

      <h2>6. Community & Resources</h2>
      <p>Connect with other cmoxpert users and stay updated with the latest features:</p>
      <ul>
        <li><strong>User Community:</strong> Join our Slack community to share tips and best practices</li>
        <li><strong>Webinar Series:</strong> Monthly webinars featuring marketing experts and product updates</li>
        <li><strong>Blog & Insights:</strong> Regular articles on B2B SaaS marketing trends and AI-driven strategies</li>
        <li><strong>Product Roadmap:</strong> See what's coming next and vote on feature requests</li>
      </ul>

      <h2>7. Feedback & Feature Requests</h2>
      <p>Your feedback is invaluable in helping us improve cmoxpert. We actively encourage suggestions and feature requests:</p>
      <ul>
        <li><strong>Feature Requests:</strong> Submit ideas for new features via our feedback portal</li>
        <li><strong>Beta Programme:</strong> Get early access to new features and help shape their development</li>
        <li><strong>User Research:</strong> Participate in user interviews and usability studies</li>
        <li><strong>Product Feedback:</strong> Share your experience and suggestions directly with our product team</li>
      </ul>

      <h2>8. Emergency Support</h2>
      <p>For critical issues affecting your business operations:</p>
      <ul>
        <li><strong>System Status:</strong> Check our status page for real-time service availability</li>
        <li><strong>Emergency Contacts:</strong> Enterprise customers have access to emergency support contacts</li>
        <li><strong>Escalation Process:</strong> Clear escalation paths for urgent technical issues</li>
      </ul>

      <h2>9. Stay Connected</h2>
      <p>Follow us on our social media channels for the latest updates, tips, and news:</p>
      <ul>
        <li><strong>LinkedIn:</strong> Professional insights and company updates</li>
        <li><strong>Twitter:</strong> Quick tips, feature announcements, and industry news</li>
        <li><strong>YouTube:</strong> Video tutorials and customer success stories</li>
      </ul>

      <p className="mt-8 p-4 bg-cornsilk-100 rounded-lg border border-cornsilk-200">
        <strong className="text-slate-900">Need immediate assistance?</strong> <span className="text-slate-700">Don't hesitate to reach out. Our support team is here to ensure you get maximum value from cmoxpert's AI-powered marketing intelligence platform.</span>
      </p>
    </StaticPageLayout>
  );
}