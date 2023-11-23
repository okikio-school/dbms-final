import { authOptions } from "@/app/api/auth/[...nextauth]/_options";
import { MyVersionsListCard } from "@/components/list-card";
import * as Schema from "@/db/schema";
import { getServerSession, type AuthOptions } from "next-auth";
import { useSearchParams } from "next/navigation";

export default async function MyVersionsPage() {

    let postid = "";
    const searchParams = useSearchParams();

    if(searchParams) {
        const poststring = searchParams.get('p');
        if (poststring) {
            postid = poststring;
        }
        else {
            //error
            return (
                <div className="pt-24 px-8">
                <p>error: invalid postid</p>
                </div>
            );
        }
    }
    else{
        //error
        return (
            <div className="pt-24 px-8">
            <p>error: no search params</p>
            </div>
        );
    }

    const usersession = await getServerSession(authOptions as unknown as AuthOptions)
    const userid = usersession?.user.id;

    return (
        <div className="p-20">
            <h1>My Posts</h1>
            <MyVersionsListCard userID={userid!} postID={postid} />
        </div>
    );
}