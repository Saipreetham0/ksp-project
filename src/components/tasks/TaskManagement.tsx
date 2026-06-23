"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Users,
  Target,
  CheckCircle,
  Circle,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  XCircle,
  BarChart3,
  KanbanSquare,
  List,
  RefreshCw,
  Flag,
  MessageSquare,
  Paperclip,
  Timer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";
import { toast } from "@/hooks/use-toast";

// Types based on PRD and database schema
interface Task {
  id: number;
  task_number: string;
  title: string;
  description: string;
  order_id: number;
  order_title?: string;
  order_number?: string;
  parent_task_id?: number;
  assigned_to?: string;
  assigned_name?: string;
  assigned_avatar?: string;
  created_by: string;
  created_by_name?: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress_percentage: number;
  estimated_hours?: number;
  actual_hours?: number;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  depends_on?: number[];
  blocks?: number[];
  tags?: string[];
  checklist?: any[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface TaskFilters {
  status: string;
  priority: string;
  assignee: string;
  order: string;
  due_date: string;
}

// Task status configurations (as per PRD: To-Do, In Progress, Done)
const TASK_STATUSES = {
  todo: {
    label: 'To-Do',
    color: 'bg-gray-100 text-gray-700',
    icon: Circle,
    description: 'Task not yet started',
    boardColor: 'bg-gray-50 border-gray-200'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-700',
    icon: PlayCircle,
    description: 'Task is being worked on',
    boardColor: 'bg-blue-50 border-blue-200'
  },
  done: {
    label: 'Done',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    description: 'Task completed successfully',
    boardColor: 'bg-green-50 border-green-200'
  },
  blocked: {
    label: 'Blocked',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
    description: 'Task is blocked by dependencies',
    boardColor: 'bg-red-50 border-red-200'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-600',
    icon: XCircle,
    description: 'Task has been cancelled',
    boardColor: 'bg-gray-50 border-gray-300'
  },
};

const PRIORITY_CONFIGS = {
  low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-100', icon: '🟢' },
  medium: { label: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '🟡' },
  high: { label: 'High', color: 'text-orange-600', bg: 'bg-orange-100', icon: '🟠' },
  urgent: { label: 'Urgent', color: 'text-red-600', bg: 'bg-red-100', icon: '🔴' },
};

export function TaskManagement() {
  const router = useRouter();
  const { user, session, supabase } = useAuthSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<TaskFilters>({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    order: 'all',
    due_date: 'all',
  });

  // Create task state
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    order_id: '',
    assigned_to: '',
    priority: 'medium' as const,
    estimated_hours: '',
    due_date: '',
    tags: [] as string[],
    notes: '',
  });

  // Available orders and users for dropdowns
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);

  // Fetch tasks from database
  const fetchTasks = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Check user role to determine query scope
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      let query = supabase
        .from('tasks')
        .select(`
          *,
          orders (
            title,
            order_number
          ),
          assignee:user_profiles!tasks_assigned_to_fkey (
            full_name,
            avatar_url
          ),
          creator:user_profiles!tasks_created_by_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      // Apply role-based filtering
      if (userProfile?.role === 'client') {
        // Clients can see tasks for their orders
        query = query.in('order_id', 
          await supabase.from('orders').select('id').eq('user_id', user.id).then(res => 
            res.data?.map(o => o.id) || []
          )
        );
      } else if (userProfile?.role === 'team_member') {
        // Team members can see assigned tasks or tasks they created
        query = query.or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`);
      }
      // Admin and finance can see all tasks

      const { data, error } = await query;

      if (error) throw error;

      // Transform data
      const transformedTasks = data?.map(task => ({
        ...task,
        order_title: task.orders?.title,
        order_number: task.orders?.order_number,
        assigned_name: task.assignee?.full_name,
        assigned_avatar: task.assignee?.avatar_url,
        created_by_name: task.creator?.full_name,
        tags: JSON.parse(task.tags || '[]'),
        checklist: JSON.parse(task.checklist || '[]'),
        depends_on: task.depends_on || [],
        blocks: task.blocks || [],
      })) || [];

      setTasks(transformedTasks);
      setFilteredTasks(transformedTasks);
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error loading tasks",
        description: error.message || "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available orders and users for dropdowns
  const fetchDropdownData = async () => {
    try {
      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, title, order_number')
        .order('created_at', { ascending: false });

      // Fetch team members
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, full_name, avatar_url')
        .in('role', ['admin', 'team_member'])
        .order('full_name');

      setAvailableOrders(orders || []);
      setAvailableUsers(users || []);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
      fetchDropdownData();
    }
  }, [user?.id]);

  // Apply filters and search
  useEffect(() => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.task_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.order_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Assignee filter
    if (filters.assignee !== 'all') {
      filtered = filtered.filter(task => task.assigned_to === filters.assignee);
    }

    // Order filter
    if (filters.order !== 'all') {
      filtered = filtered.filter(task => task.order_id.toString() === filters.order);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filters]);

  // Handle drag and drop
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) return;

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId as Task['status'];

    try {
      setActionLoading(`update-${taskId}`);

      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      if (newStatus === 'done') {
        updates.completed_at = new Date().toISOString();
        updates.progress_percentage = 100;
      } else if (newStatus === 'in_progress') {
        updates.progress_percentage = Math.max(updates.progress_percentage || 0, 10);
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates }
          : task
      ));

      toast({
        title: "Task status updated",
        description: `Task moved to ${TASK_STATUSES[newStatus].label}`,
      });

      // Create notification for assignee
      const task = tasks.find(t => t.id === taskId);
      if (task?.assigned_to && task.assigned_to !== user?.id) {
        await supabase.rpc('create_notification', {
          p_user_id: task.assigned_to,
          p_title: 'Task Status Updated',
          p_message: `Task "${task.title}" status changed to ${TASK_STATUSES[newStatus].label}`,
          p_type: 'task_updated',
          p_task_id: taskId
        });
      }

      // Recalculate order progress
      if (task?.order_id) {
        await supabase.rpc('calculate_order_progress', {
          order_id: task.order_id
        });
      }

    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Create new task
  const handleCreateTask = async () => {
    try {
      setActionLoading('create');

      if (!newTaskData.title || !newTaskData.order_id) {
        toast({
          title: "Validation Error",
          description: "Please fill in required fields",
          variant: "destructive",
        });
        return;
      }

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        return;
      }

      const taskData = {
        title: newTaskData.title,
        description: newTaskData.description,
        order_id: parseInt(newTaskData.order_id),
        assigned_to: newTaskData.assigned_to || null,
        created_by: user.id,
        priority: newTaskData.priority,
        estimated_hours: newTaskData.estimated_hours ? parseFloat(newTaskData.estimated_hours) : null,
        due_date: newTaskData.due_date || null,
        tags: JSON.stringify(newTaskData.tags),
        notes: newTaskData.notes,
        status: 'todo',
        progress_percentage: 0,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Task created successfully! ✅",
        description: `Task "${newTaskData.title}" has been created`,
      });

      setShowCreateTask(false);
      fetchTasks();

      // Reset form
      setNewTaskData({
        title: '',
        description: '',
        order_id: '',
        assigned_to: '',
        priority: 'medium',
        estimated_hours: '',
        due_date: '',
        tags: [],
        notes: '',
      });

      // Create notification for assignee
      if (newTaskData.assigned_to && newTaskData.assigned_to !== user.id) {
        await supabase.rpc('create_notification', {
          p_user_id: newTaskData.assigned_to,
          p_title: 'New Task Assigned',
          p_message: `You have been assigned a new task: "${newTaskData.title}"`,
          p_type: 'task_assigned',
          p_task_id: data.id,
          p_action_url: `/tasks/${data.id}`,
          p_action_label: 'View Task'
        });
      }

    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Group tasks by status for Kanban view
  const groupedTasks = Object.keys(TASK_STATUSES).reduce((acc, status) => {
    acc[status] = filteredTasks.filter(task => task.status === status);
    return acc;
  }, {} as Record<string, Task[]>);

  // Task Statistics
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length,
    assignedToMe: tasks.filter(t => t.assigned_to === user?.id).length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0,
  };

  if (!session || !user) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Statistics */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
            <p className="text-gray-600 mt-1">Organize and track project tasks with due dates & priorities</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => setViewMode(viewMode === 'kanban' ? 'list' : 'kanban')}
            >
              {viewMode === 'kanban' ? <List className="w-4 h-4 mr-2" /> : <KanbanSquare className="w-4 h-4 mr-2" />}
              {viewMode === 'kanban' ? 'List View' : 'Kanban View'}
            </Button>
            <Button 
              variant="outline"
              onClick={fetchTasks}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={() => setShowCreateTask(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
                    <p className="text-xs text-blue-600">{taskStats.assignedToMe} assigned to me</p>
                  </div>
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-green-600">{taskStats.completionRate}%</p>
                    <p className="text-xs text-green-600">{taskStats.done} completed</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
                    <p className="text-xs text-gray-500">{taskStats.todo} pending</p>
                  </div>
                  <PlayCircle className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
                    <p className="text-xs text-red-600">{taskStats.blocked} blocked</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(TASK_STATUSES).map(([status, config]) => (
                    <SelectItem key={status} value={status}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  {Object.entries(PRIORITY_CONFIGS).map(([priority, config]) => (
                    <SelectItem key={priority} value={priority}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.assignee} onValueChange={(value) => setFilters(prev => ({ ...prev, assignee: value }))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  <SelectItem value={user.id}>My Tasks</SelectItem>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Views */}
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-8 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms or filters' : 'Create your first task to get started'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 min-h-[600px]">
            {Object.entries(TASK_STATUSES).map(([status, config]) => (
              <div key={status} className={`rounded-lg border-2 ${config.boardColor} p-4`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <config.icon className="w-5 h-5" />
                    <h3 className="font-semibold">{config.label}</h3>
                  </div>
                  <Badge variant="outline">{groupedTasks[status]?.length || 0}</Badge>
                </div>
                
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[500px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50 bg-opacity-50' : ''
                      }`}
                    >
                      <AnimatePresence>
                        {groupedTasks[status]?.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                // dnd drag props clash with framer-motion's own
                                // drag/pan handler types; spread is safe at runtime.
                                {...(provided.draggableProps as unknown as Record<string, unknown>)}
                                {...(provided.dragHandleProps as unknown as Record<string, unknown>)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`bg-white rounded-lg border p-4 cursor-pointer hover:shadow-md transition-all ${
                                  snapshot.isDragging ? 'shadow-lg rotate-3' : ''
                                } ${actionLoading === `update-${task.id}` ? 'opacity-50' : ''}`}
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowTaskDetails(true);
                                }}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                                      <p className="text-xs text-gray-600 mt-1">{task.task_number}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Badge variant="outline" className={`${PRIORITY_CONFIGS[task.priority].bg} ${PRIORITY_CONFIGS[task.priority].color} text-xs`}>
                                        {PRIORITY_CONFIGS[task.priority].icon}
                                      </Badge>
                                    </div>
                                  </div>
                                  
                                  {task.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
                                  )}
                                  
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{task.order_number}</span>
                                    {task.due_date && (
                                      <span className={new Date(task.due_date) < new Date() ? 'text-red-500' : ''}>
                                        {new Date(task.due_date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {task.progress_percentage > 0 && task.status !== 'done' && (
                                    <div>
                                      <div className="flex items-center justify-between text-xs mb-1">
                                        <span>Progress</span>
                                        <span>{task.progress_percentage}%</span>
                                      </div>
                                      <Progress value={task.progress_percentage} className="h-1" />
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    {task.assigned_to && (
                                      <Avatar className="w-6 h-6">
                                        <AvatarImage src={task.assigned_avatar} />
                                        <AvatarFallback className="text-xs">
                                          {task.assigned_name?.charAt(0) || 'A'}
                                        </AvatarFallback>
                                      </Avatar>
                                    )}
                                    <div className="flex items-center gap-1">
                                      {task.estimated_hours && (
                                        <span className="text-xs text-gray-500">{task.estimated_hours}h</span>
                                      )}
                                      {task.tags && task.tags.length > 0 && (
                                        <span className="text-xs text-blue-600">#{task.tags[0]}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        /* List View - placeholder for now */
        <Card>
          <CardContent className="p-8 text-center">
            <List className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">List View</h3>
            <p className="text-gray-600">List view implementation coming soon...</p>
          </CardContent>
        </Card>
      )}

      {/* Create Task Dialog */}
      <Dialog open={showCreateTask} onOpenChange={setShowCreateTask}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to track project progress
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task_title">Task Title *</Label>
              <Input
                id="task_title"
                placeholder="Enter task title"
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task_description">Description</Label>
              <Textarea
                id="task_description"
                placeholder="Describe the task in detail"
                value={newTaskData.description}
                onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order_id">Order *</Label>
                <Select value={newTaskData.order_id} onValueChange={(value) => setNewTaskData({ ...newTaskData, order_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id.toString()}>
                        {order.order_number} - {order.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assign To</Label>
                <Select value={newTaskData.assigned_to} onValueChange={(value) => setNewTaskData({ ...newTaskData, assigned_to: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTaskData.priority} onValueChange={(value) => setNewTaskData({ ...newTaskData, priority: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIGS).map(([priority, config]) => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center gap-2">
                          <span>{config.icon}</span>
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0"
                  value={newTaskData.estimated_hours}
                  onChange={(e) => setNewTaskData({ ...newTaskData, estimated_hours: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newTaskData.due_date}
                  onChange={(e) => setNewTaskData({ ...newTaskData, due_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or requirements"
                value={newTaskData.notes}
                onChange={(e) => setNewTaskData({ ...newTaskData, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTask(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTask} 
              disabled={actionLoading === 'create'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {actionLoading === 'create' ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Task Details - {selectedTask?.task_number}</span>
              <Badge className={selectedTask ? TASK_STATUSES[selectedTask.status].color : ''}>
                {selectedTask ? TASK_STATUSES[selectedTask.status].label : ''}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Complete task information and progress tracking
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Task Title</label>
                    <p className="text-sm font-medium">{selectedTask.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-sm text-gray-600">{selectedTask.description || 'No description'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Order</label>
                    <p className="text-sm">{selectedTask.order_number} - {selectedTask.order_title}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <Badge variant="outline" className={`${PRIORITY_CONFIGS[selectedTask.priority].bg} ${PRIORITY_CONFIGS[selectedTask.priority].color}`}>
                      {PRIORITY_CONFIGS[selectedTask.priority].icon} {PRIORITY_CONFIGS[selectedTask.priority].label}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assigned To</label>
                    <div className="flex items-center gap-2">
                      {selectedTask.assigned_to ? (
                        <>
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={selectedTask.assigned_avatar} />
                            <AvatarFallback>{selectedTask.assigned_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{selectedTask.assigned_name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">Unassigned</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                    <p className="text-sm">
                      {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedTask.progress_percentage > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Progress</span>
                    <span className="text-lg font-bold">{selectedTask.progress_percentage}%</span>
                  </div>
                  <Progress value={selectedTask.progress_percentage} className="h-3" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedTask.estimated_hours && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Estimated Hours</label>
                    <p className="text-lg font-bold text-blue-600">{selectedTask.estimated_hours}h</p>
                  </div>
                )}
                {selectedTask.actual_hours && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Actual Hours</label>
                    <p className="text-lg font-bold text-green-600">{selectedTask.actual_hours}h</p>
                  </div>
                )}
              </div>

              {selectedTask.notes && (
                <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedTask.notes}</p>
                </div>
              )}

              <div className="text-sm text-gray-500 pt-2 border-t">
                Created by {selectedTask.created_by_name} on {new Date(selectedTask.created_at).toLocaleString()}
                {selectedTask.completed_at && (
                  <span className="block">Completed on {new Date(selectedTask.completed_at).toLocaleString()}</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TaskManagement;