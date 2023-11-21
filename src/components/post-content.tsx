import { getPostContent } from "@/lib/actions";
import Markdown from "react-markdown"
import useSWR from "swr";
import { contentVersions } from "@/db/schema";
import { Separator } from "./ui/separator";

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
    
    if (error) return <div>Failed to load</div>;
    if (isLoading) return <div>Loading...</div>;
    if (!isLoading && (!list || list.length <= 0)) return <div>Failed to load</div>;

    const versioncontent = list![0].content as { markdown: any }
    const md = versioncontent.markdown;

    const title = list![0].title;
    const author = list![0].author;
    const date = list![0].published_date;
    
    return (
        <>
            <Separator/>
            <div>
                <p className="content-title">{title}</p>
                <h6><em>Written by {author}<br/>Published on {date.toDateString()}</em></h6>
            </div>
            <Separator/>
            <div className="md-container">
                <Markdown>{md}</Markdown>
            </div>
        </>
    )
}
