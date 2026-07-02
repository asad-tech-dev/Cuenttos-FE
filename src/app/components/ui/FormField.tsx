import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

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

type SelectProps = BaseProps &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    as: "select";
    options: { value: string | number; label: string }[];
    placeholder?: string;
  };

type FormFieldProps = InputProps | TextareaProps | SelectProps;

const baseFieldClasses =
  "w-full rounded-[10px] border bg-white px-4 py-3 text-[15px] text-subtle-black placeholder-gray-7 outline-none transition-colors duration-200 focus:border-violet focus:ring-2 focus:ring-violet/15 disabled:bg-gray-6 disabled:text-gray-8";

const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
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
      ) : rest.as === "select" ? (
        (() => {
          const {
            options,
            placeholder,
            className,
            as: _as,
            ...selectRest
          } = rest as SelectProps;
          void _as;
          const isPlaceholderSelected =
            selectRest.value === "" ||
            selectRest.value === undefined ||
            selectRest.value === 0 ||
            selectRest.defaultValue === "" ||
            selectRest.defaultValue === undefined;
          return (
            <div className="relative">
              <select
                ref={ref as React.Ref<HTMLSelectElement>}
                {...selectRest}
                className={`${baseFieldClasses} ${borderClass} h-[48px] cursor-pointer appearance-none pr-11 ${
                  isPlaceholderSelected ? "text-gray-7" : ""
                } ${className ?? ""}`}
              >
                {placeholder && (
                  <option value="" disabled>
                    {placeholder}
                  </option>
                )}
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-7"
              />
            </div>
          );
        })()
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
