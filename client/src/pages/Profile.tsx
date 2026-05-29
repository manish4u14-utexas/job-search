import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Upload, Sparkles, ArrowLeft, FileText } from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For local development without OAuth, allow access
  const isDevelopment = import.meta.env.DEV;

  const { data: profile, isLoading, refetch } = trpc.profile.get.useQuery();
  const { mutate: updateProfile, isPending } = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      console.error("Profile update error:", error);
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const { mutate: parseResume, isPending: parsingResume } = trpc.profile.parseResume.useMutation({
    onSuccess: (data) => {
      console.log("Resume parsed successfully:", data);
      toast.success("Resume parsed successfully!");
      setFormData({
        resumeText: formData.resumeText,
        skills: data.skills.join(", "),
        jobTitlePreferences: data.jobTitlePreferences.join(", "),
        targetLocations: formData.targetLocations,
        currentJobTitle: data.currentJobTitle,
        yearsOfExperience: data.yearsOfExperience,
      });
      refetch();
    },
    onError: (error) => {
      console.error("Resume parse error:", error);
      toast.error(`Failed to parse resume: ${error.message}`);
    },
  });

  const { mutate: uploadFile, isPending: uploadingFile } = trpc.profile.uploadFile.useMutation({
    onSuccess: (data) => {
      setFormData({ ...formData, resumeText: data.text });
      toast.success("File uploaded! Click 'AUTO-FILL FROM RESUME' to parse.");
      setUploadedFileName("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload file");
      setUploadedFileName("");
    },
  });

  const [formData, setFormData] = useState({
    resumeText: "",
    skills: "",
    jobTitlePreferences: "",
    targetLocations: "",
    currentJobTitle: "",
    yearsOfExperience: 0,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        resumeText: profile.resumeText || "",
        skills: profile.skills?.join(", ") || "",
        jobTitlePreferences: profile.jobTitlePreferences?.join(", ") || "",
        targetLocations: profile.targetLocations?.join(", ") || "",
        currentJobTitle: profile.currentJobTitle || "",
        yearsOfExperience: profile.yearsOfExperience || 0,
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting profile:", formData);
    updateProfile({
      resumeText: formData.resumeText,
      skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      jobTitlePreferences: formData.jobTitlePreferences.split(",").map((s) => s.trim()).filter(Boolean),
      targetLocations: formData.targetLocations.split(",").map((s) => s.trim()).filter(Boolean),
      currentJobTitle: formData.currentJobTitle,
      yearsOfExperience: formData.yearsOfExperience,
    });
  };

  const handleParseResume = () => {
    if (!formData.resumeText) {
      toast.error("Please paste your resume first");
      return;
    }
    console.log("Parsing resume, text length:", formData.resumeText.length);
    toast.info("Parsing resume with AI...");
    parseResume({ resumeText: formData.resumeText });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOCX, or TXT file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploadedFileName(file.name);
    toast.info("Uploading and parsing file...");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64Data = base64.split(",")[1];
        
        // Upload to backend for parsing
        uploadFile({
          fileData: base64Data,
          mimeType: file.type,
          fileName: file.name,
        });
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
        setUploadedFileName("");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload file. Please try again.");
      console.error("File upload error:", error);
      setUploadedFileName("");
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--neon-cyan)', fontSize: '1.5rem' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', color: 'var(--neon-cyan)' }} className="scanlines">
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(0, 245, 255, 0.3)', background: 'linear-gradient(to right, #000, rgba(128, 0, 128, 0.2), #000)' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
          <Button
            variant="outline"
            style={{ marginBottom: '1rem', borderColor: 'var(--neon-cyan)', color: 'var(--neon-cyan)' }}
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Back to Dashboard
          </Button>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: 'var(--neon-pink)', fontFamily: 'Orbitron, sans-serif', textTransform: 'uppercase' }}>
            PROFILE SETTINGS
          </h1>
          <p style={{ color: 'var(--neon-cyan)' }}>Manage your resume and job preferences</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem', paddingTop: '2rem', paddingBottom: '2rem' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Current Job Title */}
            <div className="hud-container">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                Current Job Title
              </label>
              <Input
                value={formData.currentJobTitle}
                onChange={(e) => setFormData({ ...formData, currentJobTitle: e.target.value })}
                disabled={!isEditing}
                style={{ backgroundColor: isEditing ? '#1a1a2e' : '#0a0a0f', color: 'var(--neon-cyan)', borderColor: 'var(--neon-cyan)' }}
              />
            </div>

            {/* Years of Experience */}
            <div className="hud-container">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                Years of Experience
              </label>
              <Input
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })}
                disabled={!isEditing}
                style={{ backgroundColor: isEditing ? '#1a1a2e' : '#0a0a0f', color: 'var(--neon-cyan)', borderColor: 'var(--neon-cyan)' }}
              />
            </div>

            {/* Skills */}
            <div className="hud-container">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                Skills (comma-separated)
              </label>
              <Textarea
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Python, GenAI, Product Management, Azure, LangGraph"
                style={{ backgroundColor: isEditing ? '#1a1a2e' : '#0a0a0f', color: 'var(--neon-cyan)', borderColor: 'var(--neon-cyan)', minHeight: '100px' }}
              />
            </div>

            {/* Job Title Preferences */}
            <div className="hud-container">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                Job Title Preferences (comma-separated)
              </label>
              <Textarea
                value={formData.jobTitlePreferences}
                onChange={(e) => setFormData({ ...formData, jobTitlePreferences: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Product Manager, AI Product Lead, GenAI Engineer"
                style={{ backgroundColor: isEditing ? '#1a1a2e' : '#0a0a0f', color: 'var(--neon-cyan)', borderColor: 'var(--neon-cyan)', minHeight: '100px' }}
              />
            </div>

            {/* Target Locations */}
            <div className="hud-container">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                Target Locations (comma-separated)
              </label>
              <Textarea
                value={formData.targetLocations}
                onChange={(e) => setFormData({ ...formData, targetLocations: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., San Francisco, Remote, New York"
                style={{ backgroundColor: isEditing ? '#1a1a2e' : '#0a0a0f', color: 'var(--neon-cyan)', borderColor: 'var(--neon-cyan)', minHeight: '100px' }}
              />
            </div>

            {/* Resume Text */}
            <div className="hud-container">
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--neon-cyan)', fontWeight: 'bold' }}>
                Resume Content
              </label>
              
              {/* File Upload Section */}
              {isEditing && (
                <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(0, 245, 255, 0.05)', borderRadius: '0.5rem', border: '1px solid rgba(0, 245, 255, 0.2)' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <Button
                      type="button"
                      className="btn-neon"
                      onClick={triggerFileUpload}
                      disabled={uploadingFile}
                    >
                      <Upload style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                      {uploadingFile ? "UPLOADING..." : "UPLOAD RESUME FILE"}
                    </Button>
                    {uploadedFileName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-green)' }}>
                        <FileText style={{ width: '1rem', height: '1rem' }} />
                        <span>{uploadedFileName}</span>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                    Supported formats: PDF, DOCX, DOC, TXT (max 5MB)
                  </p>
                </div>
              )}
              
              <Textarea
                value={formData.resumeText}
                onChange={(e) => setFormData({ ...formData, resumeText: e.target.value })}
                disabled={!isEditing}
                placeholder="Upload a file above or paste your resume content here..."
                style={{ backgroundColor: isEditing ? '#1a1a2e' : '#0a0a0f', color: 'var(--neon-cyan)', borderColor: 'var(--neon-cyan)', minHeight: '200px' }}
              />
              {isEditing && formData.resumeText && (
                <Button
                  type="button"
                  className="btn-neon"
                  style={{ marginTop: '0.75rem' }}
                  onClick={handleParseResume}
                  disabled={parsingResume}
                >
                  <Sparkles style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                  {parsingResume ? "PARSING..." : "AUTO-FILL FROM RESUME"}
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              {!isEditing ? (
                <Button
                  type="button"
                  className="btn-neon"
                  onClick={() => setIsEditing(true)}
                >
                  EDIT PROFILE
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    className="btn-neon"
                    style={{ backgroundColor: '#666', borderColor: '#666' }}
                    onClick={() => setIsEditing(false)}
                  >
                    CANCEL
                  </Button>
                  <Button
                    type="submit"
                    className="btn-neon"
                    disabled={isPending}
                  >
                    <Save style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                    {isPending ? "SAVING..." : "SAVE PROFILE"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
