import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Zap, 
  Target, 
  DollarSign, 
  Rocket, 
  Building, 
  GraduationCap, 
  Clock,
  Users,
  TrendingUp,
  Shield,
  Award,
  Star,
  ChevronRight,
  Play,
  CheckCircle,
  ArrowRight,
  Cpu,
  Server,
  Thermometer
} from 'lucide-react';

import heroBackground from '@/assets/hero-background.jpg';
import marcusPhoto from '@/assets/testimonial-marcus.jpg';
import sarahPhoto from '@/assets/testimonial-sarah.jpg';
import jamesPhoto from '@/assets/testimonial-james.jpg';

// Counter component for animated statistics
const AnimatedCounter = ({ end, duration = 2000, prefix = "", suffix = "" }: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Quiz Component
const CareerQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      question: "What's your current role?",
      options: ["IT Professional", "Recent Graduate", "Military/Veteran", "Career Changer", "Other"]
    },
    {
      question: "What's driving your career change?",
      options: ["Higher Salary", "Job Security", "New Challenge", "Industry Growth", "Remote Work"]
    },
    {
      question: "What's your technical comfort level?",
      options: ["Beginner", "Some Experience", "Intermediate", "Advanced", "Expert"]
    },
    {
      question: "What salary increase would make this worthwhile?",
      options: ["$20K+", "$40K+", "$60K+", "$80K+", "$100K+"]
    }
  ];

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <Card className="card-glow max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-primary">87% Success Match</CardTitle>
          <p className="text-muted-foreground">Based on your profile, you're an excellent fit for our program</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Recommended: AI Infrastructure Specialist Track</h3>
            <p className="text-muted-foreground mb-6">
              Your background positions you perfectly for a $100K+ career in AI infrastructure
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">16 Weeks</div>
              <div className="text-sm text-muted-foreground">Program Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">$128K</div>
              <div className="text-sm text-muted-foreground">Average Salary</div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button className="btn-hero flex-1">See Your Full Roadmap</Button>
            <Button variant="outline" onClick={resetQuiz}>Retake Quiz</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glow max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Career Discovery Assessment</CardTitle>
          <Badge variant="secondary">{currentQuestion + 1} of {questions.length}</Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-semibold mb-6">{questions[currentQuestion].question}</h3>
        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full text-left justify-start h-auto py-4 px-6 hover:bg-primary hover:text-primary-foreground transition-smooth"
              onClick={() => handleAnswer(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [seatsRemaining, setSeatsRemaining] = useState(47);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Simulate live activity
  useEffect(() => {
    const interval = setInterval(() => {
      setSeatsRemaining(prev => Math.max(20, prev - Math.floor(Math.random() * 2)));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBackground})`,
            filter: 'brightness(0.3)'
          }}
        />
        <div className="absolute inset-0 gradient-hero" />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Trust Badge */}
          <div className="absolute top-4 right-4 hidden lg:block">
            <Badge className="bg-accent text-accent-foreground px-4 py-2">
              Forbes Featured Program
            </Badge>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Launch Your Six-Figure Career in Hyperscale Infrastructure
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Join an elite cohort of specialists powering the global AI and Cloud revolution. 90% Placement Rate into mission-critical roles.
            </p>

            {/* Value Props Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
              <div className="flex items-center justify-center gap-2 text-sm md:text-base">
                <Target className="w-5 h-5 text-primary" />
                <span>90% Placement Rate</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm md:text-base">
                <DollarSign className="w-5 h-5 text-accent" />
                <span>$100K+ Average</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm md:text-base">
                <Rocket className="w-5 h-5 text-secondary" />
                <span>16-Week Intensive</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm md:text-base">
                <Building className="w-5 h-5 text-primary" />
                <span>Fortune 500 Partners</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm md:text-base">
                <GraduationCap className="w-5 h-5 text-accent" />
                <span>ISA Available</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm md:text-base">
                <Clock className="w-5 h-5 text-secondary" />
                <span>Next Cohort: Sept 15</span>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-card/20 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <Input
                  placeholder="Enter your email to reserve your spot"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-14 text-lg"
                />
                <Button className="btn-hero h-14 px-8" onClick={() => setShowQuiz(true)}>
                  Claim Your Spot & Start Assessment
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                No payment required. Next cohort begins September 15th.
              </p>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 animate-pulse-glow">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span>Maria from Austin just enrolled 3 minutes ago</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Our Graduates Build the Backbone of AI at Companies Like:</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span>AWS</span>
                <span>•</span>
                <span>Google</span>
                <span>•</span>
                <span>Microsoft</span>
                <span>•</span>
                <span>Meta</span>
                <span>•</span>
                <span>Oracle</span>
                <span>•</span>
                <span>OpenAI</span>
                <span>•</span>
                <span>Anthropic</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Discovery Quiz Section */}
      <section className="py-20 gradient-section">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Is This Your Next Career Move?
            </h2>
            <p className="text-xl text-muted-foreground">Find Out in 60 Seconds</p>
          </div>
          <CareerQuiz />
        </div>
      </section>

      {/* Market Opportunity Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            The Multi-Trillion Dollar Skills Gap You're Positioned to Fill
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-12">
            While traditional IT roles face automation, a new class of infrastructure specialist is in critical demand.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="stat-card">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                $<AnimatedCounter end={2100} suffix="B" />
              </div>
              <p className="text-muted-foreground">Global Data Center Market by 2030</p>
            </div>
            <div className="stat-card">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                <AnimatedCounter end={73} suffix="%" />
              </div>
              <p className="text-muted-foreground">Of Operators Report a Critical Skills Shortage</p>
            </div>
            <div className="stat-card">
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">
                <AnimatedCounter end={300} suffix="%" />
              </div>
              <p className="text-muted-foreground">Salary Premium for Mission-Critical Skills</p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Section */}
      <section className="py-20 gradient-section">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Master Three Pillars. Command Any Hyperscale Facility.
            </h2>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto mb-12">
              Our curriculum is reverse-engineered from the job descriptions of top tech companies.
            </p>
          </div>

          <Tabs defaultValue="power" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="power" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Power Systems
              </TabsTrigger>
              <TabsTrigger value="cooling" className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                Cooling Systems
              </TabsTrigger>
              <TabsTrigger value="compute" className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                AI Hardware
              </TabsTrigger>
            </TabsList>

            <TabsContent value="power" className="space-y-6">
              <Card className="card-glow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Zap className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">1. Mission-Critical Power</CardTitle>
                      <p className="text-muted-foreground">Master the high-voltage electrical backbone of gigawatt-scale data centers.</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>High-Voltage Substation Operations</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>UPS Systems & N+1/2N Redundancy</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>BMS & EPMS Control Systems</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Arc Flash Safety & NFPA 70E</span>
                    </li>
                  </ul>
                  <Badge className="mt-4 bg-accent text-accent-foreground">
                    Certified Power Systems Specialist
                  </Badge>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cooling" className="space-y-6">
              <Card className="card-glow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-secondary rounded-lg flex items-center justify-center">
                      <Thermometer className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">2. Advanced Cooling</CardTitle>
                      <p className="text-muted-foreground">Become an expert in the liquid cooling technologies required for high-density AI clusters.</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Direct-to-Chip & Immersion Cooling</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Coolant Distribution Unit (CDU) Management</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>PLC Programming for HVAC Controls</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>ASHRAE Standards & Water Management</span>
                    </li>
                  </ul>
                  <Badge className="mt-4 bg-accent text-accent-foreground">
                    Liquid Cooling Infrastructure Expert
                  </Badge>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compute" className="space-y-6">
              <Card className="card-glow">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Server className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">3. Production Operations</CardTitle>
                      <p className="text-muted-foreground">Manage the server fleets that run the world's largest AI and cloud platforms.</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Linux System Administration at Scale</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Python & Shell Scripting for Automation</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Server Hardware & GPU Diagnostics</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-accent" />
                      <span>Network Infrastructure & Deployment</span>
                    </li>
                  </ul>
                  <Badge className="mt-4 bg-accent text-accent-foreground">
                    AI Systems Administrator
                  </Badge>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              From Where You Are to a Mission-Critical Career
            </h2>
            <p className="text-lg text-muted-foreground">Our alumni have successfully transitioned from diverse backgrounds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Marcus Chen Story */}
            <Card className="card-glow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={marcusPhoto} 
                    alt="Marcus Chen" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">Marcus Chen</h3>
                    <p className="text-sm text-muted-foreground">Network Admin → Lead Infrastructure Engineer</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Before: $65K</span>
                    <span className="text-accent font-semibold">After: $135K</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "My networking knowledge gave me an edge, but the power and automation training 
                  made me indispensable at a top cloud provider."
                </p>
              </CardContent>
            </Card>

            {/* Sarah Rodriguez Story */}
            <Card className="card-glow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={sarahPhoto} 
                    alt="Sarah Rodriguez" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">Sarah Rodriguez</h3>
                    <p className="text-sm text-muted-foreground">Air Force Veteran → Critical Facility Engineer</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Military Background</span>
                    <span className="text-accent font-semibold">Now: $128K</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "The military taught me mission-critical thinking. Gigawatt Academy taught me how to 
                  apply it to billion-dollar infrastructure."
                </p>
              </CardContent>
            </Card>

            {/* James Thompson Story */}
            <Card className="card-glow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={jamesPhoto} 
                    alt="James Thompson" 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">James Thompson</h3>
                    <p className="text-sm text-muted-foreground">Electrician → Data Center Engineering Ops</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Before: $42K</span>
                    <span className="text-accent font-semibold">After: $95K</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '90%' }} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "I thought my career had a ceiling. The ISA meant I could upskill 
                  without financial risk and double my income."
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-8 text-sm text-muted-foreground">
              <span>2,847 Alumni Hired and Counting</span>
              <span>•</span>
              <span>Average Increase: +$57,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-20 gradient-section">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Your Success is Guaranteed. Our Reputation Depends On It.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="card-glow text-center">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle>90-Day Job Guarantee</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Land a $100K+ role within 90 days of graduation or receive a full refund
                </p>
                <Button variant="link" className="text-primary">See full terms</Button>
              </CardContent>
            </Card>

            <Card className="card-glow text-center">
              <CardHeader>
                <DollarSign className="w-12 h-12 text-accent mx-auto mb-4" />
                <CardTitle>Income Share Option</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Pay $0 upfront. Only pay 15% of income when earning $60K+
                </p>
                <Button variant="link" className="text-accent">Calculate payments</Button>
              </CardContent>
            </Card>

            <Card className="card-glow text-center">
              <CardHeader>
                <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
                <CardTitle>Lifetime Career Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Job placement assistance, salary negotiation, and career coaching forever
                </p>
                <Button variant="link" className="text-secondary">Learn more</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <Card className="card-glow max-w-4xl mx-auto text-center">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6">Your Future in Hyperscale Infrastructure Starts Now.</h2>
              <p className="text-lg text-muted-foreground mb-6">The September 2025 cohort is filling quickly. Secure your spot to lock in Early Bird pricing.</p>
              
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full mx-1 ${
                        i < 7 ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xl">
                  Only <span className="text-primary font-bold">{seatsRemaining}</span> of 500 Seats Remaining
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Early Bird Pricing Ends September 1st</h3>
                  <p className="text-3xl font-bold text-accent">Save $5,000</p>
                  <p className="text-sm text-muted-foreground">+ Get a Free NVIDIA Certification</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Bonus Value</h3>
                  <p className="text-3xl font-bold text-secondary">$300 Value</p>
                  <p className="text-sm text-muted-foreground">NVIDIA Certification Included</p>
                </div>
              </div>

              <Button className="btn-hero text-lg px-12 py-4">
                Start Your Application
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 gradient-section">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="max-w-4xl mx-auto">
            <AccordionItem value="background">
              <AccordionTrigger>Do I need a technical background?</AccordionTrigger>
              <AccordionContent>
                While technical experience helps, it's not required. Our program is designed to take 
                professionals from any background and give them the specialized skills needed for AI 
                infrastructure. We provide comprehensive support and personalized learning paths.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="guarantee">
              <AccordionTrigger>How does the job guarantee actually work?</AccordionTrigger>
              <AccordionContent>
                Our 90-day job guarantee means that if you complete the program successfully and don't 
                land a qualifying position within 90 days, you'll receive a full refund. Qualifying 
                positions are full-time roles paying $100K+ in AI infrastructure or related fields.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="schedule">
              <AccordionTrigger>What if I can't attend full-time?</AccordionTrigger>
              <AccordionContent>
                We offer both full-time intensive cohorts and part-time evening programs. The part-time 
                program extends to 24 weeks but covers the same comprehensive curriculum with flexible 
                scheduling for working professionals.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cost">
              <AccordionTrigger>How do you justify the cost?</AccordionTrigger>
              <AccordionContent>
                With an average salary increase of $57,000, most graduates see full ROI within their 
                first year. Our Income Share Agreement option means you pay nothing upfront and only 
                pay when you're earning. The specialized skills we teach command premium salaries in 
                the market.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="difference">
              <AccordionTrigger>What makes this different from a coding bootcamp?</AccordionTrigger>
              <AccordionContent>
                Unlike coding bootcamps that focus on software development, we specialize in physical 
                infrastructure - the power, cooling, and hardware systems that make AI possible. This 
                is a less crowded field with higher barriers to entry and correspondingly higher pay.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 gradient-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Your Future in AI Infrastructure Starts with One Decision
          </h2>
          <p className="text-xl mb-12 max-w-4xl mx-auto opacity-90">
            Join 500 ambitious professionals building the backbone of the AI revolution. With our 90% 
            placement rate and $100K+ average starting salaries, your transformation is not just 
            possible—it's probable.
          </p>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100 text-lg px-12 py-4">
              Start Your Application
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary text-lg px-12 py-4"
            >
              Schedule Consultation
            </Button>
          </div>

          <p className="text-sm opacity-80">
            Classes filling quickly - 3 people viewing this page now
          </p>
        </div>
      </section>

      {/* Career Quiz Modal */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Career Discovery Assessment</DialogTitle>
          </DialogHeader>
          <CareerQuiz />
        </DialogContent>
      </Dialog>

      {/* How It Works Modal */}
      <Dialog open={showHowItWorks} onOpenChange={setShowHowItWorks}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl mb-6">How It Works: Our 3-Phase Placement Program</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-8">
            <p className="text-lg text-muted-foreground">
              Our 90-94% placement rate is the result of a systematic program co-developed with our hiring partners. We invest in you at every step.
            </p>

            {/* Phase 1 */}
            <Card className="card-glow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">1</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Phase 1: AI-Powered Adaptive Learning</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We use adaptive learning technology to create a personalized educational path for you. The AI assesses your performance in real-time, adjusting content and pace to ensure you master the foundational skills, regardless of your starting point.
                </p>
              </CardContent>
            </Card>

            {/* Phase 2 */}
            <Card className="card-glow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-secondary rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-accent-foreground">2</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Phase 2: Industry Co-Developed Curriculum</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The curriculum is co-designed and continuously updated with our partners at leading tech companies. You learn the exact technical skills and knowledge that employers are actively seeking, from high-voltage power systems to liquid cooling and Python automation.
                </p>
              </CardContent>
            </Card>

            {/* Phase 3 */}
            <Card className="card-glow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">3</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Phase 3: Onsite Training with Partner Companies</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The final phase is immersive, hands-on training at a partner company's facility. This serves as an extended interview, allowing you to apply your skills in a real-world environment and build connections. Many participants receive job offers directly from their host company.
                </p>
              </CardContent>
            </Card>

            {/* Comprehensive Career Support */}
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="text-2xl">Comprehensive Career Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Dedicated Career Coaching:</h4>
                  <p className="text-muted-foreground">Get 1-on-1 coaching to prepare for interviews, build confidence, and navigate your job search.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Professional Development:</h4>
                  <p className="text-muted-foreground">Access workshops on LinkedIn optimization, resume development, and professional networking, including mock interviews with industry managers.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Direct Employer Connections:</h4>
                  <p className="text-muted-foreground">Skip the job boards. We provide direct introductions to our hiring partner network through exclusive panels and matchmaking events.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;