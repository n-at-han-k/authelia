import { ElementType, Fragment, JSX } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

export type TypographyVariant =
    "body1" | "body2" | "caption" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2";

export interface Props {
    variant: TypographyVariant;

    value?: string;

    tooltip?: string;
}

const variantElement: Record<TypographyVariant, ElementType> = {
    body1: "p",
    body2: "p",
    caption: "span",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    subtitle1: "p",
    subtitle2: "p",
};

const variantClass: Record<TypographyVariant, string> = {
    body1: "text-base",
    body2: "text-sm",
    caption: "text-xs",
    h1: "text-6xl font-light",
    h2: "text-5xl font-light",
    h3: "text-4xl",
    h4: "text-3xl",
    h5: "text-xl",
    h6: "text-lg font-medium",
    subtitle1: "text-base",
    subtitle2: "text-sm font-medium",
};

const TypographyWithTooltip = function (props: Props): JSX.Element {
    const Component = variantElement[props.variant];
    const className = variantClass[props.variant];

    if (props.tooltip) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Component className={className} aria-label={props.tooltip}>
                        {props.value}
                    </Component>
                </TooltipTrigger>
                <TooltipContent>{props.tooltip}</TooltipContent>
            </Tooltip>
        );
    }

    return (
        <Fragment>
            <Component className={className}>{props.value}</Component>
        </Fragment>
    );
};

export default TypographyWithTooltip;
