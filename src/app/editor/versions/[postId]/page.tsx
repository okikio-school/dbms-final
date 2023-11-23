import { authOptions } from "@/app/api/auth/[...nextauth]/_options";
import { MyVersionsListCard } from "@/components/list-card";
import * as Schema from "@/db/schema";
import { getServerSession, type AuthOptions } from "next-auth";
import { useSearchParams } from "next/navigation";

export default async function MyVersionsPage({ params }: { params: { postId: string } }) {

    const usersession = await getServerSession(authOptions as unknown as AuthOptions)
    const userid = usersession?.user.id;

    return (
        <div className="p-20">
            <h1>My Versions</h1>
            <MyVersionsListCard userID={userid!} postID={params.postId} />
        </div>
    );
}