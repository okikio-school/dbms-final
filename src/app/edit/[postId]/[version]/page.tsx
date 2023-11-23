import EditorPage from '@/components/editor/index';
import { getPost, getPosts } from '@/lib/actions';
import { protect } from '@/lib/protect';

export async function generateStaticParams() {
  const posts = await getPosts()
 
  return posts.map((post) => ({
    postId: post.id,
    version: post.version + ""
  }))
}

export default async function EditPostPage({ params }: { params: { postId: string, version: string } }) {
  await protect(`/edit/${params.postId}/${params.version}`);

  const post = await getPost({
    postId: params.postId,
    versionId: Number(params.version)
  })



  console.log({
    initialPost: post
  })
  
  return (
    <div className="pt-2">
      <EditorPage
        postId={params.postId}
        versionId={Number(params.version)}
        initialPost={{
          title: post?.title!,
          description: (post?.metadata as { description: string })?.description ?? "",
          publishedStatus: post?.publishedStatus!,
          isFeatured: post?.isFeatured!,
          // @ts-ignore
          content: (post?.content as { markdown: string })?.markdown ?? "",
          type: post?.type!,
          publishedDate: post?.publishedDate!,
          updatedDate: post?.updatedAt!,
        }}
      />
    </div>
  );
}