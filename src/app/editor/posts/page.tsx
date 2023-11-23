import { MyPostsListCard } from "@/components/list-card";
import * as Schema from "@/db/schema";

export default function MyPostsPage() {
  return (
    <div className="p-20">
      <h1>My Posts</h1>
      <MyPostsListCard userID="bb199305-0816-4d78-ab63-cb550a81b7cc" />
    </div>
  );
}