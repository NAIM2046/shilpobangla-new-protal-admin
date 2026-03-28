"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 👈 রাউটার ইম্পোর্ট করা হলো
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUser } from "@/services/users/users.services";
import { UserRole } from '../../../lib/auth-utils';
import { toast } from "sonner";

export default function UserAddForm() {
  const router = useRouter(); // 👈 রাউটার ইনিশিয়ালাইজ
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("REPORTER");
  const [isLoading, setIsLoading] = useState(false); // 👈 লোডিং স্টেট

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // 👈 API কল শুরুর আগে লোডিং True করে দিলাম

    try {
      const newUserData = { name, email, role };
      console.log("Creating new user...", newUserData);

      const result = await createUser(newUserData);
      
      if (result.success) {
        toast.success(`${result.message}`);
        
        // সফল হলে ফর্মের ডেটা মুছে ফেলার জন্য (অপশনাল)
        setName("");
        setEmail("");
        
        // 💥 ম্যাজিক: প্যারেন্ট পেজকে রিফ্রেশ করে নতুন ডেটা আনা হবে
        router.refresh(); 
      } else {
        toast.error(`${result.message}`);
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false); // 👈 কাজ শেষ, তাই লোডিং False করে দিলাম
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card className="shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Add New User</CardTitle>
          <CardDescription className="text-gray-500">
            Create a new user account and assign them a role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading} // 👈 লোডিং অবস্থায় ইনপুট বন্ধ
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@shilpobangla.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading} // 👈 লোডিং অবস্থায় ইনপুট বন্ধ
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Selection (Shadcn Select) */}
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <Select 
                  onValueChange={(value: any) => setRole(value)} 
                  required
                  disabled={isLoading} // 👈 লোডিং অবস্থায় ড্রপডাউন বন্ধ
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REPORTER">Reporter</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="mr-3"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                disabled={isLoading} // 👈 লোডিং অবস্থায় বাটনে ক্লিক করা যাবে না
              >
                {/* 👈 লোডিং অনুযায়ী বাটনের টেক্সট পরিবর্তন */}
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}