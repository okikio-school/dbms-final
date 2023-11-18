'use client';

import { getPosts } from "@/lib/actions";
import { PostItem } from "./post-card";
import useSWR from 'swr'

export function PostsList({ initialList }: { initialList: Awaited<ReturnType<typeof getPosts>>}) {
  const { data: list, error, isLoading } = useSWR('/api/list-posts', async () => {
    return await getPosts()
  }, { fallbackData: initialList })
 
  if (error) return <div>Failed to load</div>;
  if (isLoading && (!list || list?.length <= 0)) return <div>Loading...</div>;

  return (
    <>
      {
        list?.map((x) => { 
          return <PostItem key={x.id} author={x.author} title={x.title}/>
        })
      }
    </>
  );
}