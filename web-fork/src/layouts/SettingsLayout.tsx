import { ReactNode, SyntheticEvent, useCallback, useEffect, useState } from "react";

import { LayoutDashboard, Menu, ShieldCheck, Smartphone, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Separator } from "@components/ui/separator";
import { EncodedName } from "@constants/constants";
import {
    IndexRoute,
    SecuritySubRoute,
    SettingsRoute,
    SettingsTwoFactorAuthenticationSubRoute,
} from "@constants/Routes";
import { useRouterNavigate } from "@hooks/RouterNavigate";
import { cn } from "@utils/cn";

export interface Props {
    children?: ReactNode;
    drawerWidth?: number;
}

const defaultDrawerWidth = 240;

const SettingsLayout = function (props: Props) {
    const { t: translate } = useTranslation("settings");
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        document.title = translate("Settings - {{authelia}}", { authelia: atob(String.fromCodePoint(...EncodedName)) });
    }, [translate]);

    const drawerWidth = props.drawerWidth ?? defaultDrawerWidth;

    const handleToggleDrawer = (event: SyntheticEvent) => {
        if (
            event.nativeEvent instanceof KeyboardEvent &&
            event.nativeEvent.type === "keydown" &&
            (event.nativeEvent.key === "Tab" || event.nativeEvent.key === "Shift")
        ) {
            return;
        }

        setDrawerOpen((state) => !state);
    };

    return (
        <div className="flex">
            <header className="fixed inset-x-0 top-0 z-30 bg-primary text-primary-foreground">
                <div className="flex items-center px-4 py-2">
                    <button
                        id={"settings-menu"}
                        aria-label={"open drawer"}
                        onClick={handleToggleDrawer}
                        className="mr-2 flex size-9 items-center justify-center outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        <Menu />
                    </button>
                    <h6 className={cn("flex-grow text-lg font-medium", drawerOpen && "hidden")}>
                        {translate("Settings")}
                    </h6>
                </div>
            </header>
            <nav>
                <div
                    role="presentation"
                    onKeyDown={handleToggleDrawer}
                    className={cn(
                        "fixed inset-y-0 left-0 z-40 overflow-y-auto border-r bg-background transition-transform",
                        drawerOpen ? "translate-x-0" : "-translate-x-full",
                    )}
                    style={{ width: drawerWidth }}
                >
                    <div onClick={handleToggleDrawer} className="text-center">
                        <h6 className="my-4 text-lg font-medium">{translate("Settings")}</h6>
                        <Separator />
                        <ul>
                            {navItems.map((item) => (
                                <DrawerNavItem
                                    key={item.keyname}
                                    keyname={item.keyname}
                                    text={translate(item.text)}
                                    pathname={item.pathname}
                                    icon={item.icon}
                                />
                            ))}
                        </ul>
                    </div>
                </div>
            </nav>
            <main className="flex-grow p-0 sm:p-6">
                <div className="h-14" />
                {props.children}
            </main>
        </div>
    );
};

interface NavItem {
    keyname: string;
    text: string;
    pathname: string;
    icon?: ReactNode;
}

const navItems: NavItem[] = [
    {
        icon: <LayoutDashboard className="text-primary" />,
        keyname: "overview",
        pathname: SettingsRoute,
        text: "Overview",
    },
    {
        icon: <ShieldCheck className="text-primary" />,
        keyname: "security",
        pathname: `${SettingsRoute}${SecuritySubRoute}`,
        text: "Security",
    },
    {
        icon: <Smartphone className="text-primary" />,
        keyname: "twofactor",
        pathname: `${SettingsRoute}${SettingsTwoFactorAuthenticationSubRoute}`,
        text: "Two-Factor Authentication",
    },
    { icon: <X className="text-destructive" />, keyname: "close", pathname: IndexRoute, text: "Close" },
];

const DrawerNavItem = function (props: NavItem) {
    const selected =
        globalThis.location.pathname === props.pathname || globalThis.location.pathname === props.pathname + "/";
    const navigate = useRouterNavigate();

    const handleOnClick = useCallback(() => {
        if (selected) {
            return;
        }

        navigate(props.pathname);
    }, [navigate, props, selected]);

    return (
        <li>
            <button
                id={`settings-menu-${props.keyname}`}
                onClick={handleOnClick}
                aria-current={selected ? "page" : undefined}
                className={cn(
                    "flex w-full items-center gap-3 px-4 py-2 text-left outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent",
                    selected && "bg-accent",
                )}
            >
                {props.icon ? <span className="shrink-0">{props.icon}</span> : null}
                <span>{props.text}</span>
            </button>
        </li>
    );
};

export default SettingsLayout;
