'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, Copy, DollarSign, UserPlus, Link as LinkIcon, Award } from 'lucide-react'
import { toast } from 'sonner'

// Types
interface Project {
  id: string
  title: string
  description: string
  type: string
  technology: string
  timeline: number
  team_size: number
  status: string
  created_at: string
  user_id: string
  delivery_status: string
  amount: number
  payment_status: string
  tracking_link: string
}

interface ReferredUser {
  id: string
  name: string
  email: string
  phone: string
  totalProjects: number
  earnings: number
  created_at: string
  referrer_id: string
}

interface Stats {
  totalReferrals: number
  pendingAmount: number
  earnedAmount: number
  activeReferrals: number
}

interface MonthlyEarning {
  month: string
  amount: number
}

interface NewUser {
  name: string
  email: string
  phone: string
}

const StudentReferralDashboard: React.FC = () => {
  const supabase = createClientComponentClient()
  const [referralCode, setReferralCode] = useState<string>('')
  const [referralLink, setReferralLink] = useState<string>('')
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState<NewUser>({ name: '', email: '', phone: '' })
  const [stats, setStats] = useState<Stats>({
    totalReferrals: 0,
    pendingAmount: 0,
    earnedAmount: 0,
    activeReferrals: 0
  })
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([])
  const [projectEarnings, setProjectEarnings] = useState<MonthlyEarning[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const setupUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setReferralCode(user.id.slice(0, 8))
        setReferralLink(`${window.location.origin}/register?ref=${user.id.slice(0, 8)}`)
        await fetchDashboardData(user.id)
      }
    }

    setupUser()
  }, [])

  const fetchDashboardData = async (userId: string) => {
    try {
      setLoading(true)

      // Fetch referred users
      const { data: users, error: usersError } = await supabase
        .from('referred_users')
        .select('*')
        .eq('referrer_id', userId)

      if (usersError) throw usersError

      // Fetch projects for earnings calculation
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)

      if (projectsError) throw projectsError

      // Calculate stats
      const activeProjects = projects.filter(p => p.status === 'active')
      const pendingPayments = projects.filter(p => p.payment_status === 'pending')
      const completedPayments = projects.filter(p => p.payment_status === 'completed')

      setStats({
        totalReferrals: users.length,
        pendingAmount: pendingPayments.reduce((acc, curr) => acc + (curr.amount * 0.1), 0),
        earnedAmount: completedPayments.reduce((acc, curr) => acc + (curr.amount * 0.1), 0),
        activeReferrals: activeProjects.length
      })

      // Process users data with their projects
      const processedUsers = await Promise.all(users.map(async (user) => {
        const { data: userProjects } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)

        return {
          ...user,
          totalProjects: userProjects?.length || 0,
          earnings: userProjects?.reduce((acc, curr) => acc + (curr.amount * 0.1), 0) || 0
        }
      }))

      setReferredUsers(processedUsers)

      // Calculate monthly earnings
      const monthlyEarnings = projects.reduce((acc: Record<string, number>, project) => {
        const month = new Date(project.created_at).toLocaleString('default', { month: 'short', year: 'numeric' })
        acc[month] = (acc[month] || 0) + (project.amount * 0.1)
        return acc
      }, {})

      setProjectEarnings(Object.entries(monthlyEarnings).map(([month, amount]) => ({
        month,
        amount
      })))

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('referred_users')
        .insert([
          {
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            referrer_id: user.id
          }
        ])
        .select()

      if (error) throw error

      setReferredUsers([...referredUsers, {
        ...data[0],
        totalProjects: 0,
        earnings: 0
      }])

      setShowAddUser(false)
      setNewUser({ name: '', email: '', phone: '' })
      toast.success('User added successfully')
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error('Failed to add user')
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header with Referral Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input value={referralCode} readOnly className="font-mono" />
                <Button variant="outline" onClick={() => copyToClipboard(referralCode)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Input value={referralLink} readOnly className="font-mono text-sm" />
                <Button variant="outline" onClick={() => copyToClipboard(referralLink)}>
                  <LinkIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Referral Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Earn 10% of the project amount for each successful referral</li>
              <li>• Payment is processed after project completion</li>
              <li>• Each referral must complete at least one project</li>
              <li>• Share your code with other students interested in projects</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Earned Amount</p>
                <p className="text-2xl font-bold">${stats.earnedAmount.toFixed(2)}</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Referrals</p>
                <p className="text-2xl font-bold">{stats.activeReferrals}</p>
              </div>
              <UserPlus className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Referral</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">Add User</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tabs Section */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Referred Users</TabsTrigger>
          <TabsTrigger value="earnings">Earnings History</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Referred Users</CardTitle>
              <Button onClick={() => setShowAddUser(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Projects: {user.totalProjects}</p>
                      <p className="text-sm text-green-600">Earnings: ${user.earnings.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings">
          <Card>
            <CardHeader>
              <CardTitle>Earnings History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectEarnings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#2563eb"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StudentReferralDashboard