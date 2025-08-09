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
            Get answers to the most common questions about our program
          </p>
        </div>

        <Accordion type="single" collapsible className="max-w-4xl mx-auto space-y-4">
          
          <AccordionItem value="paths" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">What career paths do you offer?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              We currently train for Data Center Technician, Network Operations 
              Technician, Site Reliability Engineer, Critical Facilities 
              Engineer, BMS Controls Technician. We add additional roles every month.
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

          <AccordionItem value="application" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">How simple is the application process?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Extremely simple! Our streamlined application takes just 2-3 minutes: basic contact info, LinkedIn profile, 
              work authorization, and resume upload. Applications are reviewed within 48 hours with a brief interview if selected.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="guarantee" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">How does the job guarantee work?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Our 90-day job guarantee means if you complete the program successfully and don't land a qualifying 
              position within 90 days, we waive our ISA fee. Qualifying positions are roles paying $60k+ annually 
              in data center operations, cloud infrastructure, or AI infrastructure fields. With high demand for 
              these specialized skills, most graduates receive offers within a month of graduation.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="speed" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">How quickly can I get hired?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Our fastest track (Data Center Technician) gets you job-ready in just 8-12 weeks with starting salaries 
              of $65k-$95k. More advanced roles like Site Reliability Engineer take 20-28 weeks but offer higher
              starting salaries. The choice depends on your career goals.
            </AccordionContent>
          </AccordionItem>

          
        </Accordion>
      </div>
    </section>
  );
};