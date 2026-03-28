"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Label অ্যাড করা হয়েছে
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Dialog (Pop-up) ইম্পোর্ট করা হয়েছে
import { toast } from "sonner";
import { deleteUser, updateUser } from "@/services/users/users.services";
import { UserRole } from '@/lib/auth-utils';

export type User = {
  id: string; 
  name: string;
  email: string;
  role: string;
};

const UserList = ({ users }: { users: User[] }) => {
  const router = useRouter();
  
   
  // স্টেট ম্যানেজমেন্ট
  const [isLoading, setIsLoading] = useState<string | null>(null);
  
  // মডাল (Pop-up) এর জন্য স্টেট
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; email: string; role: string , id: string }>({ name: "", email: "", role: "" , id: "" });

  // 🗑️ Delete Function
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    setIsLoading(id);
    try {
      const result = await deleteUser(id);
      if (result?.success) {
        toast.success("User deleted successfully!");
        router.refresh();
      } else {
        toast.error(result?.message || "Failed to delete user.");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(null);
    }
  };

  // ✏️ Edit Button এ ক্লিক করলে মডাল ওপেন হবে
  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setEditFormData({ name: user.name, email: user.email, role: user.role  , id: user.id});
    setIsModalOpen(true);
  };

  // 💾 Save Update Function
  const handleUpdate = async () => {
    if (!editingUser) return;
    
    setIsLoading(editingUser.id);
    try {
      const payload = {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role as UserRole,
      };

      const result = await updateUser(editingUser.id, payload);
      
      if (result?.success) {
        toast.success("User updated successfully!");
        setIsModalOpen(false); // কাজ শেষে মডাল বন্ধ
        setEditingUser(null);
        router.refresh(); 
      } else {
        toast.error(result?.message || "Failed to update user.");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(null);
    }
  };

  if (!users || users.length === 0) {
    return (
      <div className="mt-8 text-center p-12 border rounded-xl bg-slate-50 text-slate-500">
        No users found.
      </div>
    );
  }

  return (
    <>
      {/* 🌟 ইউজার কার্ড লিস্ট */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const isProcessing = isLoading === user.id;

          return (
            <Card key={user.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardContent className="pt-6">
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-lg text-slate-900 truncate" title={user.name}>
                    {user.name}
                  </h3>
                  <p className="text-sm text-slate-500 truncate" title={user.email}>
                    {user.email}
                  </p>
                  <div className="pt-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 inline-block">
                      {user.role}
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end space-x-2 bg-slate-50/50 py-3 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditClick(user)}
                  disabled={isLoading !== null} // অন্য কোনো কাজ চললে বাটন ডিজেবল
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(user.id)}
                  disabled={isLoading !== null}
                >
                  {isProcessing ? "Deleting..." : "Delete"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* 🌟 এডিট পপ-আপ (Dialog) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user's profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                disabled={isLoading !== null}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                disabled={isLoading !== null}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={editFormData.role} 
                onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                disabled={isLoading !== null}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REPORTER">Reporter</SelectItem>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading !== null}
            >
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleUpdate}
              disabled={isLoading !== null}
            >
              {isLoading === editingUser?.id ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserList;