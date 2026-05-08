"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRY_CODES } from "@/lib/constants";

interface PhoneInputProps {
  phoneCode: string;
  phone: string;
  onPhoneCodeChange: (val: string | null) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PhoneInput({
  phoneCode,
  phone,
  onPhoneCodeChange,
  onPhoneChange,
}: PhoneInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="phone" className="text-[#03133F] font-normal px-1 text-base">
        Teléfono (WhatsApp) <span className="text-red-500">*</span>
      </Label>
      <div className="flex gap-3">
        <Select
          value={phoneCode}
          onValueChange={onPhoneCodeChange}
        >
          <SelectTrigger className="w-[80px] md:w-[90px] h-10 md:h-11 rounded-xl border-[#616B77]/40 focus:ring-blue-700 bg-white flex items-center justify-between px-3 text-[#03133F] font-medium text-base">
            <SelectValue>
              <span className="text-[#D6DAE0] font-medium text-base">{phoneCode || "+51"}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COUNTRY_CODES.map((item, idx) => (
              <SelectItem key={idx} value={item.code}>
                <span className="flex items-center gap-2">
                  <span className="text-lg">{item.flag}</span>
                  <span className="font-bold">{item.code}</span>
                  <span className="hidden md:inline text-xs text-neutral-400">({item.country})</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id="phone"
          name="phone"
          placeholder="987 654 321"
          className="flex-1 h-10 md:h-11 rounded-xl border-[#616B77]/40 focus:ring-blue-700 bg-white placeholder:text-[#D6DAE0] placeholder:text-base placeholder:font-medium text-[#03133F] font-medium text-base"
          required
          value={phone}
          onChange={onPhoneChange}
        />
      </div>
    </div>
  );
}
