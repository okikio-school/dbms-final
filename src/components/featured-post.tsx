'use client';

import type { posts } from "@/db/schema";
import { getFeaturedPosts } from "@/lib/actions";
import useSWR from 'swr'

export function FeaturedPost({ initialList }: { initialList: Awaited<ReturnType<typeof getFeaturedPosts>>}) {
  const { data: list, error, isLoading } = useSWR('/api/list-featured-posts', async () => {
    return await getFeaturedPosts()
  }, { fallbackData: initialList })
 
  if (error) return <div>Failed to load</div>;
  if (isLoading && (!list || list?.length <= 0)) return <div>Loading...</div>;

  return (
    <div>
        {
          <p>{list[0].title}</p>
        }
    </div>
  );
}