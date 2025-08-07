import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('order_id') as string;
    const taskId = formData.get('task_id') as string;
    const invoiceId = formData.get('invoice_id') as string;
    const description = formData.get('description') as string;
    const accessLevel = (formData.get('access_level') as string) || 'private';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      'application/zip', 'application/x-zip-compressed'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const filename = `${uuidv4()}.${fileExt}`;
    const bucketPath = `attachments/${user.id}/${filename}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(bucketPath, fileBuffer, {
        contentType: file.type,
        duplex: 'half'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('attachments')
      .getPublicUrl(bucketPath);

    // Save attachment record to database
    const attachmentData = {
      filename: filename,
      original_filename: file.name,
      file_path: bucketPath,
      file_url: urlData.publicUrl,
      file_size: file.size,
      mime_type: file.type,
      storage_provider: 'supabase',
      bucket_name: 'attachments',
      uploaded_by: user.id,
      access_level: accessLevel,
      related_order_id: orderId ? parseInt(orderId) : null,
      related_task_id: taskId ? parseInt(taskId) : null,
      related_invoice_id: invoiceId ? parseInt(invoiceId) : null,
      description: description,
      tags: [],
      metadata: {
        upload_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        user_agent: request.headers.get('user-agent')
      }
    };

    const { data: attachment, error: dbError } = await supabase
      .from('attachments')
      .insert([attachmentData])
      .select(`
        *,
        uploader:user_profiles!attachments_uploaded_by_fkey (
          id,
          full_name,
          email,
          display_name
        )
      `)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('attachments').remove([bucketPath]);
      
      return NextResponse.json({ error: 'Failed to save attachment' }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'uploaded',
      entity_type: 'attachment',
      entity_id: attachment.id,
      description: `Uploaded file: ${file.name}`,
      new_values: attachment
    }]);

    // Update related entity with attachment
    if (orderId) {
      const { data: order } = await supabase
        .from('orders')
        .select('attachments')
        .eq('id', parseInt(orderId))
        .single();

      if (order) {
        const updatedAttachments = [
          ...(order.attachments || []),
          {
            id: attachment.id,
            filename: attachment.filename,
            file_url: attachment.file_url,
            file_size: attachment.file_size,
            mime_type: attachment.mime_type,
            uploaded_at: attachment.created_at
          }
        ];

        await supabase
          .from('orders')
          .update({ attachments: updatedAttachments })
          .eq('id', parseInt(orderId));
      }
    }

    if (taskId) {
      const { data: task } = await supabase
        .from('tasks')
        .select('attachments')
        .eq('id', parseInt(taskId))
        .single();

      if (task) {
        const updatedAttachments = [
          ...(task.attachments || []),
          {
            id: attachment.id,
            filename: attachment.filename,
            file_url: attachment.file_url,
            file_size: attachment.file_size,
            mime_type: attachment.mime_type,
            uploaded_at: attachment.created_at
          }
        ];

        await supabase
          .from('tasks')
          .update({ attachments: updatedAttachments })
          .eq('id', parseInt(taskId));
      }
    }

    return NextResponse.json({
      data: attachment,
      success: true,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Attachment upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('order_id');
    const taskId = searchParams.get('task_id');
    const invoiceId = searchParams.get('invoice_id');

    let query = supabase
      .from('attachments')
      .select(`
        *,
        uploader:user_profiles!attachments_uploaded_by_fkey (
          id,
          full_name,
          email,
          display_name
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (orderId) {
      query = query.eq('related_order_id', parseInt(orderId));
    }
    if (taskId) {
      query = query.eq('related_task_id', parseInt(taskId));
    }
    if (invoiceId) {
      query = query.eq('related_invoice_id', parseInt(invoiceId));
    }

    // Apply access control
    query = query.or(`uploaded_by.eq.${user.id},access_level.eq.public`);

    const { data: attachments, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
    }

    return NextResponse.json({
      data: attachments,
      success: true
    });

  } catch (error) {
    console.error('Attachments GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}