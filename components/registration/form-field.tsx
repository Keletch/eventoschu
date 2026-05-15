"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  className?: string;
  optional?: boolean;
}

export function FormField({
  id,
  label,
  name,
  type = "text",
  placeholder,
  required,
  value,
  onChange,
  readOnly,
  className,
  optional,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-form-label font-normal px-1 text-base">
        {label} {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-form-label/60 font-normal ml-1">(opcional)</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        className={cn(
          "h-10 md:h-11 rounded-xl border-form-input-border focus:ring-form-btn-bg bg-form-input-bg placeholder:text-form-input-text/40 placeholder:text-base placeholder:font-medium text-form-input-text font-medium text-base transition-all",
          readOnly && "bg-form-input-bg opacity-70 cursor-not-allowed"
        )}
        required={required}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    </div>
  );
}
