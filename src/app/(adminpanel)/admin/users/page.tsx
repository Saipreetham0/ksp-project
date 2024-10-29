"use client";

import { useState, useEffect } from "react";
import { doc, collection, query, getDocs, updateDoc, orderBy, limit, startAfter, where, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { format } from "date-fns";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { User } from "@/types/user";

// interface User {
//   uid: string;
//   email: string;
//   displayName: string;
//   photoURL: string;
//   role: string;
//   createdAt: string;
//   lastLogin: string;
//   isPhoneVerified: boolean;
//   phoneNumber: string | null;
// }

const USERS_PER_PAGE = 10;

export default function AdminUserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [lastVisible, setLastVisible] =  useState<QueryDocumentSnapshot | null>(null);
//   useState<any>(null);
  const [isFirstPage, setIsFirstPage] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

//   const fetchUsers = async (searchQuery = "", role = "ALL", startAfterDoc: any = null) => {
//     setLoading(true);
//     try {

const fetchUsers = async (
    searchQuery = "",
    role = "ALL",
    startAfterDoc: QueryDocumentSnapshot | null = null
  ) => {
    setLoading(true);
    try {
      let userQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        limit(USERS_PER_PAGE)
      );

      if (searchQuery) {
        userQuery = query(
          collection(db, "users"),
          where("displayName", ">=", searchQuery),
          where("displayName", "<=", searchQuery + "\uf8ff"),
          limit(USERS_PER_PAGE)
        );
      }

      if (role !== "ALL") {
        userQuery = query(userQuery, where("role", "==", role));
      }

      if (startAfterDoc) {
        userQuery = query(userQuery, startAfter(startAfterDoc));
      }

      const querySnapshot = await getDocs(userQuery);

      const userData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as User;
        userData.push({
          ...data,
          uid: doc.id,
          createdAt: data.createdAt || new Date().toISOString(),
          lastLogin: data.lastLogin || new Date().toISOString(),
        });
      });

      setUsers(userData);
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setIsFirstPage(startAfterDoc === null);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(searchTerm, roleFilter);
  }, [searchTerm, roleFilter]);

  const handleUpdateRole = async (uid: string, newRole: string) => {
    setUpdating(uid);
    try {
      await updateDoc(doc(db, "users", uid), {
        role: newRole,
      });

      setUsers(users.map(user =>
        user.uid === uid ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleNextPage = () => {
    if (lastVisible) {
      fetchUsers(searchTerm, roleFilter, lastVisible);
    }
  };

  const handlePreviousPage = () => {
    // For simplicity, just return to first page
    fetchUsers(searchTerm, roleFilter);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => setRoleFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="admin">admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="MODERATOR">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10">
                              <Image
                                src={user.photoURL || "/default-avatar.png"}
                                alt={user.displayName}
                                className="rounded-full object-cover"
                                fill
                                sizes="40px"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/default-avatar.png";
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{user.displayName}</div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleUpdateRole(user.uid, value)}
                            disabled={updating === user.uid}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">admin</SelectItem>
                              <SelectItem value="MODERATOR">Moderator</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {user.isPhoneVerified ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                              Unverified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.createdAt), "PP")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.lastLogin), "PP p")}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/admin/users/${user.uid}`}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end items-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={isFirstPage}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!lastVisible}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}