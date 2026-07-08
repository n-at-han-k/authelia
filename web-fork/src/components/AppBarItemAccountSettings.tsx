import { LogOut, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { SettingsRoute } from "@constants/Routes";
import { useFlowPresent } from "@hooks/Flow";
import { useRouterNavigate } from "@hooks/RouterNavigate";
import { useSignOut } from "@hooks/SignOut";
import { UserInfo } from "@models/UserInfo";

export interface Props {
    userInfo?: UserInfo;
}

const AppBarItemAccountSettings = function (props: Props) {
    const { t: translate } = useTranslation();

    const navigate = useRouterNavigate();
    const doSignOut = useSignOut();
    const flowPresent = useFlowPresent();

    if (!props.userInfo) {
        return null;
    }

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <button
                            id="account-menu"
                            aria-label={translate("Account Settings")}
                            className="ml-2 flex size-8 items-center justify-center bg-muted text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {props.userInfo.display_name.charAt(0).toUpperCase()}
                        </button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{translate("Account Settings")}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem id="account-menu-settings" onClick={() => navigate(SettingsRoute)}>
                    <Settings />
                    {translate("Settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {flowPresent ? (
                    <DropdownMenuItem id="account-menu-switch-user" onClick={() => doSignOut(true)}>
                        <LogOut />
                        {translate("Switch User")}
                    </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem id="account-menu-logout" onClick={() => doSignOut(false)}>
                    <LogOut />
                    {translate("Logout")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default AppBarItemAccountSettings;
