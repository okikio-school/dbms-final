import { FeaturedPost } from "@/components/featured-post";
import { TopPostsList } from "@/components/top-posts-list";
import { getFeaturedPosts, getTopPosts } from "@/lib/actions";

const initialTop = await getTopPosts();
const initialFeatured = await getFeaturedPosts();

export default function Home() {
  return (
    <div>
      <div className="grid grid-flow-row auto-rows-auto grid-cols-3 gap-4">
        <div className="col-start-1 col-span-2">
          <h2>Featured Posts</h2>
          <FeaturedPost initialList={initialFeatured}></FeaturedPost>
        </div>
        <div className="col-auto">
          <h2>Top Posts</h2>
          <TopPostsList initialList={initialTop}/>
        </div>
      </div>
    </div>
  );
}
