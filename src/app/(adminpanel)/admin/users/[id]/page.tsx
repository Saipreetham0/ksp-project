"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types/user";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  ArrowLeft,
  Shield,
  Phone,
  Calendar,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

const userSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().nullable(),
  role: z.enum(["admin", "MODERATOR", "user"]),
});

export default function UserDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
      role: "user",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!params.id) return;

      try {
        const userDoc = await getDoc(doc(db, "users", params.id as string));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          //   setUser({ ...userData, uid: userDoc.id });
          //   form.reset({
          //     displayName: userData.displayName,
          //     email: userData.email,
          //     phoneNumber: userData.phoneNumber,
          //     role: userData.role,
          //   });

          setUser({ ...userData, uid: userDoc.id });
          form.reset({
            displayName: userData.displayName,
            email: userData.email,
            phoneNumber: userData.phoneNumber,
            role: userData.role as "admin" | "MODERATOR" | "user",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        // toast.error("Failed to load user details");
        toast({
          title: "Scheduled: Catch up",
          // description: "Friday, February 10, 2023 at 5:57 PM",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id, form]);

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    if (!user?.uid) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), values);
      setUser((prev) => (prev ? { ...prev, ...values } : null));
      toast({
        title: "User details updated successfully",
        // description: "Friday, February 10, 2023 at 5:57 PM",
      });
    //   toast.success("User details updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
    //   toast.error("Failed to update user details");
      toast({
        title: "Failed to update user details",
        // description: "Friday, February 10, 2023 at 5:57 PM",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
              <p className="text-gray-500 mb-4">
                The requested user could not be found.
              </p>
              <Button onClick={() => router.push("/admin/users")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>

      <div className="grid gap-6">
        {/* User Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24">
                <Image
                  src={user.photoURL || "/default-avatar.png"}
                  alt={user.displayName}
                  className="rounded-full object-cover"
                  fill
                  sizes="96px"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-avatar.png";
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">{user.displayName}</h1>
                <div className="flex items-center gap-2 text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">{user.role}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">User Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Edit User Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            {/* <Input {...field} type="tel" /> */}
                            <Input {...field} type="tel" value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="MODERATOR">
                                Moderator
                              </SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={updating}>
                      {updating && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Account Created</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(user.createdAt), "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Last Login</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(user.lastLogin), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Phone Verification Status</p>
                      <div className="mt-1">
                        {user.isPhoneVerified ? (
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800"
                          >
                            Verified
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-yellow-100 text-yellow-800"
                          >
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
