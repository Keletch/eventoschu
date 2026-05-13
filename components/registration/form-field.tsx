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
      <Label htmlFor={id} className="text-foreground font-normal px-1 text-base">
        {label} {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-muted-foreground/60 font-normal ml-1">(opcional)</span>}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        className={cn(
          "h-10 md:h-11 rounded-xl border-[#616B77]/40 dark:border-primary/20 focus:ring-primary bg-transparent placeholder:text-muted-foreground/40 placeholder:text-base placeholder:font-medium text-foreground font-medium text-base transition-all",
          readOnly && "bg-muted/30 cursor-not-allowed opacity-70"
        )}
        required={required}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
      />
    </div>
  );
}
