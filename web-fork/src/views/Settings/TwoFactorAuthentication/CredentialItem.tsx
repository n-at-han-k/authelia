import { MouseEvent, ReactElement, ReactNode } from "react";

import { Info, Pencil, Trash2, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { useRelativeTime } from "@hooks/RelativeTimeString";

interface Props {
    id: string;
    icon?: ReactNode;
    description: string;
    qualifier: string;
    problem?: boolean;
    created_at: Date;
    last_used_at?: Date;
    tooltipInformation?: string;
    tooltipInformationProblem?: string;
    tooltipEdit?: string;
    tooltipDelete: string;
    handleInformation?: (_event: MouseEvent<HTMLElement>) => void;
    handleEdit?: (_event: MouseEvent<HTMLElement>) => void;
    handleDelete: (_event: MouseEvent<HTMLElement>) => void;
}

const CredentialItem = function (props: Props) {
    const { t: translate } = useTranslation("settings");
    const timeSinceAdded = useRelativeTime(props.created_at);
    const timeSinceLastUsed = useRelativeTime(props.last_used_at || new Date(0));

    const tooltipInformation = props.problem ? props.tooltipInformationProblem : props.tooltipInformation;

    return (
        <div id={props.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
                <div className="flex h-full w-full flex-wrap items-center">
                    <div className="mr-1 flex w-2/12 flex-wrap sm:w-1/12 md:mr-4 xl:mr-6">{props.icon}</div>
                    <div className="w-3/12 sm:w-6/12">
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <span id={`${props.id}-description`} className="font-bold">
                                    {props.description}
                                </span>
                                {props.qualifier != "" ? (
                                    <span className="hidden px-4 text-sm sm:inline">{props.qualifier}</span>
                                ) : null}
                            </div>
                            <span className="hidden text-xs sm:block">{`${translate("Added")} ${timeSinceAdded}`}</span>
                            <span className="hidden text-xs sm:block">
                                {props.last_used_at === undefined
                                    ? translate("Never used")
                                    : `${translate("Last Used")} ${timeSinceLastUsed}`}
                            </span>
                        </div>
                    </div>
                    <div className="w-6/12 sm:w-4/12">
                        <div className="flex h-full w-full flex-wrap items-center justify-end">
                            {props.handleInformation ? (
                                <div className="w-3/12 lg:w-4/12">
                                    <TooltipElement tooltip={tooltipInformation}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={tooltipInformation}
                                            onClick={props.handleInformation}
                                            id={`${props.id}-information`}
                                        >
                                            {props.problem ? (
                                                <TriangleAlert
                                                    className="text-yellow-500"
                                                    data-testid="ReportProblemIcon"
                                                />
                                            ) : (
                                                <Info />
                                            )}
                                        </Button>
                                    </TooltipElement>
                                </div>
                            ) : null}
                            {props.handleEdit ? (
                                <div className="w-3/12 lg:w-4/12">
                                    <TooltipElement tooltip={props.tooltipEdit}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={props.tooltipEdit}
                                            onClick={props.handleEdit}
                                            id={`${props.id}-edit`}
                                        >
                                            <Pencil />
                                        </Button>
                                    </TooltipElement>
                                </div>
                            ) : null}
                            <div className="w-3/12 lg:w-4/12">
                                <TooltipElement tooltip={props.tooltipDelete}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={props.tooltipDelete}
                                        onClick={props.handleDelete}
                                        id={`${props.id}-delete`}
                                    >
                                        <Trash2 />
                                    </Button>
                                </TooltipElement>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TooltipElementProps {
    tooltip?: string;
    children: ReactElement<any, any>;
}

const TooltipElement = function (props: TooltipElementProps) {
    return props.tooltip !== undefined && props.tooltip !== "" ? (
        <Tooltip>
            <TooltipTrigger asChild>{props.children}</TooltipTrigger>
            <TooltipContent>{props.tooltip}</TooltipContent>
        </Tooltip>
    ) : (
        props.children
    );
};

export default CredentialItem;
