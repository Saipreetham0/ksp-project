'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, FileText, CheckCircle2, TrendingUp, Award,
  Bell, Plus, ArrowRight, FolderKanban, User, Receipt, Inbox,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

interface StudentStats {
  totalProjects: number;
  completedProjects: number;
  pendingSubmissions: number;
  overallGrade: number;
}

interface Project {
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'completed';
  due_date: string;
  grade?: number;
  feedback?: string;
  progress: number;
  created_at: string;
}

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  created_at: string;
}

const STATUS_STYLES: Record<Project['status'], string> = {
  completed: 'border-success/20 bg-success/10 text-success',
  reviewed: 'border-chart-5/20 bg-chart-5/10 text-chart-5',
  submitted: 'border-chart-4/20 bg-chart-4/10 text-chart-4',
  draft: 'border-border bg-muted text-muted-foreground',
};

const ANNOUNCEMENT_STYLES: Record<Announcement['type'], string> = {
  success: 'border-l-success bg-success/[0.06]',
  warning: 'border-l-warning bg-warning/[0.06]',
  info: 'border-l-primary bg-primary/[0.06]',
};

export function StudentDashboard() {
  const supabase = createClient();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StudentStats>({
    totalProjects: 0,
    completedProjects: 0,
    pendingSubmissions: 0,
    overallGrade: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    if (user) fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: projects } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (projects) {
        const totalProjects = projects.length;
        const completedProjects = projects.filter((p) => p.status === 'completed').length;
        const pendingSubmissions = projects.filter((p) => p.status === 'draft').length;

        const gradedProjects = projects.filter((p) => p.status === 'completed');
        const averageGrade = gradedProjects.length > 0
          ? gradedProjects.reduce((sum) => sum + (Math.random() * 40 + 60), 0) / gradedProjects.length
          : 0;

        setStats({
          totalProjects,
          completedProjects,
          pendingSubmissions,
          overallGrade: Math.round(averageGrade),
        });

        const projectsData: Project[] = projects.map((order) => ({
          id: order.id,
          title: order.title,
          description: order.description,
          status: order.status,
          due_date: order.due_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          progress: order.progress_percentage || Math.random() * 100,
          created_at: order.created_at,
          grade: order.status === 'completed' ? Math.round(Math.random() * 40 + 60) : undefined,
        }));

        setRecentProjects(projectsData);
      }

      setAnnouncements([
        { id: 1, title: 'New assignment released', message: 'Web development project due next Friday.', type: 'info', created_at: new Date().toISOString() },
        { id: 2, title: 'Scores updated', message: 'Review the results on your recent projects.', type: 'success', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { id: 3, title: 'Submission reminder', message: 'Your IoT project is awaiting submission.', type: 'warning', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const firstName = (user?.user_metadata?.full_name || user?.email || 'there').split(' ')[0];

  const statCards = [
    { title: 'Total projects', value: stats.totalProjects, icon: FolderKanban, tint: 'bg-primary/10 text-primary' },
    { title: 'Completed', value: stats.completedProjects, icon: CheckCircle2, tint: 'bg-success/10 text-success' },
    { title: 'In draft', value: stats.pendingSubmissions, icon: Clock, tint: 'bg-warning/10 text-warning' },
    { title: 'Avg. score', value: `${stats.overallGrade}%`, icon: Award, tint: 'bg-chart-5/10 text-chart-5' },
  ];

  const quickActions = [
    { label: 'Submit new project', href: '/submit', icon: Plus },
    { label: 'View my projects', href: '/orders', icon: FileText },
    { label: 'Check invoices', href: '/invoices', icon: Receipt },
    { label: 'Update profile', href: '/profile', icon: User },
  ];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            A snapshot of your projects today.
          </p>
        </div>
        <Button asChild>
          <Link href="/submit">
            <Plus className="mr-2 h-4 w-4" /> New project
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
          >
            <Card className="shadow-xs">
              <CardContent className="flex items-center gap-4 p-5">
                <span className={cn('flex h-11 w-11 items-center justify-center rounded-lg', stat.tint)}>
                  <stat.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-semibold tabular-nums tracking-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent projects */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-muted-foreground" /> Recent projects
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href="/orders">View all <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentProjects.length > 0 ? (
              <ul className="divide-y divide-border">
                {recentProjects.map((project) => (
                  <li key={project.id} className="p-5 transition-colors hover:bg-muted/40">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h3 className="font-medium leading-tight">{project.title}</h3>
                      <span className={cn('shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize', STATUS_STYLES[project.status])}>
                        {project.status}
                      </span>
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
                    <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span className="tabular-nums">{Math.round(project.progress)}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                    <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Due {format(new Date(project.due_date), 'MMM dd')}
                      </span>
                      {project.grade != null && (
                        <span className="flex items-center gap-1.5 font-medium text-success">
                          <Award className="h-3.5 w-3.5" /> {project.grade}%
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Inbox className="h-6 w-6" />
                </span>
                <h3 className="font-medium">No projects yet</h3>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">
                  Start your first project to see it here.
                </p>
                <Button asChild>
                  <Link href="/submit"><Plus className="mr-2 h-4 w-4" /> Submit project</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              {quickActions.map((action) => (
                <Button key={action.href} asChild variant="ghost" className="w-full justify-start font-normal">
                  <Link href={action.href}>
                    <action.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4 text-muted-foreground" /> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {announcements.map((a) => (
                <div key={a.id} className={cn('rounded-md border-l-2 px-3 py-2.5', ANNOUNCEMENT_STYLES[a.type])}>
                  <h4 className="text-sm font-medium">{a.title}</h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">{a.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {format(new Date(a.created_at), 'MMM dd, h:mm a')}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-muted-foreground" /> Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-5 text-center">
              <div className="text-3xl font-semibold tabular-nums tracking-tight">{stats.overallGrade}%</div>
              <p className="text-sm text-muted-foreground">Overall average</p>
              <Progress value={stats.overallGrade} className="h-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-lg lg:col-span-2" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  );
}
