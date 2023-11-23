import { getPostContent } from "@/lib/actions";
import Markdown from "react-markdown"

import { Separator } from "./ui/separator";

export async function PostContent({ postID, versionID }: { postID: string, versionID: string }) {
  //initialList: Awaited<ReturnType<typeof getPostContent>>}
  let versid = 0;
  try {
    versid = parseInt(versionID);
    if (!versionID) { 1 / 0 }
  } catch (error) {
    return (<>error: invalid versionid</>)
  }

  const list = await getPostContent(postID, versid)
  if ((!list || list.length <= 0)) return <div>Failed to load</div>;

  const versioncontent = list![0].content as { markdown: any }
  const md = versioncontent.markdown;

  const title = list![0].title;
  const author = list![0].author;
  const date = list![0].published_date;

  return (
    <div className={`mx-auto max-w-[65ch] md:max-w-[75ch] lg:max-w-[85ch] xl:max-w-screen-lg px-3 lg:px-4 pt-8 pb-24 transition-all`}>
      <Separator />
      <div className="py-24 flex flex-col gap-6">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{title}</h1>
        <p>
          <em>
            Written by {author}
            <br />
            Published on {date.toDateString()}
          </em>
        </p>
      </div>

      <Separator />

      <div
        className={`
          mx-auto
          py-12
          md:px-[1.625rem]
          px-2 lg:px-0
          text-lg md:text-xl leading-[1.8] sm:leading-10 md:leading-[1.8]
          prose prose-slate
          prose-headings:scroll-m-20  prose-headings:text-inherit prose-headings:border-b-slate-500/40
          prose-h1:text-3xl prose-h1:font-bold prose-h1:lg:text-5xl
          prose-h2:text-3xl prose-h2:border-b prose-h2:pb-2 prose-h2:lg:text-4xl prose-h2:font-semibold 
          prose-h2:transition-colors prose-h2:first:mt-0
          prose-h3:text-2xl prose-h3:font-semibold
          prose-h4:text-xl prose-h4:font-semibold
          prose-p:[&:not(:first-child)]:mt-6 
          prose-blockquote:mt-6 prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic
          prose-ul:mt-0 prose-ul:mb-6 prose-ul:list-disc prose-ul:[&>li]:mt-2 
          prose-ul:leading-9
          prose-table:w-full 
          prose-tr:m-0 prose-tr:border-t prose-tr:p-0 prose-tr:even:bg-muted
          prose-th:border prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-bold prose-th:[&[align=center]]:text-center prose-th:[&[align=right]]:text-right
          prose-td:border prose-td:px-4 prose-td:py-2 prose-td:text-left prose-td:[&[align=center]]:text-center prose-td:[&[align=right]]:text-right
          prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] 
          prose-code:py-[0.2rem] prose-code:font-dm-mono prose-code:text-sm prose-code:font-[500]
          prose-pre:min-w-1/2 prose-pre:max-w-[45ch] prose-pre:mx-auto prose-pre:overflow-x-auto prose-pre:px-6 prose-pre:py-3 prose-pre:shadow-lg prose-pre:shadow-black prose-pre:font-mono
          prose-pre:[&_code]:bg-transparent
        `}
      >
        <Markdown>{md}</Markdown>
      </div>
    </div>
  )
}
