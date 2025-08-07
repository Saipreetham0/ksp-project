"use client";

import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Clock, User, AlertCircle, CheckCircle2, Calendar, Plus } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

interface TaskBoardProps {
  orderId?: number;
  showCreateButton?: boolean;
  onTaskCreate?: () => void;
  onTaskUpdate?: (task: Task) => void;
}

const TASK_COLUMNS: { status: TaskStatus; title: string; color: string }[] = [
  { status: 'todo', title: 'To Do', color: 'bg-slate-100' },
  { status: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { status: 'review', title: 'Review', color: 'bg-yellow-100' },
  { status: 'done', title: 'Done', color: 'bg-green-100' },
];

export default function TaskBoard({ 
  orderId, 
  showCreateButton = true, 
  onTaskCreate,
  onTaskUpdate 
}: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (orderId) params.set('order_id', orderId.toString());
      params.set('limit', '100'); // Get all tasks for board view

      const response = await fetch(`/api/tasks?${params}`);
      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.error || 'Failed to fetch tasks');
      }

      setTasks(data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [orderId]);

  const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task status');
      }

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));

      onTaskUpdate?.(data.data);

      toast({
        title: 'Success',
        description: 'Task status updated successfully'
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update task status',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-3 h-3" />;
      case 'high': return <AlertCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask && draggedTask.status !== status) {
      handleStatusChange(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Task Board</h2>
          <p className="text-gray-600">
            {orderId ? 'Tasks for this order' : 'All your tasks'} ({tasks.length} total)
          </p>
        </div>
        
        {showCreateButton && onTaskCreate && (
          <Button onClick={onTaskCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Button>
        )}
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TASK_COLUMNS.map((column) => (
          <div
            key={column.status}
            className={cn(
              "min-h-[500px] rounded-lg p-4",
              column.color,
              "border-2 border-dashed border-transparent transition-colors",
              draggedTask && "border-gray-300"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(column.status)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{column.title}</h3>
              <Badge variant="secondary">
                {getTasksByStatus(column.status).length}
              </Badge>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {getTasksByStatus(column.status).map((task) => (
                <Card
                  key={task.id}
                  className="cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(task)}
                  onDragEnd={handleDragEnd}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {task.title}
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        {getPriorityIcon(task.priority)}
                        <Badge 
                          variant={getPriorityColor(task.priority) as any}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Description */}
                    {task.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Progress */}
                    {task.progress_percentage > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Progress</span>
                          <span>{task.progress_percentage}%</span>
                        </div>
                        <Progress value={task.progress_percentage} className="h-2" />
                      </div>
                    )}

                    {/* Assigned User */}
                    {(task as any).assigned_user && (
                      <div className="flex items-center gap-2 mb-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={(task as any).assigned_user.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {((task as any).assigned_user.full_name || (task as any).assigned_user.display_name || 'U')[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600">
                          {(task as any).assigned_user.full_name || (task as any).assigned_user.display_name}
                        </span>
                      </div>
                    )}

                    {/* Due Date */}
                    {task.due_date && (
                      <div className="flex items-center gap-1 mb-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className={cn(
                          "text-xs",
                          new Date(task.due_date) < new Date() ? "text-red-600" : "text-gray-600"
                        )}>
                          {formatDate(task.due_date)}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {task.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{task.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Quick Status Change */}
                    <Select 
                      value={task.status} 
                      onValueChange={(value) => handleStatusChange(task.id, value as TaskStatus)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_COLUMNS.map((col) => (
                          <SelectItem key={col.status} value={col.status}>
                            {col.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}

              {/* Empty State */}
              {getTasksByStatus(column.status).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-12 h-12 mx-auto mb-2 opacity-50">
                    <CheckCircle2 className="w-full h-full" />
                  </div>
                  <p className="text-sm">No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}