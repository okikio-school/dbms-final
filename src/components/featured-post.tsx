'use client';

import { getFeaturedPosts } from "@/lib/actions";
import { PostCard } from "./post-card";
import useSWR from 'swr'

export function FeaturedPost({ initialList }: { initialList: Awaited<ReturnType<typeof getFeaturedPosts>>}) {
  const { data: list, error, isLoading } = useSWR('/api/list-featured-posts', async () => {
    return await getFeaturedPosts()
  }, { fallbackData: initialList })
 
  if (error) return <div>Failed to load</div>;
  if (isLoading && (!list || list?.length <= 0)) return <div>Loading...</div>;

  return (
    <PostCard title={list[0].title} author={list[0].author} ratio={16/9} />
  );
}