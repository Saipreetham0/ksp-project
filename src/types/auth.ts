// src/types/auth.ts
import { User } from "firebase/auth";

export type UserRole = "user" | "admin" | "moderator";

// export interface UserData {
//   uid: string;
//   email: string;
//   role: UserRole;
//   displayName?: string;
//   photoURL?: string;
//   createdAt: string;
//   lastLogin: string;
// }

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  lastLogin: string;
  phoneNumber?: string;
  isPhoneVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
}


export type AuthError = {
  message: string;
  status: number;
};