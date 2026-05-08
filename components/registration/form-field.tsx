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
      <Label htmlFor={id} className="text-[#03133F] font-normal px-1 text-base">
        {label} {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-neutral-400 font-normal ml-1">(opcional)</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        className={cn(
          "h-10 md:h-11 rounded-xl border-[#616B77]/40 focus:ring-blue-700 bg-white placeholder:text-[#D6DAE0] placeholder:text-base placeholder:font-medium text-[#03133F] font-medium text-base transition-all",
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
