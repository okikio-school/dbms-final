'use client';

import type { posts } from "@/db/schema";
import { getTopPosts } from "@/lib/actions";
import useSWR from 'swr'

export function TopPostsList({ initialList }: { initialList: Awaited<ReturnType<typeof getTopPosts>>}) {
  const { data: list, error, isLoading } = useSWR('/api/list-top-posts', async () => {
    return await getTopPosts()
  }, { fallbackData: initialList })
 
  if (error) return <div>Failed to load</div>;
  if (isLoading && (!list || list?.length <= 0)) return <div>Loading...</div>;

  return (
    <div>
        {
            list?.map((x) => { 
                return <p>{x.title.toString()}</p>
              })
        }
    </div>
  );
}