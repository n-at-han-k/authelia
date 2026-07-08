import { useEffect } from "react";

import { Fingerprint, Info, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { SecuritySubRoute, SettingsRoute, SettingsTwoFactorAuthenticationSubRoute } from "@constants/Routes";
import { useNotifications } from "@contexts/NotificationsContext";
import { useRouterNavigate } from "@hooks/RouterNavigate";
import { useUserInfoGET } from "@hooks/UserInfo";
import { SecondFactorMethod } from "@models/Methods";
import { cn } from "@utils/cn";

const SettingsView = function () {
    const { t: translate } = useTranslation(["settings", "portal"]);
    const { createErrorNotification } = useNotifications();
    const navigate = useRouterNavigate();

    const [userInfo, fetchUserInfo, , fetchUserInfoError] = useUserInfoGET();

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    useEffect(() => {
        if (fetchUserInfoError) {
            createErrorNotification(translate("There was an issue retrieving user preferences", { ns: "portal" }));
        }
    }, [fetchUserInfoError, createErrorNotification, translate]);

    const displayName = userInfo?.display_name ?? "";
    const primaryEmail = userInfo?.emails?.[0];
    const additionalEmails = userInfo?.emails?.slice(1) ?? [];

    const factors = [
        {
            configured: userInfo?.has_totp,
            icon: <KeyRound className="size-4 text-muted-foreground" />,
            label: translate("One-Time Password"),
        },
        {
            configured: userInfo?.has_webauthn,
            icon: <Fingerprint className="size-4 text-muted-foreground" />,
            label: translate("WebAuthn"),
        },
        {
            configured: userInfo?.has_duo,
            icon: <Smartphone className="size-4 text-muted-foreground" />,
            label: translate("Mobile Push"),
        },
    ];

    return (
        <section className="py-6 text-left">
            <div className="container max-w-5xl tracking-tight">
                <div className="flex flex-col gap-3 border-b pb-8">
                    <h3 className="text-2xl font-semibold">{translate("Your Profile")}</h3>
                    <div className="flex w-full items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">
                        <Info className="size-3.5 shrink-0" />
                        {translate("Manage your account details and sign-in methods.")}
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-start gap-8 sm:mt-0 sm:flex-row">
                    <div className="flex flex-col items-start gap-4 sm:py-10">
                        <div className="flex size-30 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
                            {getInitials(displayName)}
                        </div>

                        <div className="space-y-2">
                            <p className="text-lg font-semibold">{displayName}</p>
                            {primaryEmail ? <p className="text-sm text-muted-foreground">{primaryEmail}</p> : null}
                            <div className="flex items-center gap-3 pt-1">
                                <Button
                                    id="settings-security"
                                    type="button"
                                    onClick={() => navigate(`${SettingsRoute}${SecuritySubRoute}`)}
                                >
                                    <ShieldCheck /> {translate("Security")}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full space-y-8 sm:border-l sm:py-10 sm:pl-8">
                        <div className="grid gap-4 gap-y-8 border-b pb-8">
                            <div className="space-y-2">
                                <Label htmlFor="display-name">{translate("Display Name")}</Label>
                                <Input id="display-name" value={displayName} disabled readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{translate("Primary Email Address")}</Label>
                                <div>
                                    <Input id="email" value={primaryEmail ?? ""} disabled readOnly />
                                    {additionalEmails.length ? (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {translate("Also linked")}: {additionalEmails.join(", ")}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="two-factor-method">{translate("Preferred Two-Factor Method")}</Label>
                                <Input
                                    id="two-factor-method"
                                    value={userInfo ? methodLabel(userInfo.method, translate) : ""}
                                    disabled
                                    readOnly
                                />
                            </div>
                            <div className="space-y-3">
                                <Label>{translate("Registered Methods")}</Label>
                                <div className="grid gap-2">
                                    {factors.map((factor) => (
                                        <div
                                            key={factor.label}
                                            className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                                        >
                                            <span className="flex items-center gap-2">
                                                {factor.icon}
                                                {factor.label}
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-xs font-medium",
                                                    factor.configured ? "text-foreground" : "text-muted-foreground",
                                                )}
                                            >
                                                {factor.configured
                                                    ? translate("Registered")
                                                    : translate("Not configured")}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <a
                                    href="#"
                                    className="text-xs underline"
                                    onClick={(ev) => {
                                        ev.preventDefault();
                                        navigate(`${SettingsRoute}${SettingsTwoFactorAuthenticationSubRoute}`);
                                    }}
                                >
                                    {translate("Manage two-factor authentication")}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
        return "";
    }
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function methodLabel(method: SecondFactorMethod, translate: (_key: string) => string): string {
    switch (method) {
        case SecondFactorMethod.TOTP:
            return translate("One-Time Password");
        case SecondFactorMethod.WebAuthn:
            return translate("WebAuthn");
        case SecondFactorMethod.MobilePush:
            return translate("Mobile Push");
        default:
            return translate("None");
    }
}

export default SettingsView;
