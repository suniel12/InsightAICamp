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
            Get answers about our upcoming program
          </p>
        </div>

        <Accordion type="single" collapsible className="max-w-4xl mx-auto space-y-4">
          
          <AccordionItem value="paths" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">What career paths will you offer?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              We're launching with Data Center Technician, Network Operations Technician, 
              and Critical Facilities roles. Additional paths including Site Reliability 
              Engineer and Cloud Infrastructure will be added based on partner company needs.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="background" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">Do I need a technical background?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              While technical background helps, it is not required! Our program is designed for diverse backgrounds: recent graduates, 
              software engineers transitioning to infrastructure, IT professionals, skilled trades workers, 
              tech-adjacent professionals, and career changers. We provide personalized learning paths based on 
              your existing skillset.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="earlyaccess" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">How does early access work?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Early access members join our founding cohort with special pricing, priority placement 
              with partner companies, and input on curriculum development. Applications are reviewed 
              on a rolling basis with the first 100 members getting exclusive benefits.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cohort" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">When does the first cohort start?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Our first cohort launches in September 2025. We're currently securing employer partnerships 
              and building our adaptive learning platform. Early access members will get first priority 
              for cohort placement and can help shape the program before launch.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="placement" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">How does partner placement work?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Unlike traditional bootcamps, we partner with companies first to understand their exact needs, 
              then train you specifically for their open roles. This means you're not just learning generic skills - 
              you're training for real positions at real companies, dramatically increasing placement success.
            </AccordionContent>
          </AccordionItem>

          
        </Accordion>
      </div>
    </section>
  );
};