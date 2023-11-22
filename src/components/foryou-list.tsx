'use client';

import { getRelevantPosts } from "@/lib/actions";
import { PostItem } from "./post-card";
import useSWR from 'swr'

export function PostsList({ initialList, userID }: { initialList: Awaited<ReturnType<typeof getRelevantPosts>>, userID : string}) {
  const { data: list, error, isLoading } = useSWR('/api/list-posts', async () => {
    return await getRelevantPosts(userID);
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
          return <PostItem key={x.postID} author={x.author} title={x.title} postID={x.postID} versionID={version}/>
        })
      }
    </>
  );
}