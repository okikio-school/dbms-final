
import { getPosts, getRelevantPosts } from "@/lib/actions.ts";
import { useRouter } from "next/navigation";
import { PostsList } from "@/components/foryou-list";
import { getServerSession, type AuthOptions } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/_options";

const userID = "6133925e-359f-491e-bb0c-fab9e6c090e8";

const usersession = await getServerSession(authOptions as unknown as AuthOptions)
const userid2 = usersession?.user.id;

const initialFeed = await getRelevantPosts(userID);

export default async function ForYouPage() {

  return (
    <div className="pt-24 px-2">
      <PostsList initialList={initialFeed} userID={userID}/>
    </div>
  );
}