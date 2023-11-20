import { getPostContent } from "@/lib/actions";
import Markdown from "react-markdown"
import useSWR from "swr";
import { contentVersions } from "@/db/schema";

export function PostContent({postID, versionID}:{postID : string, versionID : string}) {
    //initialList: Awaited<ReturnType<typeof getPostContent>>}
    let versid = 0;
    try {
        versid = parseInt(versionID);
        if (!versionID) { 1 / 0 }   
    } catch (error) {
        return (<>error: invalid versionid</>)
    }

    const { data: list, error, isLoading } = useSWR('/api/post-content', async () => {
        return await getPostContent(postID, versid)
    })
    
    if (error || !list) return <div>Failed to load</div>;
    if (isLoading && (!list || list?.length <= 0)) return <div>Loading...</div>;

    const versioncontent = list[0].content as { markdown: any }
    const md = versioncontent.markdown;
    
    return (
        <Markdown>{md}</Markdown>
    )
}
