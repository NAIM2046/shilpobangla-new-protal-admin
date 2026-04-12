import Image from "next/image";
import UserProfile from "@/components/module/user/UserProfile";
import { getUserProfile } from "@/services/users/users.services";

export default async function ProfileManagementPage() {
  const response = await getUserProfile();
  //console.log(response, ".............profile response");
  const userData = response?.data || null;

  if (!userData) {
    return <div>Failed to load user profile.</div>;
  }

  return (
    <div>
      <UserProfile userData={userData} />
    </div>
  );
}
