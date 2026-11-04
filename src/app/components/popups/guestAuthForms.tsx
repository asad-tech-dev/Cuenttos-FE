"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import FormField from "../ui/FormField";
import VioletButton from "../buttons/VioletButton";
import {
  loginUser,
  registerUser,
  storeIsAdmin,
  storeToken,
} from "@/lib/api/auth";
import {
  LoginFormData,
  RegisterFormData,
  loginSchema,
  registerSchema,
} from "@/lib/formSchemas/auth";
import { clearReferrer, readReferrer } from "@/lib/referrer";
import { markWalkthroughPending } from "@/lib/walkthrough";

// Light-theme versions of the /login and /register forms for the guest
// sign-up pop-up. Same schemas and API calls as those pages; the difference
// is that success calls `onAuthenticated` instead of navigating, so the guest
// stays on the page with what they wrote.

const apiError = (err: unknown, fallback: string) =>
  axios.isAxiosError(err)
    ? err.response?.data?.message || fallback
    : "An unexpected error occurred. Please try again.";

const signIn = async (credentials: LoginFormData) => {
  const { token, isAdmin } = await loginUser(credentials);
  if (!token) throw new Error("No token returned");
  storeToken(token);
  storeIsAdmin(Boolean(isAdmin));
};

/** Password input with the same show/hide eye the auth pages have. */
function PasswordField({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <FormField
        label="Password"
        type={visible ? "text" : "password"}
        autoComplete="current-password"
        className="pr-11"
        error={error}
        {...props}
      />
      {/* Centred on the 48px input, which sits under the label. */}
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-[52px] -translate-y-1/2 text-gray-7 hover:text-subtle-black cursor-pointer"
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

interface AuthFormProps {
  onAuthenticated: () => void;
  onSwitch: () => void;
}

export function GuestRegisterForm({ onAuthenticated, onSwitch }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    try {
      // The sharer of the prompt they came from, so they can add them to a circle.
      await registerUser({ ...data, referrer: readReferrer() ?? undefined });
      clearReferrer();
    } catch (err) {
      setError(apiError(err, "Signup failed. Please try again."));
      setLoading(false);
      return;
    }
    // Shown once they've shared what they wrote and reach a main page.
    markWalkthroughPending(data.email);
    try {
      // Same as /register: sign the new account straight in.
      await signIn({ email: data.email, password: data.password });
      onAuthenticated();
    } catch {
      setError("Your account was created. Please sign in to continue.");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <FormField
        label="Username"
        autoComplete="username"
        error={errors.username?.message}
        {...register("username")}
      />
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <div className="flex flex-col gap-1.5">
        <label className="flex items-start gap-3 text-[13px] leading-[20px] text-dark-gray cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-violet cursor-pointer"
            {...register("terms")}
          />
          <span>
            I agree to the{" "}
            <span className="text-violet">Terms &amp; Conditions</span> and{" "}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet"
            >
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.terms && (
          <p className="text-[12px] text-red">{errors.terms.message}</p>
        )}
      </div>
      {error && <p className="text-[13px] text-red">{error}</p>}
      <VioletButton
        text="Create account"
        className="flex w-full h-[44px] items-center justify-center text-[14px]"
        loading={loading}
        type="submit"
      />
      <p className="text-center text-[14px] text-gray">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-violet cursor-pointer"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}

export function GuestLoginForm({ onAuthenticated, onSwitch }: AuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      await signIn(data);
      onAuthenticated();
    } catch (err) {
      setError(apiError(err, "Login failed. Please try again."));
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <FormField
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <PasswordField
        error={errors.password?.message}
        {...register("password")}
      />
      {/* New tab, so this page and what they wrote stay put. */}
      <a
        href="/forgot-password"
        target="_blank"
        rel="noopener noreferrer"
        className="-mt-1 self-end text-[13px] font-medium text-violet"
      >
        Forgot your password?
      </a>
      {error && <p className="text-[13px] text-red">{error}</p>}
      <VioletButton
        text="Sign in"
        className="flex w-full h-[44px] items-center justify-center text-[14px]"
        loading={loading}
        type="submit"
      />
      <p className="text-center text-[14px] text-gray">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-violet cursor-pointer"
        >
          Create one
        </button>
      </p>
    </form>
  );
}
