'use server'

import { headers } from "next/headers";
import { auth } from "@/firebase/server";
import { User } from "firebase/auth";

/**
 * Gets the currently authenticated user from the session cookie.
 * Throws an error if the user is not authenticated.
 * This is a server-side utility.
 */
export async function getAuthenticatedAdmin(): Promise<User> {
  const session = headers().get("authorization")?.split("Bearer ")[1];
  if (!session) {
    throw new Error("Not authenticated");
  }
  
  const decodedIdToken = await auth.verifyIdToken(session);
  const user = await auth.getUser(decodedIdToken.uid);

  if (!user) {
    throw new Error("User not found");
  }

  // You might want to add role-based checks here in a real app
  // e.g., check for a custom claim `admin: true`

  return user;
}
