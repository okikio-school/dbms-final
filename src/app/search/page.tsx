import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SearchPage() {
  return (
    <div className="pt-24 px-2">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="search">Search</Label>
        <Input type="text" id="search" placeholder="Search for posts..." />
      </div>
    </div>
  );
}