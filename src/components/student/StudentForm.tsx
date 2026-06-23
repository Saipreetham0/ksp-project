'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Upload, FileText, Calendar, User, Book, 
  AlertCircle, CheckCircle, Loader2, X, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/utils/supabase/client';

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  technologies: string[];
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  submissionNotes: string;
}

const CATEGORIES = [
  'Web Development',
  'Mobile App',
  'Desktop Application',
  'IoT Project',
  'Machine Learning',
  'Data Analysis',
  'UI/UX Design',
  'Database Design',
  'Other'
];

const TECHNOLOGIES = [
  'React', 'Next.js', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Java', 'C++', 'JavaScript', 'TypeScript',
  'HTML/CSS', 'Flutter', 'React Native', 'MongoDB',
  'PostgreSQL', 'MySQL', 'Firebase', 'AWS', 'Docker'
];

export function StudentForm() {
  const supabase = createClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    category: '',
    technologies: [],
    dueDate: '',
    priority: 'medium',
    submissionNotes: '',
  });

  const handleInputChange = (field: keyof ProjectFormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTechnologyToggle = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter(t => t !== tech)
        : [...prev.technologies, tech]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Create project/order entry
      const { data: project, error } = await supabase
        .from('orders')
        .insert({
          title: formData.title,
          description: formData.description,
          user_id: user?.id,
          status: 'draft',
          priority: formData.priority,
          due_date: formData.dueDate || null,
          technology: formData.technologies,
          tags: [formData.category],
          notes: formData.submissionNotes,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Upload files if any
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('order_id', project.id.toString());
          formData.append('description', `Project submission file: ${file.name}`);

          const response = await fetch('/api/attachments', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            console.error('Failed to upload file:', file.name);
          }
        }
      }

      toast({
        title: 'Project Submitted!',
        description: 'Your project has been submitted successfully',
        variant: 'default',
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        technologies: [],
        dueDate: '',
        priority: 'medium',
        submissionNotes: '',
      });
      setUploadedFiles([]);

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit project',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Submit New Project 📝
          </h1>
          <p className="text-gray-600">
            Fill out the form below to submit your project for review
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="h-5 w-5 mr-2" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter your project title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Project Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your project, its goals, and key features..."
                    rows={4}
                    required
                  />
                </div>

                {/* Technologies */}
                <div className="space-y-2">
                  <Label>Technologies Used</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                    {TECHNOLOGIES.map((tech) => (
                      <Badge
                        key={tech}
                        variant={formData.technologies.includes(tech) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-blue-100"
                        onClick={() => handleTechnologyToggle(tech)}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  {formData.technologies.length > 0 && (
                    <div className="text-sm text-gray-600">
                      Selected: {formData.technologies.join(', ')}
                    </div>
                  )}
                </div>

                {/* Due Date and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Priority Level</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') => handleInputChange('priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge className={getPriorityColor(formData.priority)}>
                      {formData.priority.toUpperCase()} Priority
                    </Badge>
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Project Files</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png,.txt,.md"
                    />
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop files or{' '}
                      <button
                        type="button"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="text-blue-600 hover:underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      Supported: PDF, DOC, ZIP, Images (Max 10MB each)
                    </p>
                  </div>

                  {/* Uploaded Files List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Files ({uploadedFiles.length})</Label>
                      <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-blue-50 rounded border"
                          >
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-blue-500 mr-2" />
                              <span className="text-sm font-medium">{file.name}</span>
                              <span className="text-xs text-gray-500 ml-2">
                                ({formatFileSize(file.size)})
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submission Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.submissionNotes}
                    onChange={(e) => handleInputChange('submissionNotes', e.target.value)}
                    placeholder="Any additional information for your instructor..."
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Fields marked with * are required
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Project
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Success Message */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <h3 className="font-medium text-green-900">Ready to Submit?</h3>
                    <p className="text-sm text-green-700">
                      Review your information above and click submit when ready.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}