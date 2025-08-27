import React, { useEffect } from 'react';
import { NavigationHeader } from '@/components/shared/NavigationHeader';
import { Footer } from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/shared/ScrollProgress';
import { Shield, Lock, Eye, UserCheck, Mail, Globe, Calendar, AlertCircle } from 'lucide-react';
import { BRAND_COLORS } from '@/constants/styles';

const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | GigaWatt Academy';
    
    // Add structured data for privacy policy
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Privacy Policy",
      "description": "GigaWatt Academy's privacy policy explaining how we collect, use, and protect your personal information.",
      "url": "https://gigawattacademy.com/privacy",
      "publisher": {
        "@type": "Organization",
        "name": "GigaWatt Academy"
      },
      "dateModified": "2025-01-19",
      "datePublished": "2025-01-01"
    });
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <ScrollProgress />
      <NavigationHeader />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-10 h-10" style={{ color: BRAND_COLORS.PRIMARY }} />
              <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Effective Date: January 19, 2025</span>
              <span>•</span>
              <span>Last Updated: January 19, 2025</span>
            </div>
          </div>

          {/* Introduction */}
          <section className="prose prose-invert max-w-none">
            <div className="bg-slate-800/50 p-6 rounded-lg mb-8">
              <p className="text-slate-300 mb-0">
                At GigaWatt Academy ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, apply for our programs, or use our services.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-slate-800/30 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Navigation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <a href="#information-we-collect" className="text-primary hover:text-primary/80">1. Information We Collect</a>
                <a href="#how-we-use" className="text-primary hover:text-primary/80">2. How We Use Your Information</a>
                <a href="#sharing" className="text-primary hover:text-primary/80">3. Information Sharing</a>
                <a href="#data-security" className="text-primary hover:text-primary/80">4. Data Security</a>
                <a href="#your-rights" className="text-primary hover:text-primary/80">5. Your Privacy Rights</a>
                <a href="#cookies" className="text-primary hover:text-primary/80">6. Cookies and Tracking</a>
                <a href="#retention" className="text-primary hover:text-primary/80">7. Data Retention</a>
                <a href="#contact" className="text-primary hover:text-primary/80">8. Contact Information</a>
              </div>
            </div>

            {/* Section 1: Information We Collect */}
            <section id="information-we-collect" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                1. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Personal Information You Provide</h3>
              <p className="text-slate-300 mb-4">When you apply to our programs or use our services, we may collect:</p>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li><strong>Contact Information:</strong> Name, email address, phone number, mailing address</li>
                <li><strong>Professional Information:</strong> Resume, LinkedIn profile, work history, education background</li>
                <li><strong>Application Data:</strong> Essay responses, career goals, program preferences</li>
                <li><strong>Identity Verification:</strong> Government-issued ID (when required for enrollment)</li>
                <li><strong>Payment Information:</strong> Processed securely through third-party payment processors</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Information Collected Automatically</h3>
              <p className="text-slate-300 mb-4">When you visit our website, we automatically collect:</p>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
                <li><strong>Location Data:</strong> General geographic location based on IP address</li>
                <li><strong>Cookies:</strong> Session cookies and persistent cookies for functionality</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Information from Third Parties</h3>
              <p className="text-slate-300 mb-4">We may receive information from:</p>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li><strong>Partner Companies:</strong> When they refer candidates to our programs</li>
                <li><strong>Job Platforms:</strong> Public job listing data from platforms like Adzuna</li>
                <li><strong>Social Media:</strong> If you interact with us on social platforms</li>
              </ul>
            </section>

            {/* Section 2: How We Use Your Information */}
            <section id="how-we-use" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                2. How We Use Your Information
              </h2>
              
              <p className="text-slate-300 mb-4">We use your information for the following purposes:</p>
              
              <h3 className="text-xl font-semibold text-white mb-3">Educational Services</h3>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li>Process and evaluate your program applications</li>
                <li>Provide educational content and training materials</li>
                <li>Track your progress and provide personalized learning experiences</li>
                <li>Issue certificates and credentials upon completion</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Career Services</h3>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li>Match you with relevant job opportunities</li>
                <li>Share your profile with potential employers (with your consent)</li>
                <li>Provide career coaching and interview preparation</li>
                <li>Track placement outcomes and program effectiveness</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Communication</h3>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li>Send program updates and important announcements</li>
                <li>Provide technical support and answer inquiries</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Conduct surveys to improve our services</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Legal and Compliance</h3>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li>Comply with legal obligations and regulations</li>
                <li>Protect against fraud and security threats</li>
                <li>Enforce our terms of service and policies</li>
                <li>Respond to legal requests and prevent harm</li>
              </ul>
            </section>

            {/* Section 3: Information Sharing */}
            <section id="sharing" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                3. Information Sharing and Disclosure
              </h2>
              
              <p className="text-slate-300 mb-4">We do not sell your personal information. We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-semibold text-white mb-3">With Your Consent</h3>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li><strong>Employer Partners:</strong> When you apply for jobs or opt-in to employer matching</li>
                <li><strong>Alumni Network:</strong> To connect you with graduates and mentors</li>
                <li><strong>Success Stories:</strong> With your permission for testimonials</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Service Providers</h3>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li><strong>Cloud Storage:</strong> Supabase for secure data storage</li>
                <li><strong>Payment Processing:</strong> Secure third-party payment providers</li>
                <li><strong>Communication Tools:</strong> Email and messaging platforms</li>
                <li><strong>Analytics:</strong> To understand and improve our services</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Legal Requirements</h3>
              <p className="text-slate-300">We may disclose information when required by law, such as:</p>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li>Responding to subpoenas or court orders</li>
                <li>Cooperating with law enforcement investigations</li>
                <li>Protecting our rights and property</li>
                <li>Preventing fraud or security threats</li>
              </ul>
            </section>

            {/* Section 4: Data Security */}
            <section id="data-security" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                4. Data Security
              </h2>
              
              <p className="text-slate-300 mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li><strong>Encryption:</strong> SSL/TLS encryption for data in transit</li>
                <li><strong>Secure Storage:</strong> Encrypted databases with access controls</li>
                <li><strong>Access Controls:</strong> Limited access on a need-to-know basis</li>
                <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                <li><strong>Employee Training:</strong> Privacy and security awareness programs</li>
                <li><strong>Incident Response:</strong> Procedures for data breach notification</li>
              </ul>

              <div className="bg-amber-900/20 border border-amber-600/30 p-4 rounded-lg mt-6">
                <p className="text-amber-200 text-sm">
                  <AlertCircle className="inline w-4 h-4 mr-2" />
                  While we use best practices to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Section 5: Your Rights */}
            <section id="your-rights" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <UserCheck className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                5. Your Privacy Rights
              </h2>
              
              <p className="text-slate-300 mb-4">Depending on your location, you may have the following rights:</p>
              
              <h3 className="text-xl font-semibold text-white mb-3">California Residents (CCPA/CPRA)</h3>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li><strong>Right to Know:</strong> Request information about data collection and use</li>
                <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt-out of the sale of personal information (we do not sell data)</li>
                <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
                <li><strong>Right to Correct:</strong> Request correction of inaccurate information</li>
                <li><strong>Right to Limit Use:</strong> Limit use of sensitive personal information</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">European Residents (GDPR)</h3>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li><strong>Right to Access:</strong> Obtain a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion ("right to be forgotten")</li>
                <li><strong>Right to Restriction:</strong> Limit processing of your data</li>
                <li><strong>Right to Portability:</strong> Receive data in a portable format</li>
                <li><strong>Right to Object:</strong> Object to certain processing activities</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">How to Exercise Your Rights</h3>
              <p className="text-slate-300 mb-4">To exercise any of these rights, please contact us at:</p>
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-slate-300">
                  Email: <a href="mailto:privacy@gigawattacademy.com" className="text-primary hover:underline">privacy@gigawattacademy.com</a><br />
                  Phone: 1-800-GIGAWATT<br />
                  Response Time: Within 30 days of receipt
                </p>
              </div>
            </section>

            {/* Section 6: Cookies */}
            <section id="cookies" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                6. Cookies and Tracking Technologies
              </h2>
              
              <p className="text-slate-300 mb-4">We use cookies and similar technologies to:</p>
              
              <h3 className="text-xl font-semibold text-white mb-3">Essential Cookies</h3>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li>Maintain your session and authentication</li>
                <li>Remember your preferences and settings</li>
                <li>Ensure website security and prevent fraud</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Analytics Cookies</h3>
              <ul className="list-disc ml-6 text-slate-300 space-y-2">
                <li>Understand how visitors use our website</li>
                <li>Measure the effectiveness of our content</li>
                <li>Improve user experience and site performance</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Managing Cookies</h3>
              <p className="text-slate-300">
                You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.
              </p>
            </section>

            {/* Section 7: Data Retention */}
            <section id="retention" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                7. Data Retention
              </h2>
              
              <p className="text-slate-300 mb-4">We retain your information for specific periods based on the type of data:</p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-800">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Data Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Retention Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="px-4 py-2 text-sm text-slate-400">Application Data</td>
                      <td className="px-4 py-2 text-sm text-slate-400">2 years from submission</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-slate-400">Student Records</td>
                      <td className="px-4 py-2 text-sm text-slate-400">5 years from graduation</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-slate-400">Resume/CV</td>
                      <td className="px-4 py-2 text-sm text-slate-400">2 years or until deletion request</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-slate-400">Marketing Data</td>
                      <td className="px-4 py-2 text-sm text-slate-400">Until opt-out or 3 years inactive</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-sm text-slate-400">Payment Records</td>
                      <td className="px-4 py-2 text-sm text-slate-400">7 years (tax requirements)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 8: Additional Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">Additional Information</h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Children's Privacy</h3>
              <p className="text-slate-300 mb-6">
                Our services are not directed to individuals under 16. We do not knowingly collect personal information from children under 16. If we learn we have collected information from a child under 16, we will delete it.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">International Data Transfers</h3>
              <p className="text-slate-300 mb-6">
                Your information may be transferred to and processed in the United States. By using our services, you consent to the transfer of information to countries outside your country of residence.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Do Not Track Signals</h3>
              <p className="text-slate-300 mb-6">
                We do not currently respond to Do Not Track browser signals. However, you can manage your cookie preferences through your browser settings.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">AI and Automated Decision-Making</h3>
              <p className="text-slate-300 mb-6">
                We may use AI technologies to assist in application review and candidate matching. However, all final decisions regarding admissions and job placements involve human review. You have the right to request human review of any automated decision.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Changes to This Policy</h3>
              <p className="text-slate-300 mb-6">
                We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of our services after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Section 9: Contact Information */}
            <section id="contact" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                8. Contact Information
              </h2>
              
              <div className="bg-slate-800/50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-3">Privacy Inquiries</h3>
                <p className="text-slate-300 mb-4">
                  If you have questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                
                <div className="space-y-2 text-slate-300">
                  <p><strong>GigaWatt Academy Privacy Team</strong></p>
                  <p>Email: <a href="mailto:privacy@gigawattacademy.com" className="text-primary hover:underline">privacy@gigawattacademy.com</a></p>
                  <p>Phone: 1-800-GIGAWATT</p>
                  <p>Mailing Address:<br />
                  GigaWatt Academy<br />
                  Attn: Privacy Team<br />
                  [Address to be provided]<br />
                  United States</p>
                </div>

                <h3 className="text-xl font-semibold text-white mb-3 mt-6">Data Protection Officer</h3>
                <p className="text-slate-300">
                  For GDPR-related inquiries:<br />
                  Email: <a href="mailto:dpo@gigawattacademy.com" className="text-primary hover:underline">dpo@gigawattacademy.com</a>
                </p>
              </div>
            </section>

            {/* Acknowledgment */}
            <div className="bg-primary/10 border border-primary/30 p-6 rounded-lg">
              <p className="text-slate-300 text-center">
                By using GigaWatt Academy's services, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;