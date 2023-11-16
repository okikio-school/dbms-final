'use client';

import type { users } from "@/db/schema";
import { getUsers } from "@/lib/actions";
import { UserCard } from "./user-card";
import useSWR from 'swr'

export function ListUsers({ initialList }: { initialList: typeof users.$inferSelect[] }) {
  const { data: list, error, isLoading } = useSWR('/api/list-users', async () => {
    return await getUsers()
  }, { fallbackData: initialList })
 
  if (error) return <div>Failed to load</div>;
  if (isLoading && (!list || list?.length <= 0)) return <div>Loading...</div>;

  return <div className="grid md:grid-cols-2 lg:grid-cols-3 p-4 gap-3">{
    list?.map((x) => { 
      return <UserCard key={x.userId} user={x} />
    })
  }</div>
}
