import { useCallback } from "react";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { useSignOut } from "@hooks/SignOut";

export interface Props {
    id: string;
    text: string;
    tooltip?: string;
    preserve?: boolean;
}

const SignOutButton = function (props: Props) {
    const { t: translate } = useTranslation(["portal"]);

    const doSignOut = useSignOut();

    const handleSignOutClick = useCallback(() => {
        doSignOut(props.preserve ? props.preserve : false);
    }, [doSignOut, props.preserve]);

    const button = (
        <Button id={props.id} variant={"secondary"} onClick={handleSignOutClick}>
            {translate(props.text)}
        </Button>
    );

    return props.tooltip ? (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{props.tooltip}</TooltipContent>
        </Tooltip>
    ) : (
        button
    );
};

export default SignOutButton;
