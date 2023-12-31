'use client';

import { getTopPosts } from "@/lib/actions";
import { PostCard } from "./post-card";
import useSWR from 'swr'

export function TopPostsList({ initialList }: { initialList: Awaited<ReturnType<typeof getTopPosts>>}) {
  const { data: list, error, isLoading } = useSWR('/api/list-top-posts', async () => {
    return await getTopPosts()
  }, { fallbackData: initialList })
 
  if (error) return <div>Failed to load</div>;
    if (isLoading && (!list || list.length <= 0)) return <div>Loading...</div>;
    if (!isLoading && (!list || list.length <= 0)) return <div>Failed to load</div>;

  return (
    <>
      {
        list?.map((x) => { 
          let version = ""
          if (!x.version) {version = "0"} else {version = x.version.toString()}
          return <PostCard key={x.id} author={x.author} title={x.title} ratio={3} postID={x.id} versionID={version}/>
        })
      }
    </>
  );
}