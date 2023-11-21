'use client'

import { PostContent } from '@/components/post-content';
import { getPostContent } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';
import "./md.css";

export default function PostPage() {

    const searchParams = useSearchParams();
    let postID = "";
    let versionID = "";

    if(searchParams) {
        const poststring = searchParams.get('p');
        if (poststring) {
            console.log(poststring);
            const postarray = poststring.split('~');
            postID = postarray[0];
            versionID = postarray[1];
        }
        else {
            //error
            console.log(poststring);
            return (
                <div className="pt-24 px-8">
                <p>error</p>
                </div>
            );
        }
    }
    else{
        //error
        console.log("error");
        return (
            <div className="pt-24 px-8">
            <p>error</p>
            </div>
        );
    }

    let versid = 0;
    try {
        versid = parseInt(versionID);
        if (!versionID) { 1 / 0 }   
    } catch (error) {
        return (<>error: invalid versionid</>)
    }

    return (
        <div className="pt-24 px-40">
            <PostContent postID={postID} versionID={versionID} />
        </div>
    );
}