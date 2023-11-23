'use client'

import useSWR from "swr";
import { Card, CardContent } from "./ui/card";
import { getMyPosts } from "@/lib/actions";
import type { posts } from "@/db/schema";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function MyPostsListCard({ userID }: { userID: string | null }) {
    
    if (!userID) return <div>No user provided</div>;

    const { data: list, error, isLoading } = useSWR('/api/list-my-posts', async () => {
      return await getMyPosts({ userId:userID });
    })
   
    if (error) return <div>Failed to load</div>;
    if (isLoading && (!list || list.length <= 0)) return <div>Loading...</div>;
    if (!isLoading && (!list || list.length <= 0)) return <div>Failed to load</div>;

    return(
    <Card>
        <CardContent className="pt-6">
            {
                list?.map((x) => { 
                    return (
                    <>
                        <Link href={"/editor/versions?p=" + encodeURIComponent(x.postId)} legacyBehavior passHref>
                            <p key={x.postId}>
                                {x.title}
                            </p>
                        </Link>
                        <Separator className="my-2"/>
                    </>
                    )
                })
            }
        </CardContent>
    </Card>
    )
}

export function MyVersionsListCard({ userID, postID }: { userID: string | null , postID: string }) {
    
    if (!userID) return <div>No user provided</div>;

    const { data: list, error, isLoading } = useSWR('/api/list-my-posts', async () => {
      return await getMyPosts({ userId:userID });
    })
   
    if (error) return <div>Failed to load</div>;
    if (isLoading && (!list || list.length <= 0)) return <div>Loading...</div>;
    if (!isLoading && (!list || list.length <= 0)) return <div>Failed to load</div>;

    return(
    <Card>
        <CardContent className="pt-6">
            {
                list?.map((x) => { 
                    return (
                    <>
                        <p key={x.postId}>
                            {x.title}
                        </p>
                        <Separator className="my-2"/>
                    </>
                    )
                })
            }
        </CardContent>
    </Card>
    )
}