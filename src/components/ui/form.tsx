"use client";

import * as React from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { useFormContext, FormProvider, Controller } from "react-hook-form";

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
  const renderProps = render ?? children ?? (() => null);

  // Controller subscribes this field to react-hook-form state, so the input
  // re-renders on every keystroke instead of only when some other state
  // change (e.g. clicking a button) happens to re-render the form.
  return (
    <Controller
      control={ctx.control}
      name={name}
      render={({ field, formState }) => {
        const contextValue: FormFieldContextValue = {
          name,
          field: {
            onChange: field.onChange as (e: React.ChangeEvent<HTMLInputElement>) => void,
            onBlur: field.onBlur as (e: React.FocusEvent<HTMLInputElement>) => void,
            value:
              field.value === undefined || field.value === null
                ? undefined
                : String(field.value),
            ref: (field.ref as unknown) as (ref: HTMLInputElement | null) => void,
          },
          formState: {
            errors: formState.errors as Record<string, { message?: string }>,
            isDirty: formState.isDirty,
            isSubmitted: formState.isSubmitted,
          },
        };
        return (
          <FormFieldContext.Provider value={contextValue}>
            {renderProps(contextValue)}
          </FormFieldContext.Provider>
        );
      }}
    />
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

export function FormControl({ className, children, ...props }: FormControlProps) {
  const mergedClassName = [
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Allow <FormControl><input ... /></FormControl> composition: render the
  // child with this styling instead of silently dropping it.
  if (children !== undefined && children !== null) {
    if (React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        ...props,
        className: [mergedClassName, child.props.className]
          .filter(Boolean)
          .join(" "),
      } as never);
    }
    return <>{children}</>;
  }

  return <Input className={mergedClassName} {...props} />;
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
