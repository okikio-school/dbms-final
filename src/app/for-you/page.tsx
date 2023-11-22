import { protect } from "@/lib/protect";

export default async function ForYouPage() {
  await protect("/for-you");

  return (
    <div className="pt-24 px-2">
      <p>for you page</p>
    </div>
  );
}