'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, File, Image, FileText, Download, Trash2, Eye, 
  Plus, Search, Filter, MoreHorizontal, AlertCircle,
  Paperclip, FolderOpen, Clock, User, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface Attachment {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  access_level: 'public' | 'private';
  related_order_id?: number;
  related_task_id?: number;
  related_invoice_id?: number;
  description?: string;
  tags: string[];
  uploaded_by: string;
  created_at: string;
  uploader?: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface FileAttachmentsProps {
  entityType?: 'order' | 'task' | 'invoice' | null;
  entityId?: number;
  onAttachmentUploaded?: (attachment: Attachment) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
}

const FILE_TYPES = {
  image: { icon: Image, color: 'text-blue-600', bg: 'bg-blue-100' },
  pdf: { icon: FileText, color: 'text-red-600', bg: 'bg-red-100' },
  document: { icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
  spreadsheet: { icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
  default: { icon: File, color: 'text-gray-600', bg: 'bg-gray-100' },
};

export function FileAttachments({
  entityType = null,
  entityId,
  onAttachmentUploaded,
  maxFiles = 10,
  allowedTypes,
  maxFileSize = 10,
}: FileAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedAttachments, setSelectedAttachments] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Upload form state
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadAccessLevel, setUploadAccessLevel] = useState<'public' | 'private'>('private');

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAttachments();
  }, [entityType, entityId]);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (entityType && entityId) {
        params.append(`${entityType}_id`, entityId.toString());
      }

      const response = await fetch(`/api/attachments?${params}`);
      const result = await response.json();

      if (result.success) {
        setAttachments(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch attachments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadFiles(files);
    if (files.length > 0) {
      setShowUploadDialog(true);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = Array.from(event.dataTransfer.files);
    setUploadFiles(files);
    if (files.length > 0) {
      setShowUploadDialog(true);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    try {
      setUploading(true);

      for (const file of uploadFiles) {
        // Validate file size
        if (file.size > maxFileSize * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large (max ${maxFileSize}MB)`);
        }

        // Validate file type if specified
        if (allowedTypes && !allowedTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} is not allowed`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', uploadDescription);
        formData.append('access_level', uploadAccessLevel);
        
        if (entityType && entityId) {
          formData.append(`${entityType}_id`, entityId.toString());
        }

        const response = await fetch('/api/attachments', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        // Add to local state
        setAttachments(prev => [result.data, ...prev]);

        // Notify parent component
        if (onAttachmentUploaded) {
          onAttachmentUploaded(result.data);
        }
      }

      toast({
        title: 'Success',
        description: `${uploadFiles.length} file(s) uploaded successfully`,
      });

      // Reset form
      setUploadFiles([]);
      setUploadDescription('');
      setUploadAccessLevel('private');
      setShowUploadDialog(false);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      setSelectedAttachments(prev => prev.filter(id => id !== attachmentId));

      toast({
        title: 'Success',
        description: 'Attachment deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete attachment',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (attachment: Attachment) => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.original_filename;
    link.target = '_blank';
    link.click();
  };

  const getFileTypeInfo = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return FILE_TYPES.image;
    } else if (mimeType === 'application/pdf') {
      return FILE_TYPES.pdf;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return FILE_TYPES.document;
    } else if (mimeType.includes('sheet') || mimeType.includes('excel')) {
      return FILE_TYPES.spreadsheet;
    }
    return FILE_TYPES.default;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAttachments = attachments.filter(attachment => {
    const matchesSearch = attachment.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attachment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'images' && attachment.mime_type.startsWith('image/')) ||
                       (filterType === 'documents' && !attachment.mime_type.startsWith('image/'));

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Paperclip className="h-5 w-5 mr-2" />
            Attachments ({attachments.length})
          </h3>
          <p className="text-sm text-gray-600">Upload and manage files</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            accept={allowedTypes?.join(',')}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search attachments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Files</SelectItem>
            <SelectItem value="images">Images</SelectItem>
            <SelectItem value="documents">Documents</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drop Zone */}
      <motion.div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          Drag and drop files here or <span className="text-blue-600 cursor-pointer">browse</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Max file size: {maxFileSize}MB. Max files: {maxFiles}
        </p>
      </motion.div>

      {/* Attachments List */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-6 w-6 border-b-2 border-gray-900"
          />
        </div>
      ) : filteredAttachments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredAttachments.map((attachment, index) => {
              const fileTypeInfo = getFileTypeInfo(attachment.mime_type);
              const FileIcon = fileTypeInfo.icon;
              
              return (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-2 rounded-lg ${fileTypeInfo.bg}`}>
                          <FileIcon className={`h-5 w-5 ${fileTypeInfo.color}`} />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleDownload(attachment)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(attachment.file_url, '_blank')}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(attachment.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-900 truncate" title={attachment.original_filename}>
                          {attachment.original_filename}
                        </h4>
                        
                        {attachment.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {attachment.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{formatFileSize(attachment.file_size)}</span>
                          <Badge 
                            variant="outline" 
                            className={attachment.access_level === 'public' ? 'text-green-600' : 'text-gray-600'}
                          >
                            {attachment.access_level}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src="" />
                            <AvatarFallback className="text-xs">
                              {attachment.uploader?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-600 truncate flex-1">
                            {attachment.uploader?.full_name || 'Unknown'}
                          </span>
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {format(new Date(attachment.created_at), 'MMM d')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attachments yet</h3>
          <p className="text-gray-600 mb-4">Upload files to get started</p>
          <Button onClick={() => document.getElementById('file-upload')?.click()}>
            <Plus className="h-4 w-4 mr-2" />
            Upload First File
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
            <DialogDescription>
              Upload {uploadFiles.length} file(s) with optional details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selected Files</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {uploadFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <File className="h-4 w-4 text-gray-500" />
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="Add a description for these files..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={uploadAccessLevel === 'public'}
                onCheckedChange={(checked) => setUploadAccessLevel(checked ? 'public' : 'private')}
              />
              <Label htmlFor="public">Make files publicly accessible</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}