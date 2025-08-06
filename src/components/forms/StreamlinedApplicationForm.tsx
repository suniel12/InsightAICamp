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

// Background options matching the quiz Q1 options
const CAREER_BACKGROUNDS = [
  {
    id: 'recent_graduate',
    title: 'Recent Graduate',
    description: 'I have recently completed a degree or certificate program and am looking for my first major career role.'
  },
  {
    id: 'software_engineer',
    title: 'Software Engineer',
    description: 'I have experience in software development, programming, or application development and want to transition to infrastructure.'
  },
  {
    id: 'it_professional',
    title: 'IT Professional',
    description: 'I have experience in help desk, network support, or system administration and I\'m looking to specialize or advance.'
  },
  {
    id: 'skilled_trades',
    title: 'Skilled Trades Professional',
    description: 'I have hands-on experience in electrical, HVAC, mechanical work, or as a general technician.'
  },
  {
    id: 'tech_adjacent',
    title: 'Tech-Adjacent Professional',
    description: 'I work with technology but not core IT (data entry, tech sales, digital marketing) and want to deepen my technical skills.'
  },
  {
    id: 'others',
    title: 'Others',
    description: 'Military/veteran, career changer, or other professional background seeking a stable, high-growth career in tech.'
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
  // Removed multi-step functionality - now single page

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

  const isFormValid = () => {
    return formData.email && 
           formData.fullName && 
           formData.phoneNumber && 
           formData.linkedinProfileUrl && 
           formData.currentLocation && 
           formData.workAuthorizationStatus &&
           formData.resumeFile; // Resume is required since we extract info from it
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
          
          {/* What Happens Next Section */}
          <div className="border-t pt-8 mt-8">
            <h4 className="font-semibold mb-6 text-lg text-center">What happens next?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-semibold text-sm mb-1">1. Rapid Review</div>
                <div className="text-xs text-muted-foreground">Application reviewed within 48 hours</div>
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">2. Brief Interview</div>
                <div className="text-xs text-muted-foreground">Quick call with admissions team</div>
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">3. Early Access</div>
                <div className="text-xs text-muted-foreground">Get course previews & resources</div>
              </div>
              <div>
                <div className="font-semibold text-sm mb-1">4. Program Start</div>
                <div className="text-xs text-muted-foreground">Join our next cohort</div>
              </div>
            </div>
          </div>
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

  const renderSinglePageForm = () => {
    return (
      <div className="space-y-8">
        {/* Personal Information & Resume Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl mb-4">Apply to GigaWatt Academy</CardTitle>
            <p className="text-center text-muted-foreground">
              Complete the form below to begin your journey into AI infrastructure careers
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Resume Upload */}
            <div>
              <Label htmlFor="resume">Resume Upload *</Label>
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
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <div className="text-sm font-medium">Click to select your resume</div>
                        <div className="text-xs text-muted-foreground">
                          PDF, DOC, DOCX, TXT, RTF (Max 5MB)
                        </div>
                      </>
                    )}
                  </div>
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                We'll extract your background, skills, and experience from your resume
              </p>
            </div>

            {recommendedRole && (
              <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                <h4 className="font-semibold text-accent mb-2">🎯 Recommended Track</h4>
                <p className="text-sm">Based on your quiz results, we recommend the <strong>{recommendedRole}</strong> track.</p>
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {renderSinglePageForm()}
      
      {/* Submit Button */}
      <div className="flex justify-center mt-8">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !isFormValid()}
          className="btn-hero px-12 py-6 text-lg"
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
      </div>
    </div>
  );
};