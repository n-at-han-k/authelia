import { Fragment, JSX, ReactElement, ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

export interface Props {
    render: boolean;
    title: ReactNode;
    placement?: "bottom" | "left" | "right" | "top";
    children: ReactElement;
}

const ComponentWithTooltip = function (props: Props): JSX.Element {
    return (
        <Fragment>
            {props.render ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span>{props.children}</span>
                    </TooltipTrigger>
                    <TooltipContent side={props.placement}>{props.title}</TooltipContent>
                </Tooltip>
            ) : (
                props.children
            )}
        </Fragment>
    );
};

export default ComponentWithTooltip;
