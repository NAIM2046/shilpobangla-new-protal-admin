// app/admin/dashboard/users/page.tsx

import UserAddForm from "@/components/module/user/UserAddForm";
import UserList from "@/components/module/user/UserList";
import { getAllUsers } from "@/services/users/users.services";

const UserManagementPage = async () => {
  // সার্ভার থেকে ডেটা ফেচ করা হচ্ছে
  const result = await getAllUsers({});
   const users = result?.data || [];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-500">Manage all your system users from here.</p>
      </div>
      <UserAddForm/>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        {/* ডেটা ফেইল করলে এরর মেসেজ দেখাবে */}
        {result?.success === false ? (
          <p className="text-red-500 font-medium">{result.message}</p>
        ) : (
          /* ডেটা সফলভাবে আসলে তা স্ক্রিনে JSON আকারে দেখাবে (আপাতত টেস্ট করার জন্য) */
          <div className="overflow-auto max-h-96 bg-slate-50 p-4 rounded text-sm">
              <UserList users={users} />
          </div>
        )}
      </div>
    </div>
  );
};

// React কম্পোনেন্ট এক্সপোর্ট
export default UserManagementPage;