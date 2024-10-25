// src/types/supabase.ts
export type ProjectInquiry = {
    id: string;
    created_at: string;
    name: string;
    email: string;
    phone: string;
    project_details?: string;
    inquiry_type: 'get_started' | 'custom_project';
  }