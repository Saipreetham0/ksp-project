import { SupabaseClient } from '@supabase/supabase-js';

export interface OrderServiceFilters {
  page?: number;
  limit?: number;
  status?: string;
  user_id?: string;
  search?: string;
}

/**
 * Fetch a paginated list of orders with profile information.
 * Used primarily by server-side routes and lists.
 */
export async function listOrders(
  supabase: SupabaseClient,
  filters: OrderServiceFilters,
  userRole?: string,
  userId?: string
) {
  let query = supabase
    .from('orders')
    .select(`
      *,
      user_profiles!orders_user_id_fkey (
        id,
        full_name,
        email,
        display_name
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  // Apply role-based filtering
  if (userRole === 'user' || userRole === 'client') {
    if (userId) {
      query = query.eq('user_id', userId);
    }
  } else if (filters.user_id && ['admin', 'finance', 'team_lead'].includes(userRole || '')) {
    query = query.eq('user_id', filters.user_id);
  }

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,order_number.ilike.%${filters.search}%`);
  }

  // Pagination
  if (filters.page && filters.limit) {
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);
  }

  return await query;
}

/**
 * Fetch detailed orders with computed fields (from the orders_detailed view/table).
 * Used primarily by the client-side OrdersManagement board.
 */
export async function getDetailedOrders(
  supabase: SupabaseClient,
  userRole?: string,
  userId?: string
) {
  let query = supabase
    .from('orders_detailed')
    .select('*')
    .order('created_at', { ascending: false });

  if (userRole === 'client' && userId) {
    query = query.eq('user_id', userId);
  } else if (userRole === 'team_member' && userId) {
    query = query.or(`primary_assignee.eq.${userId},assigned_team_members.cs.{${userId}}`);
  }

  return await query;
}

/**
 * Fetch a single order by its ID.
 */
export async function getOrderById(supabase: SupabaseClient, orderId: string | number) {
  return await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
}

/**
 * Create a new order.
 */
export async function createOrder(supabase: SupabaseClient, orderData: any) {
  return await supabase
    .from('orders')
    .insert([orderData])
    .select(`
      *,
      user_profiles!orders_user_id_fkey (
        id,
        full_name,
        email,
        display_name
      )
    `)
    .single();
}

/**
 * Update the status of an existing order.
 */
export async function updateOrderStatus(
  supabase: SupabaseClient,
  orderId: number,
  newStatus: string
) {
  return await supabase
    .from('orders')
    .update({ 
      status: newStatus,
      updated_at: new Date().toISOString(),
      ...(newStatus === 'completed' && { completed_at: new Date().toISOString() })
    })
    .eq('id', orderId);
}

/**
 * Log activity for audit trail.
 */
export async function logOrderActivity(
  supabase: SupabaseClient,
  activity: {
    user_id: string;
    action: string;
    entity_id: number;
    description: string;
    new_values?: any;
  }
) {
  return await supabase.from('activity_logs').insert([{
    user_id: activity.user_id,
    action: activity.action,
    entity_type: 'order',
    entity_id: activity.entity_id,
    description: activity.description,
    new_values: activity.new_values || {}
  }]);
}

/**
 * Notify admin users about a new order event.
 */
export async function notifyAdminsOfNewOrder(
  supabase: SupabaseClient,
  order: { id: number; title: string },
  creatorEmail: string
) {
  const { data: adminUsers } = await supabase
    .from('user_profiles')
    .select('id')
    .in('role', ['admin', 'team_lead']);

  if (adminUsers && adminUsers.length > 0) {
    const notifications = adminUsers.map(admin => ({
      user_id: admin.id,
      title: 'New Order Created',
      message: `A new order "${order.title}" has been created by ${creatorEmail}`,
      type: 'order',
      related_order_id: order.id
    }));

    return await supabase.from('notifications').insert(notifications);
  }
}
