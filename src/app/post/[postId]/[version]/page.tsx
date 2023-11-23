import { PostContent } from '@/components/post-content';
import { Button } from '@/components/ui/button';
import { getPosts } from '@/lib/actions';
import { EditIcon } from 'lucide-react';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = await getPosts()
 
  return posts.map((post) => ({
    postId: post.id,
    version: post.version + ""
  }))
}

export default async function PostPage({ params }: { params: { postId: string, version: string } }) {
  return (
    <div className="pt-24 container max-w-screen-md">
      <PostContent postID={params.postId} versionID={params.version} />

      <div className="flex w-full justify-center items-center py-16">

      <Button variant="outline" asChild>
        <Link href={`/edit/${params.postId}/${params.version}`}>
          <EditIcon className="w-6 h-6 mr-2" />
          Edit
        </Link>
      </Button>
      </div>
    </div>
  );
}