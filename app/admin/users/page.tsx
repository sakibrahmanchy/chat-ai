import { Card } from "@/components/ui/card";
import { adminUserService } from "@/lib/services/admin/user.service";
import { UserList } from "@/components/admin/users/user-list";
import { UserFilters } from "@/components/admin/users/user-filters";

export default async function AdminUsersPage() {
  const users = await adminUserService.getAllUsers();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>

      <Card className="p-6">
        <UserFilters />
        <UserList users={users} />
      </Card>
    </div>
  );
} 