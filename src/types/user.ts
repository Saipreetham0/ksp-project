// export interface User {
//     uid: string;
//     email: string | null;
//     displayName: string | null;
//     photoURL: string | null;
//   }


 export interface User {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    role: string;
    createdAt: string;
    lastLogin: string;
    isPhoneVerified: boolean;
    phoneNumber: string | null;
  }