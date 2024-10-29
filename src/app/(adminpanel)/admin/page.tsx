"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  // Line,
  // LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
// import {
//   ArrowDownIcon,
//   ArrowRightIcon,
//   ArrowUpIcon,
// } from "@radix-ui/react-icons";
import { Users, FileText, User, IndianRupee } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
// import { type ChartConfig } from "@/components/ui/chart"

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "#2563eb",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "#60a5fa",
//   },
// } satisfies ChartConfig;

interface PaymentTransaction {
  id: string;
  user_id: string;
  project_id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  status: string;
  created_at: string;
  payment_method: string;
  currency: string;
  failure_reason: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  type: string;
  technology: string;
  timeline: number;
  team_size: number;
  status: string;
  created_at: string;
  user_id: string;
  delivery_status: string;
  amount: number;
  payment_status: string;
}
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
export default function DashboardPage() {
  const [paymentTransactions, setPaymentTransactions] = useState<
    PaymentTransaction[]
  >([]);
  const [projects, setProjects] = useState<Project[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: transactionsData, error: transactionsError } =
        await supabase
          .from("payment_transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (transactionsError)
        console.error("Error fetching transactions:", transactionsError);
      if (projectsError)
        console.error("Error fetching projects:", projectsError);

      setPaymentTransactions(transactionsData || []);
      setProjects(projectsData || []);
      setLoading(false);
    }

    fetchData();
  }, []);

  const totalRevenue = paymentTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (project) => project.status === "completed"
  ).length;

  const monthlyRevenue = paymentTransactions.reduce((acc, transaction) => {
    const month = new Date(transaction.created_at).toLocaleString("default", {
      month: "short",
    });
    acc[month] = (acc[month] || 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  const revenueData = Object.entries(monthlyRevenue).map(([name, total]) => ({
    name,
    total,
  }));

  // const monthlyRevenue = paymentTransactions.reduce((acc, transaction) => {
  //   const date = new Date(transaction.created_at);
  //   const month = date.toLocaleString('default', { month: 'short' });
  //   const year = date.getFullYear();
  //   const key = `${month} ${year}`; // Include year in the key
  //   acc[key] = (acc[key] || 0) + transaction.amount;
  //   return acc;
  // }, {} as Record<string, number>);

  // const revenueData = Object.entries(monthlyRevenue)
  //   .sort((a, b) => {
  //     // Sort by date to ensure correct order
  //     const dateA = new Date(a[0]);
  //     const dateB = new Date(b[0]);
  //     return dateA.getTime() - dateB.getTime();
  //   })
  //   .map(([name, total]) => ({
  //     name,
  //     total,
  //   }));

  const projectStatusData = projects.reduce((acc, project) => {
    acc[project.status] = (acc[project.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const projectStatusChartData = Object.entries(projectStatusData).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>Download Report</Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </div>
                {/* <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p> */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Projects
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalProjects}</div>
                {/* <p className="text-xs text-muted-foreground">
                  +15.2% from last month
                </p> */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Completed Projects
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedProjects}</div>
                {/* <p className="text-xs text-muted-foreground">
                  +10.5% from last month
                </p> */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Projects
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {totalProjects - completedProjects}
                </div>
                {/* <p className="text-xs text-muted-foreground">
                  +7.4% from last month
                </p> */}
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={revenueData}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Project Status</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={projectStatusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStatusChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.payment_id}
                      </TableCell>
                      <TableCell>
                        ₹{transaction.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>{transaction.status}</TableCell>
                      <TableCell>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.title}
                      </TableCell>
                      <TableCell>{project.type}</TableCell>
                      <TableCell>{project.status}</TableCell>
                      <TableCell>
                        ₹{project.amount.toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
