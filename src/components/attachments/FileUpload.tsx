"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Attachment } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Upload, File, X, Image, FileText, Archive } from 'lucide-react';

interface FileUploadProps {
  orderId?: number;
  taskId?: number;
  invoiceId?: number;
  onUploadComplete?: (attachment: Attachment) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUpload({
  orderId,
  taskId,
  invoiceId,
  onUploadComplete,
  maxFiles = 5,
  maxSize = 10,
  className = ''
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [description, setDescription] = useState('');
  const [accessLevel, setAccessLevel] = useState<'private' | 'team' | 'public'>('private');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of acceptedFiles.slice(0, maxFiles)) {
        await uploadFile(file);
      }
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  }, [maxFiles, orderId, taskId, invoiceId]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', description);
    formData.append('access_level', accessLevel);
    
    if (orderId) formData.append('order_id', orderId.toString());
    if (taskId) formData.append('task_id', taskId.toString());
    if (invoiceId) formData.append('invoice_id', invoiceId.toString());

    // Simulate progress (you can implement real progress tracking with XMLHttpRequest)
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: Math.min((prev[file.name] || 0) + Math.random() * 30, 90)
      }));
    }, 200);

    try {
      const response = await fetch('/api/attachments', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast({
        title: 'Success',
        description: `${file.name} uploaded successfully`
      });

      onUploadComplete?.(data.data);

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload error:', error);
      
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive'
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/zip': ['.zip']
    },
    disabled: uploading
  });

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="w-4 h-4" />;
    } else if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="w-4 h-4" />;
    } else if (['zip', 'rar'].includes(extension || '')) {
      return <Archive className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <Input
            placeholder="Describe this file..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Level
          </label>
          <Select value={accessLevel} onValueChange={(value: any) => setAccessLevel(value)}>
            <SelectTrigger disabled={uploading}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private (Only you)</SelectItem>
              <SelectItem value="team">Team (Team members)</SelectItem>
              <SelectItem value="public">Public (Everyone)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
              ${isDragReject ? 'border-red-400 bg-red-50' : ''}
              ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              <Upload className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop files here' : 'Upload files'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supported: Images, PDF, DOC, XLS, TXT, ZIP (Max {maxSize}MB each, {maxFiles} files max)
                </p>
              </div>

              {!uploading && (
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(fileName)}
                      <span className="text-sm font-medium truncate">
                        {fileName}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Restrictions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Maximum file size: {maxSize}MB per file</p>
        <p>• Maximum files: {maxFiles} files at once</p>
        <p>• Allowed formats: Images, PDF, Documents, Spreadsheets, Text files, Archives</p>
      </div>
    </div>
  );
}