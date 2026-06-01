"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

type Option = { label: string; value: string };

interface MultiSelectProps {
  options: Option[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({ options, onValueChange, placeholder }: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Option[]>([]);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = React.useCallback((option: Option) => {
    setSelected((prev) => {
      const next = prev.filter((s) => s.value !== option.value);
      onValueChange(next.map(n => n.value));
      return next;
    });
  }, [onValueChange]);

  const handleSelect = React.useCallback((option: Option) => {
    setInputValue("");
    setSelected((prev) => {
      const next = [...prev, option];
      onValueChange(next.map(n => n.value));
      return next;
    });
  }, [onValueChange]);

  const selectables = options.filter((obj) => !selected.includes(obj));

  return (
    <Command onKeyDown={(e) => { if (e.key === "Backspace" && inputValue === "") handleUnselect(selected[selected.length - 1]); }} className="overflow-visible bg-transparent">
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selected.map((s) => (
            <Badge key={s.value} variant="secondary">
              {s.label}
              <button className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onClick={() => handleUnselect(s)}>
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={selected.length > 0 ? "" : placeholder}
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              <CommandGroup className="h-full overflow-auto">
                {selectables.map((option) => (
                  <CommandItem key={option.value} onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }} onSelect={() => handleSelect(option)} className="cursor-pointer">
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>
    </Command>
  );
}