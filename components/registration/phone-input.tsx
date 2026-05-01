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
    <div className="flex flex-col gap-3 md:col-span-2">
      <Label htmlFor="phone" className="text-gray-900 font-bold px-1">
        Teléfono (WhatsApp) <span className="text-red-500">*</span>
      </Label>
      <div className="flex gap-3">
        <Select
          value={phoneCode}
          onValueChange={onPhoneCodeChange}
        >
          <SelectTrigger className="w-[110px] md:w-[140px] h-12 md:h-14 rounded-xl border-neutral-200 focus:ring-blue-700 bg-neutral-50/50 flex items-center justify-between px-4">
            <SelectValue placeholder="+51" />
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
          className="flex-1 h-12 md:h-14 rounded-xl border-neutral-200 focus:ring-blue-700 bg-neutral-50/50"
          required
          value={phone}
          onChange={onPhoneChange}
        />
      </div>
    </div>
  );
}
