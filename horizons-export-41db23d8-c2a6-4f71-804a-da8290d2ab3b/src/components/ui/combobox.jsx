import React, { useState, useRef, useEffect } from "react";
    import { Check, ChevronsUpDown } from "lucide-react";
    import { cn } from "@/lib/utils";
    import { Button } from "@/components/ui/button";
    import { Input } from "@/components/ui/input";
    import {
      Command,
      CommandEmpty,
      CommandGroup,
      CommandInput,
      CommandItem,
      CommandList,
    } from "@/components/ui/command";
    import {
      Popover,
      PopoverContent,
      PopoverTrigger,
    } from "@/components/ui/popover";

    export function Combobox({ items, value, onChange, placeholder, inputPlaceholder, className, allowCustomValue = false }) {
      const [open, setOpen] = useState(false);
      const [inputValue, setInputValue] = useState(value || ""); 
      const triggerRef = useRef(null);
      const [popoverWidth, setPopoverWidth] = useState(0);

      useEffect(() => {
        if (triggerRef.current) {
          setPopoverWidth(triggerRef.current.offsetWidth);
        }
      }, [open]);

      useEffect(() => {
        setInputValue(value || "");
      }, [value]);

      const handleSelect = (currentValue) => {
        const newValue = currentValue === value ? "" : currentValue;
        onChange(newValue);
        setInputValue(newValue);
        setOpen(false);
      };

      const handleInputChange = (e) => {
        const newInputValue = e.target.value;
        setInputValue(newInputValue);
        if (allowCustomValue) {
          onChange(newInputValue);
        }
      };
      
      const handleInputBlur = () => {
         if (allowCustomValue && inputValue && !items.find(item => item.value.toLowerCase() === inputValue.toLowerCase())) {
            onChange(inputValue);
        }
      }

      const displayedValue = items.find((item) => item.value.toLowerCase() === (value || "").toLowerCase())?.label || value || placeholder;

      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild ref={triggerRef}>
            {allowCustomValue ? (
              <div className={cn("relative w-full", className)}>
                <Input
                  type="text"
                  placeholder={inputPlaceholder || placeholder}
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onClick={() => setOpen(true)}
                  className={cn("w-full justify-between pr-10", !value && "text-muted-foreground", className)}
                />
                <Button
                  variant="ghost"
                  role="combobox"
                  aria-expanded={open}
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setOpen(prev => !prev)}
                >
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn("w-full justify-between", !value && "text-muted-foreground", className)}
              >
                {displayedValue}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            )}
          </PopoverTrigger>
          <PopoverContent className="p-0" style={{ width: popoverWidth }}>
            <Command>
              {!allowCustomValue && <CommandInput placeholder={placeholder || "Rechercher..."} />}
              <CommandList>
                <CommandEmpty>Aucun élément trouvé.</CommandEmpty>
                <CommandGroup>
                  {items.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={handleSelect}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }