
import { getPosts, getRelevantPosts } from "@/lib/actions.ts";
import { useRouter } from "next/navigation";
import { PostsList } from "@/components/foryou-list";
import { getServerSession, type AuthOptions } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/_options";

const usersession = await getServerSession(authOptions as unknown as AuthOptions)
const userid = usersession?.user.id;

const initialFeed = await getRelevantPosts(userid!);

export default async function ForYouPage() {

  return (
    <div className="pt-24 px-2">
      <PostsList initialList={initialFeed} userID={userid!}/>
    </div>
  );
}