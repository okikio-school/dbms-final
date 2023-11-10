'use client';

import type { users } from "@/db/schema";
import { getUsers } from "@/lib/actions";
import { UserCard } from "./user-card";
import useSWR from 'swr'

export function ListUsers() {
  const { data: list, error, isLoading } = useSWR('/api/list-users', async () => {
    return await getUsers()
  })
 
  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return <div className="grid md:grid-cols-2 lg:grid-cols-3 p-4 gap-3">{
    list?.map((x) => { 
      return <UserCard key={x.userId} user={x} />
    })
  }</div>
}
