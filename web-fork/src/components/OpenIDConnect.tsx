import { Contact, House, IdCard, LockOpen, Mail, RefreshCw, Shield, Smartphone, Terminal, Users } from "lucide-react";

import {
    ScopeAddress,
    ScopeAutheliaBearerAuthz,
    ScopeAutheliaPAM,
    ScopeEmail,
    ScopeGroups,
    ScopeOfflineAccess,
    ScopeOpenID,
    ScopePhone,
    ScopeProfile,
} from "@constants/OpenIDConnect";

export function ScopeAvatar(scope: string) {
    switch (scope) {
        case ScopeOpenID:
            return <IdCard data-testid="scope-avatar-openid" />;
        case ScopeOfflineAccess:
            return <RefreshCw data-testid="scope-avatar-offline_access" />;
        case ScopeProfile:
            return <Contact data-testid="scope-avatar-profile" />;
        case ScopeGroups:
            return <Users data-testid="scope-avatar-groups" />;
        case ScopeEmail:
            return <Mail data-testid="scope-avatar-email" />;
        case ScopePhone:
            return <Smartphone data-testid="scope-avatar-phone" />;
        case ScopeAddress:
            return <House data-testid="scope-avatar-address" />;
        case ScopeAutheliaBearerAuthz:
            return <LockOpen data-testid="scope-avatar-authelia.bearer.authz" />;
        case ScopeAutheliaPAM:
            return <Terminal data-testid="scope-avatar-authelia.pam" />;
        default:
            return <Shield data-testid="scope-avatar-policy" />;
    }
}

export function ScopeDescription(scope: string): string {
    switch (scope) {
        case ScopeOpenID:
            return "Use OpenID to verify your identity";
        case ScopeOfflineAccess:
            return "Automatically refresh these permissions without user interaction";
        case ScopeProfile:
            return "Access your profile information";
        case ScopeGroups:
            return "Access your group membership";
        case ScopeEmail:
            return "Access your email addresses";
        case ScopePhone:
            return "Access your phone number";
        case ScopeAddress:
            return "Access your address";
        case ScopeAutheliaBearerAuthz:
            return "Access protected resources logged in as you";
        case ScopeAutheliaPAM:
            return "Authenticate to a Linux system as you";
        default:
            return scope;
    }
}
