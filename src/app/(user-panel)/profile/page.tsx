"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: string;
  lastLogin?: string;
  phoneNumber?: string | null;
  isPhoneVerified?: boolean;
  role?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();

          const profileData = {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || "User",
            photoURL: user.photoURL || "/default-avatar.png",
            createdAt: userData?.createdAt || user.metadata.creationTime,
            lastLogin: userData?.lastLogin || user.metadata.lastSignInTime,
            phoneNumber: user.phoneNumber || userData?.phoneNumber,
            isPhoneVerified: user.phoneNumber ? true : false,
            role: userData?.role || "USER",
          };

          setProfile(profileData);
          setPhoneNumber(profileData.phoneNumber || "");
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
        setLoading(false);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdatePhone = async () => {
    if (!profile) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", profile.uid), {
        phoneNumber: phoneNumber,
        isPhoneVerified: false,
      });

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              phoneNumber: phoneNumber,
              isPhoneVerified: false,
            }
          : null
      );

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating phone number:", error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4 pb-2">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Profile Not Found
            </h2>
            <p className="text-gray-600 mt-2">
              Unable to load profile information.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
          <div className="relative h-16 w-16">
            <Image
              src={profile.photoURL || "/default-avatar.png"}
              alt={profile.displayName || "User avatar"}
              className="rounded-full object-cover"
              fill
              sizes="(max-width: 64px) 100vw"
              priority
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/default-avatar.png";
              }}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold">
                {profile.displayName}
              </CardTitle>
              <Badge variant="outline">{profile.role}</Badge>
            </div>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <h3 className="text-sm font-medium text-gray-500">
                Phone Number
              </h3>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2 w-full">
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                      className="max-w-xs"
                    />
                    <Button
                      onClick={handleUpdatePhone}
                      disabled={updating}
                      size="sm"
                    >
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setPhoneNumber(profile.phoneNumber || "");
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <span>{profile.phoneNumber || "Not provided"}</span>
                    {profile.isPhoneVerified && (
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800"
                      >
                        Verified
                      </Badge>
                    )}
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">
                Account Created
              </h3>
              <p>
                {profile.createdAt
                  ? format(new Date(profile.createdAt), "PPP")
                  : "N/A"}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Last Login</h3>
              <p>
                {profile.lastLogin
                  ? format(new Date(profile.lastLogin), "PPP p")
                  : "N/A"}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-500">
                Account Status
              </h3>
              <Badge variant="outline" className="ml-2">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
