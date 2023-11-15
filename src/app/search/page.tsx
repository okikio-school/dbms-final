import { ListUsers } from "@/components/list-users";
import { getUsers } from "@/lib/actions";

const initialList = await getUsers();
export default function Home() {
  return (
    <div>
      <ListUsers initialList={initialList} />
    </div>
  );
}
