import React, { forwardRef } from "react";

type BaseProps = {
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  containerClassName?: string;
};

type InputProps = BaseProps &
  React.InputHTMLAttributes<HTMLInputElement> & {
    as?: "input";
  };

type TextareaProps = BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    as: "textarea";
  };

type FormFieldProps = InputProps | TextareaProps;

const baseFieldClasses =
  "w-full rounded-[10px] border bg-white px-4 py-3 text-[15px] text-subtle-black placeholder-gray-7 outline-none transition-colors duration-200 focus:border-violet focus:ring-2 focus:ring-violet/15 disabled:bg-gray-6 disabled:text-gray-8";

const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormFieldProps
>(function FormField(
  { label, optional, error, hint, containerClassName = "", ...rest },
  ref
) {
  const hasError = Boolean(error);
  const borderClass = hasError
    ? "border-red/60 focus:border-red focus:ring-red/15"
    : "border-light-gray";

  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      <label className="flex items-center gap-2 text-[13px] font-medium text-dark-gray">
        <span>{label}</span>
        {optional && (
          <span className="text-[11px] font-normal text-gray-7">(optional)</span>
        )}
      </label>

      {rest.as === "textarea" ? (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={`${baseFieldClasses} ${borderClass} min-h-[96px] resize-y leading-[22px] ${
            (rest as TextareaProps).className ?? ""
          }`}
        />
      ) : (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          className={`${baseFieldClasses} ${borderClass} h-[48px] ${
            (rest as InputProps).className ?? ""
          }`}
        />
      )}

      {hasError ? (
        <p className="text-[12px] text-red">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-gray-7">{hint}</p>
      ) : null}
    </div>
  );
});

export default FormField;
