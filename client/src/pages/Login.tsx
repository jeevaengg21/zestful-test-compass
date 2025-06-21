import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store/store";
import { fetchProducts } from "@/store/slices/productSlice";
import { fetchModules } from "@/store/slices/moduleSlice";
import { fetchUsers } from "@/store/slices/userSlice";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log("Login successful, setting token:", data.token);
      localStorage.setItem("token", data.token);

      // Immediately fetch Products, Modules, and Users after successful login
      dispatch(fetchProducts());
      dispatch(fetchModules());
      dispatch(fetchUsers());

      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.fullName}!`,
      });
      // Small delay to ensure token is set and data is being fetched before reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginForm) => {
    console.log("Submitting login form:", data);
    setIsLoading(true);
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your tenant workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || loginMutation.isPending}
              >
                {isLoading || loginMutation.isPending
                  ? "Signing in..."
                  : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium text-sm text-gray-900 dark:text-white mb-2">
              Demo Accounts:
            </p>
            <div className="space-y-3">
              <div className="p-2 bg-white dark:bg-gray-700 rounded border">
                <p className="font-medium text-blue-600 dark:text-blue-400">
                  TechCorp Inc
                </p>
                <p className="text-sm">Email: admin@techcorp.com</p>
                <p className="text-xs text-gray-500">Password: password123</p>
              </div>
              <div className="p-2 bg-white dark:bg-gray-700 rounded border">
                <p className="font-medium text-green-600 dark:text-green-400">
                  StartupLabs
                </p>
                <p className="text-sm">Email: admin@startup.com</p>
                <p className="text-xs text-gray-500">Password: password123</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
