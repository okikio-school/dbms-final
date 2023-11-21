import { ListUsers } from "@/components/list-users";
import { getUsers } from "@/lib/actions";
import { protect } from "@/lib/protect";

const initialList = await getUsers();
export default async function UsersPage() {
  await protect("/users");

  return (
    <div className="pt-24 px-2">
      <ListUsers initialList={initialList} />
    </div>
  );
}
