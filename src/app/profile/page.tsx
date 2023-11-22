import { protect } from "@/lib/protect";

export default async function ProfilePage() {
  await protect("/profile");
  
  return (
    <div className="pt-24 px-2">
      <p>profile</p>
    </div>
  );
}
