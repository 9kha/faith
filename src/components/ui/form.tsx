"use client";

import * as React from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useFormContext, FormProvider } from "react-hook-form";

type FormProps<TFieldValues extends FieldValues = FieldValues> = {
  children?: React.ReactNode;
} & Omit<
  React.HTMLAttributes<HTMLFormElement>,
  "onChange" | "defaultValues" | "children"
> & {
  form?: UseFormReturn<TFieldValues>;
};

export function Form<TFieldValues extends FieldValues = FieldValues>({
  children,
  className,
  form,
  ...props
}: FormProps<TFieldValues>) {
  const ctx = useFormContext<TFieldValues>();

  if (form) {
    return (
      <FormProvider {...form}>
        <form {...props} className={className}>
          {children}
        </form>
      </FormProvider>
    );
  }

  if (!ctx) {
    return (
      <form {...props} className={className}>
        {children}
      </form>
    );
  }

  return (
    <form {...ctx} {...props} className={className}>
      {children}
    </form>
  );
}

type FormFieldContextValue = {
  name: string;
  field: {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    value: string | undefined;
    ref: (ref: HTMLInputElement | null) => void;
  };
  formState: {
    errors: Record<string, { message?: string }>;
    isDirty: boolean;
    isSubmitted: boolean;
  };
};

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null,
);

type FormFieldProps = {
  name: string;
  children?: (args: FormFieldContextValue) => React.ReactNode;
  render?: (args: FormFieldContextValue) => React.ReactNode;
};

export function FormField({ name, children, render }: FormFieldProps) {
  const ctx = useFormContext();
  const registerResult = ctx.register(name);
  const allValues = ctx.getValues?.();
  const rawValue = allValues ? (allValues as Record<string, unknown>)[name] : undefined;
  const value = rawValue === undefined || rawValue === null ? undefined : String(rawValue);

  const contextValue: FormFieldContextValue = {
    name,
    field: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        registerResult.onChange(e as unknown as React.ChangeEvent<HTMLInputElement>);
        ctx.setValue(name, e.target.value);
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
        registerResult.onBlur(e as unknown as React.FocusEvent<HTMLInputElement>);
      },
      value,
      ref: ((registerResult.ref as unknown) as (ref: HTMLInputElement | null) => void) || (() => {}),
    },
    formState: {
      errors: ctx.formState.errors as Record<string, { message?: string }>,
      isDirty: ctx.formState.isDirty,
      isSubmitted: ctx.formState.isSubmitted,
    },
  };

  const renderProps = render ?? children ?? (() => null);

  return (
    <FormFieldContext.Provider value={contextValue}>
      {renderProps(contextValue)}
    </FormFieldContext.Provider>
  );
}

type FormItemProps = React.HTMLAttributes<HTMLDivElement>;

export function FormItem({ children, className, ...props }: FormItemProps) {
  return (
    <div className={["space-y-2", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </div>
  );
}

type FormLabelProps = React.HTMLAttributes<HTMLLabelElement>;

export function FormLabel({ className, ...props }: FormLabelProps) {
  return (
    <label
      className={["text-sm font-medium text-gray-700", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

import { Input } from "@/components/ui/input";

type FormControlProps = React.HTMLAttributes<HTMLInputElement> & {
  placeholder?: string;
  type?: string;
};

export function FormControl({ className, ...props }: FormControlProps) {
  return (
    <Input
      className={[
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    />
  );
}

type FormMessageProps = React.HTMLAttributes<HTMLDivElement>;

export function FormMessage({ className, children, ...props }: FormMessageProps) {
  return (
    <div
      className={["text-sm font-medium text-destructive", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
