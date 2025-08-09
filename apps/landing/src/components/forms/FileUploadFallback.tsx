import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, Loader2, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface FileUploadFallbackProps {
  onFileSelect: (file: File, dataUrl: string) => void;
  currentFile: File | null;
  isUploading: boolean;
  onClear: () => void;
}

export const FileUploadFallback: React.FC<FileUploadFallbackProps> = ({
  onFileSelect,
  currentFile,
  isUploading,
  onClear
}) => {
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/rtf'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload a PDF, DOC, DOCX, TXT, or RTF file');
      }

      // Convert file to base64 for temporary storage
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onFileSelect(file, dataUrl);
        toast({
          title: "File Selected",
          description: "Your resume is ready to submit with your application.",
        });
      };
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      reader.readAsDataURL(file);

    } catch (error: any) {
      toast({
        title: "File Error",
        description: error.message || "Failed to process file. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div>
      <Label htmlFor="resume-fallback">Resume Upload</Label>
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center relative">
        <input
          id="resume-fallback"
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        
        <label htmlFor="resume-fallback" className={`cursor-pointer ${isUploading ? 'pointer-events-none opacity-50' : ''}`}>
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <div className="text-sm font-medium">Processing...</div>
                <div className="text-xs text-muted-foreground">Please wait</div>
              </>
            ) : currentFile ? (
              <>
                <FileText className="w-8 h-8 text-accent" />
                <div className="text-sm font-medium">{currentFile.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
                <div className="text-xs text-accent">✓ Ready to submit</div>
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
        
        {currentFile && !isUploading && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onClear}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        Your resume will be attached to your application. We accept most common formats.
      </p>
    </div>
  );
};