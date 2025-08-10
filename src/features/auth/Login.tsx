import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

import { Mail, LockKeyhole } from "lucide-react";
import Spinner from "@/assets/spin.svg";

const Login = () => {
  const [isForgotPassword, setForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleForgotPassword = () => {
    setForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setForgotPassword(false);
  };

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const formReset = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: any) => {
    if (!data.username) {
      form.setError("username", { message: "Username is required" });
    }

    if (!data.password) {
      form.setError("password", { message: "Password is required" });
    }

    if (!data.username && !data.password) {
      form.setError("username", {
        message: "Username and password are required",
      });
      form.setError("password", {
        message: "Username and password are required",
      });
    }

    if (data.username && data.password) {
      console.log("click", data.username, data.password);
    }
  };

  const ResetPassword = async (data: any) => {
    if (!data.email) {
      formReset.setError("email", { message: "Email is required" });
      return;
    }

    setLoading(true);
    setIsSent(false);

    if (data.email) {
      console.log(data.email);
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));

      setTimeout(() => {
        setIsSent(true);
      }, 3200)

      setTimeout(() => {
        setLoading(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  return (
    <div className="bg-[#e1e2e0] w-full h-screen">
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white w-[340px] h-[600px] rounded-4xl">
          <div className="flex justify-center mt-25">
            <motion.div
              key={isForgotPassword ? "forgot" : "login"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              {isForgotPassword ? (
                <div className="text-center">
                  <h1 className="text-[20px] font-bold">Reset Password</h1>
                  <p className="mt-2 text-gray-400 text-[14px] w-[280px]">
                    Please enter your email we will send email to reset your
                    password
                  </p>
                  <div className="mt-15">
                    <Form {...formReset}>
                      <form
                        onSubmit={formReset.handleSubmit(ResetPassword)}
                        className="space-y-8 relative"
                      >
                        <FormField
                          control={formReset.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute px-3 py-2.5">
                                    <Mail className="text-gray-400 w-5" />
                                  </div>
                                  <Input
                                    type="email"
                                    placeholder="Email"
                                    {...field}
                                    className="bg-gray-100 w-[280px] h-[45px] border-0 shadow-sm focus-visible:ring-ring/0 
                                    pl-11 placeholder:text-[14px] text-[14px] text-gray-800
                                  "
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="absolute bottom-30  text-xs px-2" />
                              <div className="mt-2 text-start px-2">
                                <p className="text-black text-[12px]">
                                  Don't forgot to check the e-mail in trash
                                </p>
                              </div>
                              <div className="mt-10 flex justify-center relative">
                                {loading && (
                                    <img
                                      src={Spinner}
                                      alt="Loading..."
                                      className="w-20 h-20 mt-0 absolute"
                                    />
                                )}
                              {isSent && (
                                <p className="absolute text-green-700 text-[14px]">
                                  We already send link to your email
                                </p>
                              )}
                              </div>
                                
                           
                            </FormItem>
                          )}
                        />
                        <Button className="mt-22 w-[280px] h-[45px] rounded-2xl">
                          Send
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <h1 className="text-[20px] font-bold">Sing Up</h1>
                  <p className="mt-2 text-gray-400 text-[14px]">
                    Please enter your email and password
                  </p>
                  <div className="mt-15">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8 relative"
                      >
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute px-3 py-2.5">
                                    <Mail className="text-gray-400 w-5" />
                                  </div>
                                  <Input
                                    type="username"
                                    placeholder="Username"
                                    {...field}
                                    className="bg-gray-100 w-[280px] h-[45px] border-0 shadow-sm focus-visible:ring-ring/0 
                                                  pl-11 placeholder:text-[14px] text-[14px] text-gray-800
                                              "
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="absolute bottom-30  text-xs px-2" />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative -mt-4">
                                  <div className="absolute px-3 py-2.5">
                                    <LockKeyhole className="text-gray-400 w-5 " />
                                  </div>
                                  <Input
                                    type="password"
                                    placeholder="Password"
                                    {...field}
                                    className="bg-gray-100 w-[280px] h-[45px] border-0 shadow-sm focus-visible:ring-ring/0 
                                                  pl-11 placeholder:text-[14px]
                                              "
                                  />
                                </div>
                              </FormControl>
                              <FormMessage className="absolute bottom-30  text-xs px-2" />
                            </FormItem>
                          )}
                        />
                        <div
                          className="-mt-5 flex justify-end px-2"
                          onClick={handleForgotPassword}
                        >
                          <p className="text-[12px] text-gray-500 hover:text-blue-800 cursor-pointer">
                            forgot password
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="mt-25 w-[280px] h-[45px] rounded-2xl"
                        >
                          Continue
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
