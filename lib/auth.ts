import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return {
    id: Number((session.user as any).id),
    username: session.user.name,
    role: (session.user as any).role,
  };
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  return user?.role === "admin";
}