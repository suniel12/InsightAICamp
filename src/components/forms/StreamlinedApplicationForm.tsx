import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, Upload, FileText } from 'lucide-react';

interface ApplicationFormProps {
  recommendedRole?: string;
  onClose?: () => void;
}

interface ApplicationData {
  email: string;
  fullName: string;
  phoneNumber: string;
  linkedinProfileUrl: string;
  currentLocation: string;
  workAuthorizationStatus: string;
  resumeFile: File | null;
  resumeUrl: string;
  essayAnswers: {
    motivation: string;
    careerGoals: string;
  };
  selectedPersona: string;
}

// Quiz Q1 options for Step 3
const CAREER_BACKGROUNDS = [
  {
    id: 'recent_graduate',
    title: 'Recent Graduate',
    description: 'I have recently completed a degree or certificate program and am looking for my first major career role.'
  },
  {
    id: 'it_professional',
    title: 'IT Professional',
    description: 'I have experience in a role like help desk, network support, or system administration and I\'m looking to specialize or advance.'
  },
  {
    id: 'skilled_trades',
    title: 'Skilled Trades Professional',
    description: 'I have hands-on experience in a field like electrical, HVAC, mechanical, or as a general technician.'
  },
  {
    id: 'military_veteran',
    title: 'Military/Veteran',
    description: 'I am transitioning from or have prior military service and am looking to apply my skills in a new field.'
  },
  {
    id: 'career_changer',
    title: 'Career Changer',
    description: 'I\'m from a non-technical field (e.g., retail, hospitality, etc.) and am looking for a stable, high-growth career in tech.'
  }
];

// Utility function to check storage setup
const checkStorageSetup = async () => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }
    
    const resumesBucket = buckets?.find(bucket => bucket.id === 'resumes');
    if (!resumesBucket) {
      console.error('Resumes bucket not found. Available buckets:', buckets?.map(b => b.id));
      return false;
    }
    
    console.log('Storage setup verified. Resumes bucket exists:', resumesBucket);
    return true;
  } catch (error) {
    console.error('Error checking storage setup:', error);
    return false;
  }
};

export const StreamlinedApplicationForm: React.FC<ApplicationFormProps> = ({ recommendedRole, onClose }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState<ApplicationData>({
    email: '',
    fullName: '',
    phoneNumber: '',
    linkedinProfileUrl: '',
    currentLocation: '',
    workAuthorizationStatus: '',
    resumeFile: null,
    resumeUrl: '',
    essayAnswers: {
      motivation: '',
      careerGoals: ''
    },
    selectedPersona: ''
  });

  const handleInputChange = (field: keyof ApplicationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    if (!file) return '';

    setIsUploadingFile(true);
    
    try {
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 5MB limit`);
      }

      // Validate file type with more comprehensive checking
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'text/plain',
        'application/rtf'
      ];
      
      const allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        throw new Error('Please upload a PDF, DOC, DOCX, TXT, or RTF file');
      }

      // Generate secure, unique filename for PRIVATE storage
      const timestamp = Date.now();
      const randomId = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
      const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 50);
      // Store in private folder structure: resumes/timestamp_randomId_filename
      const fileName = `private/${timestamp}_${randomId}_${sanitizedOriginalName}`;

      console.log('Starting PRIVATE upload:', {
        fileName,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        type: file.type
      });

      // Upload to PRIVATE Supabase Storage 
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false, 
          contentType: file.type
        });

      if (error) {
        console.error('Private storage upload error:', error);
        
        // Handle specific Supabase errors
        if (error.message.includes('Bucket not found')) {
          throw new Error('Resume storage bucket not found. Please contact support.');
        } else if (error.message.includes('The resource already exists')) {
          throw new Error('A file with this name already exists. Please try again.');
        } else if (error.message.includes('Row Level Security') || error.message.includes('policy')) {
          throw new Error('Upload permissions not configured correctly. Please contact support.');
        } else {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }

      if (!data || !data.path) {
        throw new Error('Upload completed but no file path returned');
      }

      console.log('Private upload successful:', data);
      
      // For private storage, we store the file path (not a public URL)
      // Only admins will be able to access these files
      const filePath = data.path;
      
      toast({
        title: "Resume Uploaded Securely!",
        description: `${file.name} has been uploaded and is securely stored.`,
      });
      
      // Return the file path instead of public URL for private storage
      return filePath;
      
    } catch (error: any) {
      console.error('Private file upload error:', error);
      
      // Provide user-friendly error messages
      let userMessage = error.message;
      if (error.message.includes('Failed to fetch')) {
        userMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('storage')) {
        userMessage = 'File storage error. Please try again or contact support.';
      }
      
      toast({
        title: "Secure Upload Failed",
        description: userMessage,
        variant: "destructive"
      });
      
      return '';
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      let resumeUrl = formData.resumeUrl;
      
      // Upload resume if file is selected
      if (formData.resumeFile) {
        resumeUrl = await handleFileUpload(formData.resumeFile);
        if (!resumeUrl) {
          setIsSubmitting(false);
          return;
        }
      }

      // Create application without any authentication - completely anonymous
      const applicationData = {
        application_status: 'submitted' as const,
        submitted_at: new Date().toISOString(),
        email_id: formData.email,
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        linkedin_profile_url: formData.linkedinProfileUrl,
        current_location: formData.currentLocation,
        work_authorization_status: formData.workAuthorizationStatus,
        background_type: formData.selectedPersona,
        resume_url: resumeUrl || null,
        essay_answers: formData.essayAnswers,
        user_id: null,
        waitlist_id: null
      };

      // Insert without any authentication context
      const { data, error } = await supabase
        .from('applications')
        .insert([applicationData])
        .select('id')
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to submit application: ${error.message}`);
      }

      console.log('Application submitted successfully:', data);
      setApplicationId(data.id);
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

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.email && formData.fullName && formData.phoneNumber && 
               formData.linkedinProfileUrl && formData.currentLocation && 
               formData.workAuthorizationStatus;
      case 2:
        return formData.essayAnswers.motivation && formData.essayAnswers.careerGoals;
      case 3:
        return formData.selectedPersona;
      default:
        return false;
    }
  };

  if (isSubmitted && !showAccountCreation) {
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowAccountCreation(true)}
              className="btn-hero"
              style={{ backgroundColor: '#1F5F5F', color: 'white' }}
            >
              Create Account to Track Status
            </Button>
            <Button variant="outline" onClick={onClose}>
              Continue Exploring
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Creating an account will let you track your application status and access course previews.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleAccountCreation = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingAccount(true);

    try {
      // Create user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: password,
      });

      if (authError) {
        throw authError;
      }

      // Link the application to the new user account
      if (authData.user && applicationId) {
        const { error: updateError } = await supabase
          .from('applications')
          .update({ user_id: authData.user.id })
          .eq('id', applicationId);

        if (updateError) {
          console.error('Error linking application to user:', updateError);
          // Don't throw error here - account was created successfully
        }
      }

      toast({
        title: "Account Created!",
        description: "Your account has been created successfully. Please check your email to verify your account.",
      });

      // Close the form after successful account creation
      setTimeout(() => {
        onClose?.();
      }, 2000);

    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: "Account Creation Error",
        description: error.message || "There was an error creating your account. You can try again later.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAccount(false);
    }
  };

  if (showAccountCreation) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
            <p className="text-muted-foreground">
              Set up your account to track your application status and access course materials.
            </p>
          </div>

          <div className="space-y-4 max-w-md mx-auto">
            <div>
              <Label htmlFor="account-email">Email Address</Label>
              <Input
                id="account-email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="password">Create Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password (min 6 characters)"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={handleAccountCreation}
                disabled={isCreatingAccount || !password || !confirmPassword}
                className="btn-hero flex-1"
                style={{ backgroundColor: '#1F5F5F', color: 'white' }}
              >
                {isCreatingAccount ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowAccountCreation(false)}
                disabled={isCreatingAccount}
              >
                Skip for Now
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you'll be able to track your application status and get early access to course previews.
            </p>
          </div>
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
              <p className="text-muted-foreground">Let's start with your contact details</p>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                required
                className="text-base"
              />
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
              <Label htmlFor="linkedin">LinkedIn Profile URL *</Label>
              <Input
                id="linkedin"
                value={formData.linkedinProfileUrl}
                onChange={(e) => handleInputChange('linkedinProfileUrl', e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Required - We use this to verify your professional background
              </p>
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
                  <SelectItem value="authorized">Yes, I am authorized to work in the US</SelectItem>
                  <SelectItem value="requires_sponsorship">No, I require work authorization/sponsorship</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Resume & Motivation</h3>
              <p className="text-muted-foreground">Upload your resume and tell us about your goals</p>
            </div>

            <div>
              <Label htmlFor="resume">Resume Upload</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.rtf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleInputChange('resumeFile', file);
                    }
                  }}
                  className="hidden"
                />
                
                <label htmlFor="resume" className={`cursor-pointer ${isUploadingFile ? 'pointer-events-none opacity-50' : ''}`}>
                  <div className="flex flex-col items-center gap-2">
                    {isUploadingFile ? (
                      <>
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <div className="text-sm font-medium">Uploading to secure storage...</div>
                        <div className="text-xs text-muted-foreground">Please wait</div>
                      </>
                    ) : formData.resumeFile ? (
                      <>
                        <FileText className="w-8 h-8 text-accent" />
                        <div className="text-sm font-medium">{formData.resumeFile.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <div className="text-xs text-blue-600">
                          🔒 Will be securely stored (admin access only)
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <div className="text-sm font-medium">Click to select your resume</div>
                        <div className="text-xs text-muted-foreground">
                          PDF, DOC, DOCX, TXT, RTF (Max 5MB)
                        </div>
                        <div className="text-xs text-blue-600 mt-2">
                          🔒 Private storage - only admissions team can access
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="motivation">Why are you interested in a career in AI infrastructure? *</Label>
              <Textarea
                id="motivation"
                value={formData.essayAnswers.motivation}
                onChange={(e) => handleInputChange('essayAnswers', { ...formData.essayAnswers, motivation: e.target.value })}
                placeholder="Tell us what draws you to this field and why you're excited about AI infrastructure..."
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
                placeholder="Describe your career aspirations and how this program fits into your plans..."
                rows={4}
                required
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold">Background Profile</h3>
              <p className="text-muted-foreground">Which best describes your current career situation?</p>
            </div>

            <div className="space-y-3">
              {CAREER_BACKGROUNDS.map((background) => (
                <div
                  key={background.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    formData.selectedPersona === background.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                  onClick={() => handleInputChange('selectedPersona', background.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                      formData.selectedPersona === background.id
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`} />
                    <div>
                      <h4 className="font-semibold">{background.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{background.description}</p>
                    </div>
                  </div>
                </div>
              ))}
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
              disabled={!isStepValid()}
              className="btn-hero"
              style={{ backgroundColor: '#1F5F5F', color: 'white' }}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid()}
              className="btn-hero"
              style={{ backgroundColor: '#1F5F5F', color: 'white' }}
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