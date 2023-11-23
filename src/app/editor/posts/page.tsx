import { authOptions } from "@/app/api/auth/[...nextauth]/_options";
import { MyPostsListCard } from "@/components/list-card";
import { Button } from "@/components/ui/button";
import * as Schema from "@/db/schema";
import { getServerSession, type AuthOptions } from "next-auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default async function MyPostsPage() {

    const usersession = await getServerSession(authOptions as unknown as AuthOptions)
    const userid = usersession?.user.id;

    return (
        <div className="p-20">
            <div className="flex pb-4">
                <div className="">
                    <h1>My Posts</h1>
                </div>
                <div className="grow">
                </div>
                <Button>
                    <Link href="/new" legacyBehavior passHref>
                        New Post
                    </Link>
                </Button>
            </div>
            
            <MyPostsListCard userID={userid!} />
        </div>
    );
}