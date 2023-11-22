'use client';

import { getPosts } from "@/lib/actions";
import { PostItem } from "./post-card";
import useSWR from 'swr'

export function PostsList({ initialList }: { initialList: Awaited<ReturnType<typeof getPosts>>}) {
  const { data: list, error, isLoading } = useSWR('/api/list-posts', async () => {
    return await getPosts()
  }, { fallbackData: initialList })
 
  if (error) return <div>Failed to load</div>;
  if (isLoading && (!list || list.length <= 0)) return <div>Loading...</div>;
  if (!isLoading && (!list || list.length <= 0)) return <div>Failed to load</div>;

  return (
    <>
      {
        list?.map((x) => { 
          let version = "";
          if (!x.version) {version = "0"} else {version = x.version.toString()}
          return <PostItem key={x.id} author={x.author} title={x.title} postID={x.id} versionID={version} date={x.date.toDateString()}/>
        })
      }
    </>
  );
}