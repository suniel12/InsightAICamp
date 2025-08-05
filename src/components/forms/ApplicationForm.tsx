import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, Upload } from 'lucide-react';

interface ApplicationFormProps {
  recommendedRole?: string;
  onClose?: () => void;
}

interface ApplicationData {
  fullName: string;
  phoneNumber: string;
  linkedinProfileUrl: string;
  githubProfileUrl: string;
  personalWebsiteUrl: string;
  currentLocation: string;
  workAuthorizationStatus: string;
  selectedPersona: string;
  technicalSkills: string;
  educationHistory: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    graduationYear: string;
  }>;
  workHistory: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  essayAnswers: {
    motivation: string;
    careerGoals: string;
    relevantExperience: string;
  };
}

export const ApplicationForm: React.FC<ApplicationFormProps> = ({ recommendedRole, onClose }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<ApplicationData>({
    fullName: '',
    phoneNumber: '',
    linkedinProfileUrl: '',
    githubProfileUrl: '',
    personalWebsiteUrl: '',
    currentLocation: '',
    workAuthorizationStatus: '',
    selectedPersona: '',
    technicalSkills: '',
    educationHistory: [{ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' }],
    workHistory: [{ company: '', position: '', duration: '', description: '' }],
    essayAnswers: {
      motivation: '',
      careerGoals: '',
      relevantExperience: ''
    }
  });

  const handleInputChange = (field: keyof ApplicationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEducationChange = (index: number, field: string, value: string) => {
    const updated = [...formData.educationHistory];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, educationHistory: updated }));
  };

  const handleWorkHistoryChange = (index: number, field: string, value: string) => {
    const updated = [...formData.workHistory];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, workHistory: updated }));
  };

  const addEducationEntry = () => {
    setFormData(prev => ({
      ...prev,
      educationHistory: [...prev.educationHistory, { institution: '', degree: '', fieldOfStudy: '', graduationYear: '' }]
    }));
  };

  const addWorkEntry = () => {
    setFormData(prev => ({
      ...prev,
      workHistory: [...prev.workHistory, { company: '', position: '', duration: '', description: '' }]
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User needs to sign up/in first
        toast({
          title: "Authentication Required",
          description: "Please sign up or sign in to submit your application.",
          variant: "destructive"
        });
        return;
      }

      const applicationData = {
        user_id: user.id,
        application_status: 'submitted',
        submitted_at: new Date().toISOString(),
        email_id: user.email || '',
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        linkedin_profile_url: formData.linkedinProfileUrl,
        current_location: formData.currentLocation,
        work_authorization_status: formData.workAuthorizationStatus,
        background_type: formData.selectedPersona,
        essay_answers: formData.essayAnswers
      };

      const { error } = await supabase
        .from('applications')
        .insert([applicationData]);

      if (error) {
        throw error;
      }

      setIsSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Thank you for your application. We'll be in touch within 48 hours.",
      });

    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission Error",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Application Submitted Successfully!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for applying to Gigawatt Academy. Our admissions team will review your application 
            and get back to you within 48 hours.
          </p>
          {recommendedRole && (
            <p className="text-sm text-accent mb-6">
              Based on your quiz results, we'll prioritize you for our <strong>{recommendedRole}</strong> track.
            </p>
          )}
          <Button onClick={onClose} className="btn-hero">
            Continue Exploring
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Personal Information</h3>
              <p className="text-muted-foreground">Let's start with the basics</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="currentLocation">Current Location *</Label>
              <Input
                id="currentLocation"
                value={formData.currentLocation}
                onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                placeholder="City, State/Country"
                required
              />
            </div>

            <div>
              <Label htmlFor="workAuth">Work Authorization Status *</Label>
              <Select onValueChange={(value) => handleInputChange('workAuthorizationStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your work authorization status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="authorized">Authorized to work in the US</SelectItem>
                  <SelectItem value="requires_sponsorship">Requires sponsorship</SelectItem>
                  <SelectItem value="not_specified">Prefer not to specify</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedinProfileUrl}
                  onChange={(e) => handleInputChange('linkedinProfileUrl', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <Label htmlFor="github">GitHub Profile</Label>
                <Input
                  id="github"
                  value={formData.githubProfileUrl}
                  onChange={(e) => handleInputChange('githubProfileUrl', e.target.value)}
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Background & Experience</h3>
              <p className="text-muted-foreground">Tell us about your educational and professional background</p>
            </div>

            <div>
              <Label>Education History</Label>
              {formData.educationHistory.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Institution/School"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    />
                    <Input
                      placeholder="Degree/Certificate"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    />
                    <Input
                      placeholder="Field of Study"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                    />
                    <Input
                      placeholder="Graduation Year"
                      value={edu.graduationYear}
                      onChange={(e) => handleEducationChange(index, 'graduationYear', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addEducationEntry}>
                + Add Education
              </Button>
            </div>

            <div>
              <Label>Work Experience</Label>
              {formData.workHistory.map((work, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      placeholder="Company"
                      value={work.company}
                      onChange={(e) => handleWorkHistoryChange(index, 'company', e.target.value)}
                    />
                    <Input
                      placeholder="Position/Title"
                      value={work.position}
                      onChange={(e) => handleWorkHistoryChange(index, 'position', e.target.value)}
                    />
                    <Input
                      placeholder="Duration (e.g., 2020-2023)"
                      value={work.duration}
                      onChange={(e) => handleWorkHistoryChange(index, 'duration', e.target.value)}
                    />
                  </div>
                  <Textarea
                    placeholder="Brief description of your role and achievements"
                    value={work.description}
                    onChange={(e) => handleWorkHistoryChange(index, 'description', e.target.value)}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addWorkEntry}>
                + Add Work Experience
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Essay Questions</h3>
              <p className="text-muted-foreground">Help us understand your motivation and goals</p>
            </div>

            <div>
              <Label htmlFor="motivation">Why are you interested in a career in AI infrastructure? *</Label>
              <Textarea
                id="motivation"
                value={formData.essayAnswers.motivation}
                onChange={(e) => handleInputChange('essayAnswers', { ...formData.essayAnswers, motivation: e.target.value })}
                placeholder="Tell us what draws you to this field..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="careerGoals">What are your career goals for the next 5 years? *</Label>
              <Textarea
                id="careerGoals"
                value={formData.essayAnswers.careerGoals}
                onChange={(e) => handleInputChange('essayAnswers', { ...formData.essayAnswers, careerGoals: e.target.value })}
                placeholder="Describe your career aspirations..."
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="relevantExperience">Describe any relevant technical or problem-solving experience</Label>
              <Textarea
                id="relevantExperience"
                value={formData.essayAnswers.relevantExperience}
                onChange={(e) => handleInputChange('essayAnswers', { ...formData.essayAnswers, relevantExperience: e.target.value })}
                placeholder="Share any relevant experience, projects, or skills..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="technicalSkills">Technical Skills & Certifications</Label>
              <Textarea
                id="technicalSkills"
                value={formData.technicalSkills}
                onChange={(e) => handleInputChange('technicalSkills', e.target.value)}
                placeholder="List any programming languages, tools, certifications, or technical skills..."
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Final Steps</h3>
              <p className="text-muted-foreground">Review and submit your application</p>
            </div>

            <div>
              <Label>Background Profile</Label>
              <Select onValueChange={(value) => handleInputChange('selectedPersona', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Which best describes you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="career_pivoter">Career Pivoter - Looking to transition into tech</SelectItem>
                  <SelectItem value="ambitious_newcomer">Ambitious Newcomer - Early in my career journey</SelectItem>
                  <SelectItem value="veteran">Veteran - Military or industry experience</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {recommendedRole && (
              <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                <h4 className="font-semibold text-accent mb-2">Recommended Track</h4>
                <p className="text-sm">Based on your quiz results, we recommend the <strong>{recommendedRole}</strong> track.</p>
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What happens next?</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• We'll review your application within 48 hours</li>
                <li>• If selected, you'll receive an invitation for a brief interview</li>
                <li>• Accepted candidates get early access to course materials</li>
                <li>• Program starts with our next cohort</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Application for Gigawatt Academy</CardTitle>
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </CardHeader>
      <CardContent>
        {renderStep()}
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              className="btn-hero"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-hero"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};