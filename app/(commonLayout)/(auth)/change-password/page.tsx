"use client";

import React, { useState } from 'react';
import Link from 'next/link'; // 👈 Link ইম্পোর্ট করা হলো
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { changePasswordAPI } from '@/services/auth/auth.services';
import { logoutUser } from '@/services/auth/logoutUser';

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 🌟 নতুন স্টেট: এরর হলে এটি true হবে, যাতে Forgot Password লিঙ্ক দেখানো যায়
  const [showForgotLink, setShowForgotLink] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowForgotLink(false); // রিকোয়েস্ট পাঠানোর আগে লিংক হাইড করে দেওয়া

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      const result = await changePasswordAPI({ currentPassword, newPassword });
      
      // API থেকে success false আসলে এরর থ্রো করবে বা টোস্ট দেখাবে
      if (result?.success === false) {
        toast.error(result?.message || "Failed to change password.");
        setShowForgotLink(true); // 👈 এরর হলে Forgot Password লিঙ্ক দেখাবে
        return;
      }
      
      toast.success("Password changed successfully!");
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await logoutUser(); 
      
    } catch (error) {
      toast.error("Something went wrong. Please check your current password.");
      setShowForgotLink(true); // 👈 এরর হলে Forgot Password লিঙ্ক দেখাবে
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <Card className="shadow-sm border border-gray-100">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Change Password</CardTitle>
          <CardDescription className="text-gray-500">
            Ensure your account is using a long, random password to stay secure.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            
            {/* Current Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="currentPassword">Current Password</Label>
              </div>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              {/* 🌟 এরর হলে Forgot Password লিঙ্ক দেখাবে */}
              {showForgotLink && (
                <div className="text-right">
                  <Link 
                    href="/forgot-password" // 👈 আপনার ফর্গেট পাসওয়ার্ড পেজের লিংক দিন
                    className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
                  >
                    Forgot current password?
                  </Link>
                </div>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

          </CardContent>
          
          <CardFooter className="flex justify-end pt-4 border-t bg-slate-50/50">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}