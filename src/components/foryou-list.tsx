'use client';

import { getRelevantPosts } from "@/lib/actions";
import { PostItem } from "./post-card";
import useSWR from 'swr'
import { useSession } from "next-auth/react";

export function PostsList({ initialList, userID }: { initialList: Awaited<ReturnType<typeof getRelevantPosts>>, userID : string}) {
  
  const usersession = useSession();
  const userid = usersession.data?.user?.id ?? userID;

  const { data: list, error, isLoading } = useSWR('/api/list-relevant-posts', async () => {
    return await getRelevantPosts(userid) ?? [];
  }, { fallbackData: initialList })
 
  if (error) {
    console.log(error);
    return <div>Failed to load</div>
  };
  if (isLoading && (!list || list.length <= 0)) return (<div>Loading...</div>);
  if (!isLoading && (!list || list.length <= 0)) return (<div>No relevant posts...</div>);

  return (
    <>
      {
        list?.map((x) => { 
          let version = "";
          if (!x.version) {version = "0"} else {version = x.version.toString()}
          return <PostItem key={x.postID} author={x.author} title={x.title} postID={x.postID} versionID={version} date={x.date.toDateString()}/>
        })
      }
    </>
  );
}