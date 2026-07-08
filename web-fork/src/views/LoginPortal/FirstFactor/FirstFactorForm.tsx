import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BroadcastChannel } from "broadcast-channel";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Checkbox } from "@components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@components/ui/field";
import { Input } from "@components/ui/input";
import { ResetPasswordStep1Route } from "@constants/Routes";
import { RedirectionURL, RequestMethod } from "@constants/SearchParams";
import { useNotifications } from "@contexts/NotificationsContext";
import { useFlow } from "@hooks/Flow";
import { useUserCode } from "@hooks/OpenIDConnect";
import { useQueryParam } from "@hooks/QueryParam";
import LoginLayout from "@layouts/LoginLayout";
import { IsCapsLockModified } from "@services/CapsLock";
import { postFirstFactor } from "@services/Password";
import PasskeyForm from "@views/LoginPortal/FirstFactor/PasskeyForm";

export interface Props {
    disabled: boolean;
    passkeyLogin: boolean;
    rememberMe: boolean;
    resetPassword: boolean;
    resetPasswordCustomURL: string;

    onAuthenticationStart: () => void;
    onAuthenticationStop: () => void;
    onAuthenticationSuccess: (_redirectURL: string | undefined) => void;
    onChannelStateChange: () => void;
}

const FirstFactorForm = function (props: Props) {
    const { t: translate } = useTranslation();

    const navigate = useNavigate();
    const redirectionURL = useQueryParam(RedirectionURL);
    const requestMethod = useQueryParam(RequestMethod);
    const { flow, id: flowID, subflow } = useFlow();
    const userCode = useUserCode();
    const { createErrorNotification } = useNotifications();

    const loginChannel = useMemo(() => new BroadcastChannel<boolean>("login"), []);

    const [rememberMe, setRememberMe] = useState(false);
    const [username, setUsername] = useState("");
    const [usernameError, setUsernameError] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordCapsLock, setPasswordCapsLock] = useState(false);
    const [passwordCapsLockPartial, setPasswordCapsLockPartial] = useState(false);
    const [passwordError, setPasswordError] = useState(false);
    const [loading, setLoading] = useState(false);

    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    const focusUsername = useCallback(() => {
        if (usernameRef.current === null) return;

        usernameRef.current.focus();
    }, [usernameRef]);

    const focusPassword = useCallback(() => {
        if (passwordRef.current === null) return;

        passwordRef.current.focus();
    }, [passwordRef]);

    useEffect(() => {
        const timeout = setTimeout(() => focusUsername(), 10);
        return () => clearTimeout(timeout);
    }, [focusUsername]);

    useEffect(() => {
        const handleMessage = (authenticated: boolean) => {
            if (authenticated) {
                props.onChannelStateChange();
            }
        };

        loginChannel.addEventListener("message", handleMessage);

        return () => {
            loginChannel.removeEventListener("message", handleMessage);
        };
    }, [loginChannel, redirectionURL, props]);

    const disabled = props.disabled;

    const handleRememberMeChange = (checked: boolean) => {
        setRememberMe(checked === true);
    };

    const handleSignIn = useCallback(async () => {
        if (username === "" || password === "") {
            if (username === "") {
                setUsernameError(true);
            }

            if (password === "") {
                setPasswordError(true);
            }
            return;
        }

        setLoading(true);

        props.onAuthenticationStart();

        try {
            const res = await postFirstFactor(
                username,
                password,
                rememberMe,
                redirectionURL,
                requestMethod,
                flowID,
                flow,
                subflow,
                userCode,
            );

            setLoading(false);

            await loginChannel.postMessage(true);
            props.onAuthenticationSuccess(res ? res.redirect : undefined);
        } catch (err) {
            console.error(err);
            createErrorNotification(translate("Incorrect username or password"));
            setLoading(false);
            props.onAuthenticationStop();
            setPassword("");
            focusPassword();
        }
    }, [
        username,
        password,
        props,
        rememberMe,
        redirectionURL,
        requestMethod,
        flowID,
        flow,
        subflow,
        userCode,
        loginChannel,
        createErrorNotification,
        translate,
        focusPassword,
    ]);

    const handleResetPasswordClick = () => {
        if (props.resetPassword) {
            if (props.resetPasswordCustomURL) {
                window.open(props.resetPasswordCustomURL);
            } else {
                navigate(ResetPasswordStep1Route);
            }
        }
    };

    const handleUsernameKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                if (!username.length) {
                    setUsernameError(true);
                } else if (username.length && password.length) {
                    handleSignIn().catch(console.error);
                } else {
                    setUsernameError(false);
                    focusPassword();
                }
            }
        },
        [focusPassword, handleSignIn, password.length, username.length],
    );

    const handlePasswordKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                if (!username.length) {
                    focusUsername();
                } else if (!password.length) {
                    focusPassword();
                }
                handleSignIn().catch(console.error);
                event.preventDefault();
            }
        },
        [focusPassword, focusUsername, handleSignIn, password.length, username.length],
    );

    const handlePasswordKeyUp = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (password.length <= 1) {
                setPasswordCapsLock(false);
                setPasswordCapsLockPartial(false);

                if (password.length === 0) {
                    return;
                }
            }

            const modified = IsCapsLockModified(event);

            if (modified === null) return;

            if (modified) {
                setPasswordCapsLock(true);
            } else {
                setPasswordCapsLockPartial(true);
            }
        },
        [password.length],
    );

    const handleRememberMeKeyDown = useCallback(
        (event: KeyboardEvent<HTMLButtonElement>) => {
            if (event.key === "Enter") {
                if (!username.length) {
                    focusUsername();
                } else if (!password.length) {
                    focusPassword();
                }
                handleSignIn().catch(console.error);
            }
        },
        [focusPassword, focusUsername, handleSignIn, password.length, username.length],
    );

    return (
        <LoginLayout id="first-factor-stage" title={translate("Sign in")}>
            <Card className="overflow-hidden text-left">
                <CardContent className="p-6 md:p-8">
                    <FieldGroup id="form-login">
                        <div className="flex flex-col items-center gap-1 text-center">
                            <h1 className="text-2xl font-bold">{translate("Welcome back")}</h1>
                            <p className="text-balance text-sm text-muted-foreground">
                                {translate("Sign in to your account")}
                            </p>
                        </div>
                        <Field>
                            <FieldLabel htmlFor="username-textfield">{translate("Username")}</FieldLabel>
                            <Input
                                ref={usernameRef}
                                id="username-textfield"
                                required
                                value={username}
                                aria-invalid={usernameError}
                                disabled={disabled}
                                className="w-full"
                                onChange={(v) => setUsername(v.target.value)}
                                onFocus={() => setUsernameError(false)}
                                autoCapitalize="none"
                                autoComplete="username"
                                onKeyDown={handleUsernameKeyDown}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password-textfield">{translate("Password")}</FieldLabel>
                            <div className="relative">
                                <Input
                                    ref={passwordRef}
                                    id="password-textfield"
                                    required
                                    className="w-full pr-10"
                                    disabled={disabled}
                                    value={password}
                                    aria-invalid={passwordError}
                                    onChange={(v) => setPassword(v.target.value)}
                                    onFocus={() => setPasswordError(false)}
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    onKeyDown={handlePasswordKeyDown}
                                    onKeyUp={handlePasswordKeyUp}
                                />
                                <button
                                    type="button"
                                    aria-label="toggle password visibility"
                                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
                                    onMouseDown={() => setShowPassword(true)}
                                    onMouseUp={() => setShowPassword(false)}
                                    onMouseLeave={() => setShowPassword(false)}
                                    onTouchStart={() => setShowPassword(true)}
                                    onTouchEnd={() => setShowPassword(false)}
                                    onTouchCancel={() => setShowPassword(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === " ") {
                                            setShowPassword(true);
                                            e.preventDefault();
                                        }
                                    }}
                                    onKeyUp={(e) => {
                                        if (e.key === " ") {
                                            setShowPassword(false);
                                            e.preventDefault();
                                        }
                                    }}
                                >
                                    {showPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                                </button>
                            </div>
                        </Field>
                        {passwordCapsLock ? (
                            <Alert>
                                <AlertTitle>{translate("Warning")}</AlertTitle>
                                <AlertDescription>
                                    {passwordCapsLockPartial
                                        ? translate("The password was partially entered with Caps Lock")
                                        : translate("The password was entered with Caps Lock")}
                                </AlertDescription>
                            </Alert>
                        ) : null}
                        {props.rememberMe ? (
                            <Field orientation="horizontal" className="items-center gap-2">
                                <Checkbox
                                    id="remember-checkbox"
                                    disabled={disabled}
                                    checked={rememberMe}
                                    onCheckedChange={handleRememberMeChange}
                                    onKeyDown={handleRememberMeKeyDown}
                                    value="rememberMe"
                                />
                                <FieldLabel htmlFor="remember-checkbox" className="font-normal">
                                    {translate("Remember me")}
                                </FieldLabel>
                            </Field>
                        ) : null}
                        <Field>
                            <Button id="sign-in-button" className="w-full" disabled={disabled} onClick={handleSignIn}>
                                {translate("Sign in")}
                                {loading ? <LoaderCircle className="size-5 animate-spin" /> : null}
                            </Button>
                        </Field>
                        {props.passkeyLogin ? (
                            <PasskeyForm
                                disabled={props.disabled}
                                rememberMe={props.rememberMe}
                                onAuthenticationError={(err) => createErrorNotification(err.message)}
                                onAuthenticationStart={() => {
                                    setUsername("");
                                    setPassword("");
                                    props.onAuthenticationStart();
                                }}
                                onAuthenticationStop={props.onAuthenticationStop}
                                onAuthenticationSuccess={props.onAuthenticationSuccess}
                            />
                        ) : null}
                        {props.resetPassword ? (
                            <div className="flex justify-end">
                                <a
                                    id="reset-password-button"
                                    onClick={handleResetPasswordClick}
                                    className="cursor-pointer text-sm text-primary hover:underline"
                                >
                                    {translate("Reset password?")}
                                </a>
                            </div>
                        ) : null}
                    </FieldGroup>
                </CardContent>
            </Card>
        </LoginLayout>
    );
};

export default FirstFactorForm;
