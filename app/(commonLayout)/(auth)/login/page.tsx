"use client";

import { useState } from "react";
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
import { loginUser } from "@/services/auth/loginUser";
import { toast } from "sonner";
import { getDefaultDashboardRoute } from "@/lib/auth-utils";
import { useRouter } from "next/navigation";

export default function LoginPage() {
     const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting to login...", { email, password });
    const result = await loginUser({email , password}) 
    console.log(result)
    if(result.success){
        toast.success("login successfull")

         const role = result.role;
      const redirectUrl = getDefaultDashboardRoute(role);

      setTimeout(() => {
        router.push(`${redirectUrl}?loggedIn=true`);
      }, 500);
    }
    else{
        toast.error(`${result.message}`)
    }
   
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-sm border border-gray-100">
        <CardHeader className="space-y-1 text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">Login</CardTitle>
          <CardDescription className="text-gray-500">
            Enter your email and password to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <a href="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-visible:ring-blue-500"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}