import Link from "next/link";
import { AspectRatio } from "./ui/aspect-ratio";
import { Card, CardContent, CardHeader } from "./ui/card";
import Image from 'next/image'
import { Badge } from "./ui/badge";

export function PostCard({title, author, postID, versionID, ratio} : {title: string | null, author: string | null, ratio: number | undefined, postID : string, versionID : string}) {
  return (
    <Link href={"/read?p=" + postID + "~" + versionID}>
      <Card className="relative">
        <CardHeader className="absolute bottom-0 left-0 p-5 z-10">
          <h1>{title}</h1>
          <span>{author}</span>
        </CardHeader>
        <CardContent className="p-0">
          <AspectRatio ratio={ratio} className="bg-muted">
            <Image
              src="https://m.media-amazon.com/images/M/MV5BYjk2MTQzYTItMWVhMy00MDA4LWFmNmMtZWRlNTBhYmJmMmM3XkEyXkFqcGdeQXVyMTIyMTQzODM2._V1_.jpg"
              alt="carl weezer looking cool"
              fill
              className="rounded-md object-cover"
            />
          </AspectRatio>
        </CardContent>
      </Card>
    </Link>
  )
}

export async function PostItem({title, author, postID, versionID, date} : {title: string | null, author: string | null, postID : string, versionID : string, date : string }) {
  return (
    <Link href={"/read?p=" + postID + "~" + versionID}>
      <Card className="">
        <CardContent className="grid grid-cols-6 p-4">
            <div className="col-span-1">
                <AspectRatio ratio={1} className="bg-muted">
                    <Image
                    src="https://m.media-amazon.com/images/M/MV5BYjk2MTQzYTItMWVhMy00MDA4LWFmNmMtZWRlNTBhYmJmMmM3XkEyXkFqcGdeQXVyMTIyMTQzODM2._V1_.jpg"
                    alt="carl weezer looking cool"
                    fill
                    className="rounded-md object-cover"
                    />
                </AspectRatio>
            </div>
            <div className="col-span-5">
                <div className="grid grid-rows-4 p-4">
                    <div className="row-span-2">
                        <h2>{title}</h2>
                    </div>
                    <div className="row-span-1">
                        <span>{author}</span>
                    </div>
                    <div className="row-span-1">
                        <span>{date}</span>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>
    </Link>
  );
}