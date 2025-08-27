import React, { useEffect } from 'react';
import { NavigationHeader } from '@/components/shared/NavigationHeader';
import { Footer } from '@/components/shared/Footer';
import { ScrollProgress } from '@/components/shared/ScrollProgress';
import { FileText, Scale, Users, DollarSign, AlertTriangle, BookOpen, Gavel, MessageSquare } from 'lucide-react';
import { BRAND_COLORS } from '@/constants/styles';

const Terms: React.FC = () => {
  useEffect(() => {
    document.title = 'Terms of Service | GigaWatt Academy';
    
    // Add structured data for terms of service
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Terms of Service",
      "description": "Terms and conditions for using GigaWatt Academy's educational services and platform.",
      "url": "https://gigawattacademy.com/terms",
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
              <FileText className="w-10 h-10" style={{ color: BRAND_COLORS.PRIMARY }} />
              <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
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
              <p className="text-slate-300 mb-4">
                Welcome to GigaWatt Academy. These Terms of Service ("Terms") govern your use of our website, educational programs, career services, and related services (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms.
              </p>
              <p className="text-slate-300 mb-0">
                <strong>Please read these Terms carefully before using our Services.</strong> If you do not agree to these Terms, you may not access or use our Services.
              </p>
            </div>

            {/* Table of Contents */}
            <div className="bg-slate-800/30 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">Quick Navigation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <a href="#acceptance" className="text-primary hover:text-primary/80">1. Acceptance of Terms</a>
                <a href="#services" className="text-primary hover:text-primary/80">2. Description of Services</a>
                <a href="#eligibility" className="text-primary hover:text-primary/80">3. Eligibility and Enrollment</a>
                <a href="#accounts" className="text-primary hover:text-primary/80">4. User Accounts</a>
                <a href="#tuition" className="text-primary hover:text-primary/80">5. Tuition and Payments</a>
                <a href="#conduct" className="text-primary hover:text-primary/80">6. Code of Conduct</a>
                <a href="#intellectual-property" className="text-primary hover:text-primary/80">7. Intellectual Property</a>
                <a href="#privacy" className="text-primary hover:text-primary/80">8. Privacy</a>
                <a href="#disclaimers" className="text-primary hover:text-primary/80">9. Disclaimers</a>
                <a href="#limitation" className="text-primary hover:text-primary/80">10. Limitation of Liability</a>
                <a href="#termination" className="text-primary hover:text-primary/80">11. Termination</a>
                <a href="#general" className="text-primary hover:text-primary/80">12. General Provisions</a>
              </div>
            </div>

            {/* Section 1: Acceptance of Terms */}
            <section id="acceptance" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                1. Acceptance of Terms
              </h2>
              
              <p className="text-slate-300 mb-4">
                By accessing or using GigaWatt Academy's Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you are using our Services on behalf of an organization, you represent and warrant that you have the authority to bind that organization to these Terms.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Modifications to Terms</h3>
              <p className="text-slate-300 mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms on our website and updating the "Last Updated" date. Your continued use of our Services after such modifications constitutes your acceptance of the updated Terms.
              </p>
            </section>

            {/* Section 2: Description of Services */}
            <section id="services" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                2. Description of Services
              </h2>
              
              <p className="text-slate-300 mb-4">GigaWatt Academy provides:</p>
              
              <ul className="list-disc ml-6 text-slate-300 space-y-2 mb-4">
                <li><strong>Educational Programs:</strong> Training courses for data center and AI infrastructure careers</li>
                <li><strong>Career Services:</strong> Job placement assistance, resume review, and interview preparation</li>
                <li><strong>Job Board:</strong> Access to curated job opportunities in the data center industry</li>
                <li><strong>Certification:</strong> Industry-recognized certificates upon successful program completion</li>
                <li><strong>Support Services:</strong> Academic support, mentorship, and career counseling</li>
              </ul>

              <div className="bg-amber-900/20 border border-amber-600/30 p-4 rounded-lg">
                <p className="text-amber-200 text-sm">
                  <AlertTriangle className="inline w-4 h-4 mr-2" />
                  <strong>Important:</strong> While we provide career services and job placement assistance, we do not guarantee employment, specific salaries, or job offers. Success depends on individual effort, qualifications, and market conditions.
                </p>
              </div>
            </section>

            {/* Section 3: Eligibility and Enrollment */}
            <section id="eligibility" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                3. Eligibility and Enrollment
              </h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Eligibility Requirements</h3>
              <p className="text-slate-300 mb-4">To enroll in our programs, you must:</p>
              <ul className="list-disc ml-6 text-slate-300 space-y-2 mb-4">
                <li>Be at least 18 years of age or have parental consent</li>
                <li>Have a high school diploma or equivalent</li>
                <li>Have legal authorization to work in your country of residence</li>
                <li>Meet any program-specific prerequisites</li>
                <li>Complete the application and enrollment process</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Application Process</h3>
              <p className="text-slate-300 mb-4">
                All applicants must submit a complete application including required documents. We reserve the right to accept or reject any application at our discretion. Application fees are non-refundable unless otherwise stated.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Enrollment</h3>
              <p className="text-slate-300 mb-4">
                Enrollment is confirmed only upon: (1) acceptance of your application, (2) execution of an enrollment agreement if required, and (3) payment of required fees. Enrollment is non-transferable.
              </p>
            </section>

            {/* Section 4: User Accounts */}
            <section id="accounts" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                4. User Accounts
              </h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Account Creation</h3>
              <p className="text-slate-300 mb-4">
                You may need to create an account to access certain Services. You agree to:
              </p>
              <ul className="list-disc ml-6 text-slate-300 space-y-2 mb-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information as needed</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Account Restrictions</h3>
              <p className="text-slate-300 mb-4">
                You may not: (1) share your account credentials, (2) create multiple accounts, (3) use another person's account, or (4) sell or transfer your account.
              </p>
            </section>

            {/* Section 5: Tuition and Payments */}
            <section id="tuition" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                5. Tuition and Payments
              </h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Tuition and Fees</h3>
              <p className="text-slate-300 mb-4">
                Tuition and fees are as stated at the time of enrollment. All fees must be paid according to the payment schedule in your enrollment agreement. We reserve the right to change prices for future cohorts.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Payment Methods</h3>
              <p className="text-slate-300 mb-4">
                We accept payment via methods specified during enrollment. You authorize us to charge your selected payment method for all fees. You are responsible for any third-party payment processing fees.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Refund Policy</h3>
              <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                <p className="text-slate-300 mb-2"><strong>48-Hour Satisfaction Guarantee:</strong></p>
                <ul className="list-disc ml-6 text-slate-300 space-y-2">
                  <li>Full refund if requested within 48 hours of program start</li>
                  <li>No refund after 48 hours except as required by law</li>
                  <li>Application fees are non-refundable</li>
                  <li>Refunds processed within 10 business days</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">Financial Aid</h3>
              <p className="text-slate-300 mb-4">
                Financial aid, scholarships, or payment plans may be available. Terms and eligibility are determined on a case-by-case basis and subject to separate agreements.
              </p>
            </section>

            {/* Section 6: Code of Conduct */}
            <section id="conduct" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                6. Student Code of Conduct
              </h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Academic Integrity</h3>
              <p className="text-slate-300 mb-4">You agree to:</p>
              <ul className="list-disc ml-6 text-slate-300 space-y-2 mb-4">
                <li>Complete all assignments and assessments independently unless collaboration is explicitly permitted</li>
                <li>Not plagiarize, cheat, or engage in academic dishonesty</li>
                <li>Not share assessment answers or course materials without permission</li>
                <li>Properly cite all sources and references</li>
                <li>Report any violations of academic integrity</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Professional Behavior</h3>
              <p className="text-slate-300 mb-4">You agree to:</p>
              <ul className="list-disc ml-6 text-slate-300 space-y-2 mb-4">
                <li>Treat instructors, staff, and fellow students with respect</li>
                <li>Not engage in harassment, discrimination, or offensive behavior</li>
                <li>Maintain professional communication in all interactions</li>
                <li>Attend classes and complete assignments on time</li>
                <li>Not disrupt the learning environment</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Prohibited Activities</h3>
              <p className="text-slate-300 mb-4">You may not:</p>
              <ul className="list-disc ml-6 text-slate-300 space-y-2 mb-4">
                <li>Use our Services for illegal purposes</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Distribute malware or harmful code</li>
                <li>Scrape or data mine our content without permission</li>
                <li>Impersonate others or misrepresent your affiliation</li>
              </ul>

              <div className="bg-red-900/20 border border-red-600/30 p-4 rounded-lg">
                <p className="text-red-200 text-sm">
                  <AlertTriangle className="inline w-4 h-4 mr-2" />
                  Violation of the Code of Conduct may result in immediate termination from the program without refund.
                </p>
              </div>
            </section>

            {/* Section 7: Intellectual Property */}
            <section id="intellectual-property" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                7. Intellectual Property Rights
              </h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Our Content</h3>
              <p className="text-slate-300 mb-4">
                All content provided through our Services, including curricula, course materials, videos, assessments, and software, is owned by GigaWatt Academy or our licensors and protected by intellectual property laws. You receive a limited, non-exclusive, non-transferable license to use course materials solely for your personal educational purposes.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Restrictions</h3>
              <p className="text-slate-300 mb-4">You may not:</p>
              <ul className="list-disc ml-6 text-slate-300 space-y-2 mb-4">
                <li>Copy, distribute, or share course materials without permission</li>
                <li>Record lectures or sessions without consent</li>
                <li>Create derivative works from our content</li>
                <li>Use our content for commercial purposes</li>
                <li>Remove copyright or proprietary notices</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Your Content</h3>
              <p className="text-slate-300 mb-4">
                You retain ownership of content you create (assignments, projects). However, you grant us a license to use, reproduce, and display your content for educational purposes, including showcasing student work. We may use anonymized data from your work for research and improvement of our Services.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Feedback</h3>
              <p className="text-slate-300 mb-4">
                Any feedback, suggestions, or ideas you provide become our property, and we may use them without compensation or attribution.
              </p>
            </section>

            {/* Section 8: Privacy */}
            <section id="privacy" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                8. Privacy and Data Protection
              </h2>
              
              <p className="text-slate-300 mb-4">
                Your use of our Services is subject to our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, which explains how we collect, use, and protect your personal information. By using our Services, you consent to our data practices as described in the Privacy Policy.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Educational Records</h3>
              <p className="text-slate-300 mb-4">
                We maintain educational records in compliance with applicable laws, including FERPA where applicable. You have the right to access your educational records and request corrections.
              </p>
            </section>

            {/* Section 9: Disclaimers */}
            <section id="disclaimers" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                9. Disclaimers and Warranties
              </h2>
              
              <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                <p className="text-slate-300 mb-4">
                  <strong>THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</strong>
                </p>
                
                <p className="text-slate-300 mb-4">We do not warrant or guarantee:</p>
                <ul className="list-disc ml-6 text-slate-300 space-y-2">
                  <li>Employment outcomes or specific salaries</li>
                  <li>That our Services will meet all your requirements</li>
                  <li>Uninterrupted or error-free service</li>
                  <li>The accuracy or completeness of content</li>
                  <li>Results from using our Services</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">No Employment Guarantee</h3>
              <p className="text-slate-300 mb-4">
                While we provide career services and report placement statistics, we explicitly do not guarantee job placement, interviews, or any specific employment outcomes. Success depends on numerous factors including your effort, qualifications, interview performance, and market conditions.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Third-Party Services</h3>
              <p className="text-slate-300 mb-4">
                Our Services may contain links to third-party websites or services. We are not responsible for the content, privacy practices, or actions of third parties.
              </p>
            </section>

            {/* Section 10: Limitation of Liability */}
            <section id="limitation" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Gavel className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                10. Limitation of Liability
              </h2>
              
              <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                <p className="text-slate-300 mb-4">
                  <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, GIGAWATT ACADEMY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.</strong>
                </p>
                
                <p className="text-slate-300 mb-4">
                  Our total liability shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">Indemnification</h3>
              <p className="text-slate-300 mb-4">
                You agree to indemnify and hold harmless GigaWatt Academy, its officers, directors, employees, and partners from any claims, damages, losses, or expenses arising from your use of our Services, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            {/* Section 11: Termination */}
            <section id="termination" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                11. Termination
              </h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Termination by You</h3>
              <p className="text-slate-300 mb-4">
                You may withdraw from a program according to our withdrawal policy. Refunds, if any, will be processed according to our refund policy.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Termination by Us</h3>
              <p className="text-slate-300 mb-4">
                We may terminate or suspend your access immediately, without prior notice, for:
              </p>
              <ul className="list-disc ml-6 text-slate-300 space-y-2 mb-4">
                <li>Violation of these Terms or Code of Conduct</li>
                <li>Academic dishonesty or misconduct</li>
                <li>Non-payment of fees</li>
                <li>Providing false information</li>
                <li>Any reason at our sole discretion</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3">Effect of Termination</h3>
              <p className="text-slate-300 mb-4">
                Upon termination: (1) your access to Services will cease, (2) you must return or destroy all course materials, (3) provisions that should survive will remain in effect, and (4) you may lose access to any certificates or credentials not yet earned.
              </p>
            </section>

            {/* Section 12: General Provisions */}
            <section id="general" className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                12. General Provisions
              </h2>
              
              <h3 className="text-xl font-semibold text-white mb-3">Governing Law</h3>
              <p className="text-slate-300 mb-4">
                These Terms are governed by the laws of the United States and the State of [State], without regard to conflict of law principles. You consent to the exclusive jurisdiction of the state and federal courts located in [State].
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Dispute Resolution</h3>
              <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                <p className="text-slate-300 mb-4">
                  <strong>Arbitration Agreement:</strong> Any dispute arising from these Terms or our Services shall be resolved through binding arbitration conducted by JAMS under its Streamlined Arbitration Rules, except:
                </p>
                <ul className="list-disc ml-6 text-slate-300 space-y-2">
                  <li>Small claims court actions</li>
                  <li>Injunctive relief for intellectual property violations</li>
                </ul>
                <p className="text-slate-300 mt-4">
                  <strong>Class Action Waiver:</strong> You waive any right to participate in class actions, class arbitrations, or representative actions.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-white mb-3">Severability</h3>
              <p className="text-slate-300 mb-4">
                If any provision of these Terms is found invalid or unenforceable, the remaining provisions shall continue in full force and effect.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Entire Agreement</h3>
              <p className="text-slate-300 mb-4">
                These Terms, together with our Privacy Policy and any enrollment agreements, constitute the entire agreement between you and GigaWatt Academy regarding our Services.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Waiver</h3>
              <p className="text-slate-300 mb-4">
                Our failure to enforce any provision shall not constitute a waiver of that provision or any other provision.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Assignment</h3>
              <p className="text-slate-300 mb-4">
                You may not assign or transfer your rights under these Terms. We may assign our rights and obligations without restriction.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3">Force Majeure</h3>
              <p className="text-slate-300 mb-4">
                We shall not be liable for any delay or failure to perform due to causes beyond our reasonable control, including but not limited to acts of God, natural disasters, pandemic, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
              </p>
            </section>

            {/* Section 13: Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-6 h-6" style={{ color: BRAND_COLORS.PRIMARY }} />
                Contact Information
              </h2>
              
              <div className="bg-slate-800/50 p-6 rounded-lg">
                <p className="text-slate-300 mb-4">
                  For questions about these Terms of Service, please contact us:
                </p>
                
                <div className="space-y-2 text-slate-300">
                  <p><strong>GigaWatt Academy Legal Department</strong></p>
                  <p>Email: <a href="mailto:legal@gigawattacademy.com" className="text-primary hover:underline">legal@gigawattacademy.com</a></p>
                  <p>Phone: 1-800-GIGAWATT</p>
                  <p>Mailing Address:<br />
                  GigaWatt Academy<br />
                  Attn: Legal Department<br />
                  [Address to be provided]<br />
                  United States</p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-slate-300">
                    <strong>For academic or program-related inquiries:</strong><br />
                    Email: <a href="mailto:support@gigawattacademy.com" className="text-primary hover:underline">support@gigawattacademy.com</a>
                  </p>
                </div>
              </div>
            </section>

            {/* Acknowledgment */}
            <div className="bg-primary/10 border border-primary/30 p-6 rounded-lg">
              <p className="text-slate-300 text-center font-semibold">
                BY USING GIGAWATT ACADEMY'S SERVICES, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;