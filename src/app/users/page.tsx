import { ListUsers } from "@/components/list-users";
import { getUsers } from "@/lib/actions";

const initialList = await getUsers();
export default function Home() {
  return (
    <div className="pt-24 px-2">
      <ListUsers initialList={initialList} />
    </div>
  );
}
