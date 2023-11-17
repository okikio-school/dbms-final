import { FeaturedPost } from "@/components/featured-post";
import { TopPostsList } from "@/components/top-posts-list";
import { PostsList } from "@/components/posts-list";
import { getFeaturedPosts, getPosts, getTopPosts } from "@/lib/actions";

const initialTop = await getTopPosts();
const initialFeatured = await getFeaturedPosts();
const initialFeed = await getPosts();

export default function Home() {
  return (
    <div className="pt-24 px-2">
      <div className="w-full flex gap-4">
        <div className="w-[70%]">
          <h2>Featured Post</h2>
          <FeaturedPost initialList={initialFeatured}></FeaturedPost>
          <h3>New Posts</h3>
          <PostsList initialList={initialFeed} />
        </div>
        <div className="w-[30%]">
          <div className="sticky top-16">
            <h2>Top Posts</h2>

            <div className="overflow-auto max-h-[calc(100svh-8rem)] rounded-md border">
              <TopPostsList initialList={initialTop} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
