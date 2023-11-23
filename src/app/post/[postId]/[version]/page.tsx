import { PostContent } from '@/components/post-content';
import { getPosts } from '@/lib/actions';

export async function generateStaticParams() {
  const posts = await getPosts()
 
  return posts.map((post) => ({
    postId: post.id,
    version: post.version + ""
  }))
}

export default function PostPage({ params }: { params: { postId: string, version: string } }) {
  return (
    <div className="pt-24 px-40">
      <PostContent postID={params.postId} versionID={params.version} />
    </div>
  );
}