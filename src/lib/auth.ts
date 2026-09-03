import { cookies } from 'next/headers';
import { prisma } from './prisma';

const USER_SESSION_COOKIE = 'Papap Fish Farm_user_id';

export async function getCurrentUser() {
  const cookieStore = cookies();
  const userId = cookieStore.get(USER_SESSION_COOKIE)?.value;

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, farmName: true },
    });
    if (user) return user;
  }

  // Fallback ke user pertama (admin) jika belum ada session agar langsung bisa dipakai
  const defaultUser = await prisma.user.findFirst({
    select: { id: true, email: true, name: true, farmName: true },
  });

  return defaultUser;
}

export function getUserSessionCookieName() {
  return USER_SESSION_COOKIE;
}
