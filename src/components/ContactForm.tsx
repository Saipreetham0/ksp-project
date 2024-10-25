"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { ProjectInquiry } from "@/types/supabase";

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  formType: "get_started" | "custom_project";
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  project_details: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  isOpen,
  onClose,
  formType,
}) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<FormData>(() => ({
    name: "",
    email: "",
    phone: "",
    project_details: "",
  }));

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      project_details: "",
    });
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.name || !formData.email) {
        throw new Error("Please fill in all required fields");
      }

      if (!formData.email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      const inquiryData: Omit<ProjectInquiry, "id"> = {
        created_at: new Date().toISOString(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        project_details: formData.project_details.trim(),
        inquiry_type: formType,
      };

      const { error: supabaseError } = await supabase
        .from("project_inquiries")
        .insert([inquiryData]);

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      console.error("Form submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {formType === "get_started"
              ? "Get Started"
              : "Request Custom Project"}
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Please fill in your details below and we&apos;ll get back to you shortly.
          </DialogDescription>
        </DialogHeader>

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success!</AlertTitle>
            <AlertDescription className="text-green-700">
              Your inquiry has been submitted successfully. We&apos;ll be in touch
              soon!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your name"
              className={`transition-colors ${
                error && !formData.name
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              className={`transition-colors ${
                error && !formData.email
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="font-medium">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Your phone number"
              disabled={loading || success}
            />
          </div>

          {formType === "custom_project" && (
            <div className="space-y-2">
              <Label htmlFor="project_details" className="font-medium">
                Project Details
              </Label>
              <Input
                id="project_details"
                name="project_details"
                value={formData.project_details}
                onChange={handleInputChange}
                placeholder="Brief description of your project requirements"
                disabled={loading || success}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-medium"
            disabled={loading || success}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </div>
            ) : success ? (
              <div className="flex items-center justify-center">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Submitted
              </div>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactForm;