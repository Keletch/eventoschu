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
    <div className={cn("flex flex-col gap-3", className)}>
      <Label htmlFor={id} className="text-gray-900 font-bold px-1">
        {label} {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-neutral-400 font-normal ml-1">(opcional)</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        className={cn(
          "h-12 md:h-14 rounded-xl border-neutral-200 focus:ring-blue-700 bg-neutral-50/50",
          readOnly && "bg-gray-100 cursor-not-allowed opacity-70"
        )}
        required={required}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    </div>
  );
}
