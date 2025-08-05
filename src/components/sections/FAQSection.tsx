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
          <AccordionItem value="background" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">Do I need a technical background?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              While technical experience helps, it's not required. Our program is designed to take 
              professionals from any background and give them the specialized skills needed for AI 
              infrastructure. We provide comprehensive support and personalized learning paths.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="guarantee" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">How does the job guarantee actually work?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Our 90-day job guarantee means that if you complete the program successfully and don't 
              land a qualifying position within 90 days, you'll receive a full refund. Qualifying 
              positions are full-time roles paying $100K+ in AI infrastructure or related fields.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="schedule" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">What if I can't attend full-time?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              We offer both full-time intensive cohorts and part-time evening programs. The part-time 
              program extends to 24 weeks but covers the same comprehensive curriculum with flexible 
              scheduling for working professionals.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cost" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">How do you justify the cost?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              With an average salary increase of $57,000, most graduates see full ROI within their 
              first year. Our Income Share Agreement option means you pay nothing upfront and only 
              pay when you're earning. The specialized skills we teach command premium salaries in 
              the market.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="difference" className="border border-border/30 rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold hover:text-primary">What makes this different from a coding bootcamp?</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground pt-4">
              Unlike coding bootcamps that focus on software development, we specialize in physical 
              infrastructure - the power, cooling, and hardware systems that make AI possible. This 
              is a less crowded field with higher barriers to entry and correspondingly higher pay.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};