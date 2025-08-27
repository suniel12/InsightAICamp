import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const FAQSection: React.FC = () => {
  return (
    <section className="py-24 gradient-section">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about transforming documents into videos
          </p>
        </div>

        <Accordion type="single" collapsible className="max-w-4xl mx-auto space-y-4">
          
          <AccordionItem value="formats" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">What document formats does InsightPath support?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              InsightPath supports all major document formats including PDF, PowerPoint (PPT/PPTX), 
              Word documents (DOC/DOCX), Markdown files, plain text, and HTML. We're constantly 
              adding support for new formats based on customer needs. If you have a specific format 
              requirement, our team can help with custom integrations.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="time" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">How long does it take to generate a video?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Video generation typically takes 5-15 minutes depending on the document length and 
              complexity. A 10-page document usually processes in under 10 minutes. Our AI analyzes 
              your content, creates a personalized script, generates appropriate visuals, and produces 
              a professional video with narration—all automatically.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="customization" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">Can I customize the generated videos?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Absolutely! You have full control over voice selection (50+ options), visual styles, 
              pacing, background music, and branding elements. Add your logo, choose brand colors, 
              and select from multiple presentation styles. Videos can be personalized for specific 
              audiences, departments, or learning objectives. You can also edit the generated script 
              before final video creation.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="languages" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">Does InsightPath support multiple languages?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Yes! InsightPath supports video generation in over 50 languages with natural-sounding 
              voices. You can upload a document in one language and generate videos in multiple 
              languages for global teams. Our AI ensures translations are contextually appropriate 
              and culturally sensitive.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="security" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">How secure is my content?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Security is our top priority. InsightPath is SOC 2 Type II compliant with end-to-end 
              encryption for all data. We offer SSO integration, role-based access control, and 
              data residency options for enterprise customers. Your content is never used to train 
              our AI models, and you retain full ownership of all generated videos. We also support 
              on-premise deployment for organizations with strict data requirements.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="integration" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">Can InsightPath integrate with our existing systems?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Yes! InsightPath offers REST API and webhook integrations for seamless connection with 
              your LMS, CMS, or custom applications. We have pre-built integrations for popular 
              platforms like Moodle, Canvas, Blackboard, SharePoint, and Slack. Our API allows you 
              to automate video generation, manage content libraries, and track analytics programmatically.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="pricing" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">How does pricing work?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              We offer flexible pricing plans to suit organizations of all sizes. Plans are based on 
              monthly video generation volume and number of users. We have self-service plans for 
              small teams, business plans with advanced features, and enterprise plans with unlimited 
              generation, custom integrations, and dedicated support. Contact our sales team for a 
              personalized quote based on your specific needs.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="support" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">What kind of support do you provide?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              All plans include email support and access to our comprehensive knowledge base. Business 
              plans add priority support with 4-hour response times and live chat. Enterprise customers 
              receive dedicated account management, onboarding assistance, custom training for your team, 
              and 24/7 phone support. We also offer professional services for content migration and 
              custom workflow development.
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </div>
    </section>
  );
};