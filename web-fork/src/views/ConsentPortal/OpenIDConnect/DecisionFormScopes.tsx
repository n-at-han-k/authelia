import { FC } from "react";

import { useTranslation } from "react-i18next";

import { ScopeAvatar } from "@components/OpenIDConnect";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { formatScope } from "@services/ConsentOpenIDConnect";

export interface Props {
    scopes: string[];
}

const DecisionFormScopes: FC<Props> = (props: Props) => {
    const { t: translate } = useTranslation(["consent"]);

    return (
        <div className="w-full">
            <div className="text-center">
                <ul className="my-4 inline-block text-left">
                    {props.scopes.map((scope: string) => (
                        <Tooltip key={scope}>
                            <TooltipTrigger asChild>
                                <li id={"scope-" + scope} className="flex items-center gap-3 px-4 py-1">
                                    <span className="flex items-center text-icon fill-icon">{ScopeAvatar(scope)}</span>
                                    <span>{formatScope(translate(`scopes.${scope}`), scope)}</span>
                                </li>
                            </TooltipTrigger>
                            <TooltipContent>{translate("Scope", { name: scope })}</TooltipContent>
                        </Tooltip>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DecisionFormScopes;
