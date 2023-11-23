import { authOptions } from "@/app/api/auth/[...nextauth]/_options";
import { MyPostsListCard } from "@/components/list-card";
import * as Schema from "@/db/schema";
import { getServerSession, type AuthOptions } from "next-auth";
import { useSearchParams } from "next/navigation";

export default async function MyPostsPage() {

    const usersession = await getServerSession(authOptions as unknown as AuthOptions)
    const userid = usersession?.user.id;

    return (
        <div className="p-20">
            <h1>My Posts</h1>
            <MyPostsListCard userID={userid!} />
        </div>
    );
}