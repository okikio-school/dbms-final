import { AspectRatio } from "./ui/aspect-ratio";
import { Card, CardContent, CardHeader } from "./ui/card";
import Image from 'next/image'

export function PostCard({title, author, ratio} : {title: string | null, author: string | null, ratio: number | undefined}) {
    return (<Card className="relative">
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
  </Card>)
}

export function PostItem({title, author} : {title: string | null, author: string | null}) {
    return (<Card className="">
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
        <div className="col-span-4">
            <div className="grid grid-rows-5 p-4">
                <div className="row-span-3">
                    <h2>{title}</h2>
                </div>
                <div className="row-span-2">
                    <span>{author}</span>
                </div>
            </div>
        </div>
    </CardContent>
  </Card>)
}