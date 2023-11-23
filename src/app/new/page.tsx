import { newPost } from "@/lib/actions";
import { getServerSession, type AuthOptions } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/_options";
import { protect } from "@/lib/protect";
import { redirect } from "next/navigation";

export default async function NewPost() { 
  await protect("/new");

  const session = await getServerSession(authOptions as unknown as AuthOptions);
  const post = await newPost({
    title: "Untitled post",
    description: "Description...",
    publishedStatus: false,
    isFeatured: false,
    content: "",
    type: "post",
    publishedDate: new Date().toString(),
    updatedDate: new Date().toString(),
    userId: session?.user.id!,
  });

  if (post && post.postId && typeof post.version === "number") {
    redirect(`/edit/${post.postId}/${post.version}`)
  }

  return <div className="py-20">New Post</div>
}