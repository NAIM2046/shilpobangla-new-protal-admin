"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
import { ArrowLeft } from "lucide-react"; // আইকনের জন্য
import { forgotPassword } from '@/services/auth/auth.services';
// import { forgotPasswordAPI } from '@/services/auth/auth.services'; // আপনার API ফাংশন ইম্পোর্ট করবেন

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 🚀 সাবমিট হ্যান্ডলার ফাংশন
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      // 💡 এখানে আপনার ব্যাকএন্ডের API কলটি বসাবেন
       await forgotPassword(email)
      
      // ডেমো পারপাসের জন্য ১.৫ সেকেন্ডের লোডিং দেখাচ্ছি
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Password reset link sent to your email!");
      setIsSubmitted(true); // ইমেইল পাঠানো হয়ে গেলে মেসেজ দেখানোর জন্য
      setEmail(""); // ইনপুট ক্লিয়ার করা
      
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
      <Card className="w-full max-w-md shadow-sm border border-gray-100">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-800">Forgot Password?</CardTitle>
          <CardDescription className="text-gray-500">
            No worries, we'll send you reset instructions.
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* 🌟 সাকসেস মেসেজ (লিঙ্ক পাঠানোর পর দেখাবে) */}
            {isSubmitted && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm mb-4">
                We have sent a password reset link to your email. Please check your inbox.
              </div>
            )}

            {/* ✉️ ইমেইল ইনপুট */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email (e.g. name@example.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 pt-4 border-t bg-slate-50/50">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || isSubmitted} // একবার পাঠিয়ে দিলে বাটন ডিজেবল রাখা যায়
            >
              {isLoading ? "Sending..." : "Reset Password"}
            </Button>

            {/* 🔙 লগিন পেজে ফিরে যাওয়ার লিঙ্ক */}
            <div className="text-center w-full">
              <Link 
                href="/login" // আপনার লগিন পেজের পাথ
                className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;