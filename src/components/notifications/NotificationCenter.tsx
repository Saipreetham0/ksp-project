"use client";

import { useState, useEffect } from 'react';
import { Notification, NotificationType } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Clock, 
  DollarSign, 
  FileText, 
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  className?: string;
  showHeader?: boolean;
  limit?: number;
}

export default function NotificationCenter({ 
  className = '',
  showHeader = true,
  limit = 20
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      
      if (filter === 'unread') {
        params.set('unread_only', 'true');
      }

      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.error || 'Failed to fetch notifications');
      }

      setNotifications(data.data || []);
      
      // Count unread notifications
      const unread = (data.data || []).filter((n: Notification) => !n.read).length;
      setUnreadCount(unread);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter, limit]);

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true, read_at: new Date().toISOString() }
            : notification
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    try {
      await Promise.all(
        unreadNotifications.map(n => markAsRead(n.id))
      );

      toast({
        title: 'Success',
        description: 'All notifications marked as read'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive'
      });
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'task': return <Clock className="w-4 h-4" />;
      case 'payment': return <DollarSign className="w-4 h-4" />;
      case 'order': return <FileText className="w-4 h-4" />;
      case 'invoice': return <FileText className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'task': return 'text-blue-600';
      case 'payment': return 'text-green-600';
      case 'order': return 'text-purple-600';
      case 'invoice': return 'text-orange-600';
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              <div className="flex border rounded-lg p-1">
                <Button
                  variant={filter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="h-7 px-2"
                >
                  All
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                  className="h-7 px-2"
                >
                  Unread
                </Button>
              </div>

              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
                    !notification.read && "bg-blue-50 border-l-4 border-l-blue-500"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn(
                      "p-2 rounded-full",
                      notification.read ? "bg-gray-100" : "bg-blue-100"
                    )}>
                      <div className={getNotificationColor(notification.type)}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={cn(
                          "text-sm font-medium truncate",
                          !notification.read && "font-semibold"
                        )}>
                          {notification.title}
                        </h4>
                        
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.created_at), { 
                              addSuffix: true 
                            })}
                          </span>
                          
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Related entities */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(notification as any).related_order && (
                          <Badge variant="outline" className="text-xs">
                            Order: {(notification as any).related_order.order_number}
                          </Badge>
                        )}
                        
                        {(notification as any).related_task && (
                          <Badge variant="outline" className="text-xs">
                            Task: {(notification as any).related_task.title}
                          </Badge>
                        )}
                        
                        {(notification as any).related_invoice && (
                          <Badge variant="outline" className="text-xs">
                            Invoice: {(notification as any).related_invoice.invoice_number}
                          </Badge>
                        )}
                      </div>

                      {/* Action button */}
                      {notification.action_label && notification.action_url && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-2 text-blue-600"
                        >
                          {notification.action_label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}