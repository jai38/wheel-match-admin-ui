
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

const multiSelectVariants = cva(
  "m-1 transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default:
          "border-foreground/20 text-foreground hover:border-foreground/30",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface MultiSelectProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof multiSelectVariants> {
  placeholder?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  value: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  disabled?: boolean;
  maxCount?: number;
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
  (
    {
      className,
      variant,
      placeholder = "Select options...",
      options,
      value = [],
      onChange,
      disabled = false,
      maxCount,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleSelect = (selectedValue: string) => {
      if (value.includes(selectedValue)) {
        onChange(value.filter((v) => v !== selectedValue));
      } else {
        if (maxCount && value.length >= maxCount) return;
        onChange([...value, selectedValue]);
      }
      setInputValue("");
    };

    const handleRemove = (selectedValue: string) => {
      onChange(value.filter((v) => v !== selectedValue));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (input) {
        if (e.key === "Delete" || e.key === "Backspace") {
          if (input.value === "" && value.length > 0) {
            handleRemove(value[value.length - 1]);
          }
        }
        if (e.key === "Escape") {
          input.blur();
        }
      }
    };

    const selected = options.filter((option) => value.includes(option.value));
    const unselected = options.filter(
      (option) => !value.includes(option.value)
    );

    return (
      <Command
        onKeyDown={handleKeyDown}
        className="overflow-visible bg-transparent"
      >
        <div
          className={cn(
            "group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selected.map((option) => (
              <Badge
                key={option.value}
                className={cn(
                  "flex items-center gap-1",
                  multiSelectVariants({ variant })
                )}
              >
                {option.label}
                <button
                  className="ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemove(option.value);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleRemove(option.value)}
                >
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
              placeholder={placeholder}
              className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              disabled={disabled}
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && unselected.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandList>
                <CommandGroup>
                  {unselected.map((option) => (
                    <CommandItem
                      key={option.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => handleSelect(option.value)}
                      className="cursor-pointer"
                    >
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
);

MultiSelect.displayName = "MultiSelect";

export { MultiSelect };
