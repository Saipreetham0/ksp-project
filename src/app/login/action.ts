// "use server";

// import { z } from "zod";

// import { createClient } from "@/utils/supabase/server";
// import { redirect } from "next/navigation";

// const loginSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(5), // Adjust the minimum length as needed
// });

// export const loginUser = async ({
//   email,
//   password,
// }: {
//   email: string;
//   password: string;
// }) => {
//   const loginUserValidation = loginSchema.safeParse({
//     email,
//     password,
//   });

//   if (!loginUserValidation.success) {
//     return {
//       error: true,
//       message:
//         loginUserValidation.error.issues[0]?.message ?? "An error occured",
//     };
//   }

//   // supabase authentication from here
//   const supabase = createClient();

//   ///////////////////////////// TEST for redirection ///////////
// //   const { data, error } = await supabase.auth.getUser();
// //   const {
// //     data: { user },
// //   } = await supabase.auth.getUser();

// //   if (user) {
// //     return redirect("/dashboard");
// //   }

//   ///////////////////////////////////////////

//   const { data, error } = await supabase.auth.signInWithPassword({
//     email,
//     password,
//   });

//   if (error) {
//     return {
//       error: true,
//       message: error.message,
//     };
//   }

//   if (!data.user) {
//     return {
//       error: true,
//       message: "Login failed. Please try again.",
//     };
//   }

//   // User successfully logged in
//   return {
//     success: true,
//     message: "Login successful",
//     user: {
//       id: data.user.id,
//       email: data.user.email,
//       // Add any other user data you want to return
//     },
//   };
// };


'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}