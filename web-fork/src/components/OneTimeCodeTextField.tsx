import { ComponentProps } from "react";

import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { cn } from "@utils/cn";

export interface Props extends ComponentProps<"input"> {
    label?: string;
    error?: boolean;
}

const OneTimeCodeTextField = function ({ className, error, id, label, ...props }: Props) {
    return (
        <div className="flex flex-col gap-2">
            {label ? <Label htmlFor={id}>{label}</Label> : null}
            <Input
                id={id}
                {...props}
                spellCheck={false}
                aria-invalid={error || undefined}
                className={cn("text-center uppercase tracking-[0.5rem]", className)}
            />
        </div>
    );
};

export default OneTimeCodeTextField;
