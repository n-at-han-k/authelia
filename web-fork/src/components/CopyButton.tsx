import { ReactNode, useState } from "react";

import { Check, Copy, LoaderCircle } from "lucide-react";

import { Button } from "@components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { cn } from "@utils/cn";

export interface Props {
    variant?: "contained" | "outlined" | "text";
    tooltip: string;
    children: ReactNode;
    childrenCopied?: ReactNode;
    value: null | string;
    msTimeoutCopying?: number;
    msTimeoutCopied?: number;
    className?: string;
    fullWidth?: boolean;
}

const msTimeoutDefaultCopying = 500;
const msTimeoutDefaultCopied = 2000;

const variantMap = {
    contained: "default",
    outlined: "outline",
    text: "ghost",
} as const;

const CopyButton = function (props: Props) {
    const [isCopied, setIsCopied] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const msTimeoutCopying = props.msTimeoutCopying ?? msTimeoutDefaultCopying;
    const msTimeoutCopied = props.msTimeoutCopied ?? msTimeoutDefaultCopied;

    const handleCopyToClipboard = () => {
        if (isCopied || !props.value || props.value === "") {
            return;
        }

        (async (value: string) => {
            setIsCopying(true);

            await navigator.clipboard.writeText(value);

            setTimeout(() => {
                setIsCopying(false);
                setIsCopied(true);
            }, msTimeoutCopying);

            setTimeout(() => {
                setIsCopied(false);
            }, msTimeoutCopied);
        })(props.value);
    };

    const variant = variantMap[props.variant ?? "outlined"];
    const displayText = isCopied && props.childrenCopied ? props.childrenCopied : props.children;

    const className = cn(
        props.fullWidth ? "w-full" : undefined,
        isCopied ? "bg-green-600 text-white hover:bg-green-600/90" : undefined,
        props.className,
    );

    let icon;

    if (isCopying) {
        icon = <LoaderCircle className="animate-spin" />;
    } else if (isCopied) {
        icon = <Check />;
    } else {
        icon = <Copy />;
    }

    return props.value === null || props.value === "" ? (
        <Button variant={variant} disabled className={className}>
            {icon}
            {displayText}
        </Button>
    ) : (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant={variant} onClick={isCopying ? undefined : handleCopyToClipboard} className={className}>
                    {icon}
                    {displayText}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{props.tooltip}</TooltipContent>
        </Tooltip>
    );
};

export default CopyButton;
