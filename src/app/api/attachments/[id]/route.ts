import { getUserOr401 } from "@/lib/api-auth";
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const user = await getUserOr401(supabase);
    if (user instanceof NextResponse) return user;

    const attachmentId = parseInt((await params).id);
    if (isNaN(attachmentId)) {
      return NextResponse.json({ error: 'Invalid attachment ID' }, { status: 400 });
    }

    // Get attachment details first
    const { data: attachment, error: fetchError } = await supabase
      .from('attachments')
      .select('*')
      .eq('id', attachmentId)
      .single();

    if (fetchError || !attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Check if user has permission to delete (owner or admin)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const canDelete = attachment.uploaded_by === user.id || 
                     ['admin', 'team_lead'].includes(profile?.role || '');

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([attachment.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }

    // Delete attachment record
    const { error: deleteError } = await supabase
      .from('attachments')
      .delete()
      .eq('id', attachmentId);

    if (deleteError) {
      console.error('Database deletion error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 });
    }

    // Remove from related entities
    if (attachment.related_order_id) {
      const { data: order } = await supabase
        .from('orders')
        .select('attachments')
        .eq('id', attachment.related_order_id)
        .single();

      if (order && order.attachments) {
        const updatedAttachments = order.attachments.filter(
          (att: any) => att.id !== attachmentId
        );
        
        await supabase
          .from('orders')
          .update({ attachments: updatedAttachments })
          .eq('id', attachment.related_order_id);
      }
    }

    if (attachment.related_task_id) {
      const { data: task } = await supabase
        .from('tasks')
        .select('attachments')
        .eq('id', attachment.related_task_id)
        .single();

      if (task && task.attachments) {
        const updatedAttachments = task.attachments.filter(
          (att: any) => att.id !== attachmentId
        );
        
        await supabase
          .from('tasks')
          .update({ attachments: updatedAttachments })
          .eq('id', attachment.related_task_id);
      }
    }

    // Log activity
    await supabase.from('activity_logs').insert([{
      user_id: user.id,
      action: 'deleted',
      entity_type: 'attachment',
      entity_id: attachmentId,
      description: `Deleted attachment: ${attachment.original_filename}`,
      old_values: attachment
    }]);

    return NextResponse.json({
      success: true,
      message: 'Attachment deleted successfully'
    });

  } catch (error) {
    console.error('Attachment DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const user = await getUserOr401(supabase);
    if (user instanceof NextResponse) return user;

    const attachmentId = parseInt((await params).id);
    if (isNaN(attachmentId)) {
      return NextResponse.json({ error: 'Invalid attachment ID' }, { status: 400 });
    }

    // Get attachment with uploader info
    const { data: attachment, error } = await supabase
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
      .eq('id', attachmentId)
      .single();

    if (error || !attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }

    // Check access permissions
    const canAccess = attachment.access_level === 'public' || 
                     attachment.uploaded_by === user.id;

    if (!canAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    return NextResponse.json({
      data: attachment,
      success: true
    });

  } catch (error) {
    console.error('Attachment GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}