
import { getPosts, getRelevantPosts } from "@/lib/actions.ts";
import { useRouter } from "next/navigation";
import { PostsList } from "@/components/foryou-list";

const userID = "6133925e-359f-491e-bb0c-fab9e6c090e8";
const initialFeed = await getRelevantPosts(userID);

export default async function ForYouPage() {

  return (
    <div className="pt-24 px-2">
      <PostsList initialList={initialFeed} userID={userID}/>
    </div>
  );
}