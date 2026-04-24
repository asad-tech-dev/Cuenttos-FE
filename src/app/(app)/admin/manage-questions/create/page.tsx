"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import checkAdminAuth from "@/HOC/checkAdminAuth";
import QuestionGroupForm from "@/app/components/forms/questionGroup";

function CreateQuestionGroupPage() {
  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-8 px-6 py-8 sm:px-10 lg:px-[60px]">
      <Link
        href="/admin/manage-questions"
        className="inline-flex w-fit items-center gap-2 text-[13px] font-medium text-gray hover:text-violet transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Manage Questions
      </Link>

      <header className="flex flex-col gap-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-violet">
          Admin
        </p>
        <h1 className="text-[28px] font-semibold leading-[34px] text-subtle-black sm:text-[32px]">
          Create Question Group
        </h1>
        <p className="max-w-[640px] text-[14px] leading-[22px] text-gray">
          Define a title, an optional description, and the questions that will
          appear together in this group.
        </p>
      </header>

      <QuestionGroupForm />
    </div>
  );
}

export default checkAdminAuth(CreateQuestionGroupPage);
