"use client"

    import * as React from "react"
    import { Dialog, DialogContent } from "@/components/ui/dialog"
    import { cn } from "@/lib/utils"
    
    const CommandContext = React.createContext(undefined)
    
    const Command = React.forwardRef(({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
          className
        )}
        {...props}
        data-cmdk-root=""
      />
    ))
    Command.displayName = "Command"
    
    const CommandDialog = ({ children, ...props }) => {
      return (
        <Dialog {...props}>
          <DialogContent className="overflow-hidden p-0 shadow-lg">
            <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
              {children}
            </Command>
          </DialogContent>
        </Dialog>
      )
    }
    
    const CommandInput = React.forwardRef(({ className, ...props }, ref) => (
      <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 shrink-0 opacity-50"
        >
          <path d="m15.5 15.5-3.5-3.5" />
          <path d="M5 11a6 6 0 1 0 12 0 6 6 0 1 0-12 0Z" />
        </svg>
        <input
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
          data-cmdk-input=""
        />
      </div>
    ))
    
    CommandInput.displayName = "CommandInput"
    
    const CommandList = React.forwardRef(({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
        {...props}
        data-cmdk-list=""
        role="listbox"
      />
    ))
    
    CommandList.displayName = "CommandList"
    
    const CommandEmpty = React.forwardRef((props, ref) => (
      <div
        ref={ref}
        className="py-6 text-center text-sm"
        {...props}
        data-cmdk-empty=""
        role="presentation"
      />
    ))
    
    CommandEmpty.displayName = "CommandEmpty"
    
    const CommandGroup = React.forwardRef(({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
          className
        )}
        {...props}
        data-cmdk-group=""
      />
    ))
    
    CommandGroup.displayName = "CommandGroup"
    
    const CommandSeparator = React.forwardRef(({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn("-mx-1 h-px bg-border", className)}
        {...props}
        data-cmdk-separator=""
      />
    ))
    CommandSeparator.displayName = "CommandSeparator"
    
    const CommandItem = React.forwardRef(({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
          className
        )}
        {...props}
        data-cmdk-item=""
        role="option"
      />
    ))
    
    CommandItem.displayName = "CommandItem"
    
    const CommandShortcut = ({
      className,
      ...props
    }) => {
      return (
        <span
          className={cn(
            "ml-auto text-xs tracking-widest text-muted-foreground",
            className
          )}
          {...props}
        />
      )
    }
    CommandShortcut.displayName = "CommandShortcut"
    
    export {
      Command,
      CommandDialog,
      CommandInput,
      CommandList,
      CommandEmpty,
      CommandGroup,
      CommandItem,
      CommandSeparator,
      CommandShortcut,
    }