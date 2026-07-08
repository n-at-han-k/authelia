import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";

import axios from "axios";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import PasswordMeter from "@components/PasswordMeter";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { useNotifications } from "@contexts/NotificationsContext";
import useCheckCapsLock from "@hooks/CapsLock";
import { PasswordPolicyConfiguration, PasswordPolicyMode } from "@models/PasswordPolicy";
import { postPasswordChange } from "@services/ChangePassword";
import { getPasswordPolicyConfiguration } from "@services/PasswordPolicyConfiguration";

interface Props {
    username: string;
    disabled?: boolean;
    open: boolean;
    setClosed: () => void;
}

const ChangePasswordDialog = (props: Props) => {
    const { t: translate } = useTranslation(["settings", "portal"]);

    const { createErrorNotification, createSuccessNotification } = useNotifications();

    const [loading, setLoading] = useState(true);
    const [oldPassword, setOldPassword] = useState("");
    const [oldPasswordError, setOldPasswordError] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [repeatNewPassword, setRepeatNewPassword] = useState("");
    const [repeatNewPasswordError, setRepeatNewPasswordError] = useState(false);
    const [isCapsLockOnOldPW, setIsCapsLockOnOldPW] = useState(false);
    const [isCapsLockOnNewPW, setIsCapsLockOnNewPW] = useState(false);
    const [isCapsLockOnRepeatNewPW, setIsCapsLockOnRepeatNewPW] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showRepeatNewPassword, setShowRepeatNewPassword] = useState(false);

    const oldPasswordRef = useRef<HTMLInputElement | null>(null);
    const newPasswordRef = useRef<HTMLInputElement | null>(null);
    const repeatNewPasswordRef = useRef<HTMLInputElement | null>(null);

    const [pPolicy, setPPolicy] = useState<PasswordPolicyConfiguration>({
        max_length: 0,
        min_length: 8,
        min_score: 0,
        mode: PasswordPolicyMode.Disabled,
        require_lowercase: false,
        require_number: false,
        require_special: false,
        require_uppercase: false,
    });

    const checkCapsLockOldPW = useCheckCapsLock(setIsCapsLockOnOldPW);
    const checkCapsLockNewPW = useCheckCapsLock(setIsCapsLockOnNewPW);
    const checkCapsLockRepeatNewPW = useCheckCapsLock(setIsCapsLockOnRepeatNewPW);

    const resetPasswordErrors = useCallback(() => {
        setOldPasswordError(false);
        setNewPasswordError(false);
        setRepeatNewPasswordError(false);
    }, []);

    const resetCapsLockErrors = useCallback(() => {
        setIsCapsLockOnOldPW(false);
        setIsCapsLockOnNewPW(false);
        setIsCapsLockOnRepeatNewPW(false);
    }, []);

    const resetStates = useCallback(() => {
        setOldPassword("");
        setNewPassword("");
        setRepeatNewPassword("");

        resetPasswordErrors();
        resetCapsLockErrors();

        setLoading(false);
    }, [resetPasswordErrors, resetCapsLockErrors]);

    const handleClose = useCallback(() => {
        props.setClosed();
        resetStates();
    }, [props, resetStates]);

    useEffect(() => {
        (async () => {
            try {
                const policy = await getPasswordPolicyConfiguration();
                setPPolicy(policy);
                setLoading(false);
            } catch {
                createErrorNotification(
                    translate("There was an issue completing the process the verification token might have expired", {
                        ns: "portal",
                    }),
                );
            }
        })();
    }, [createErrorNotification, translate]);

    const handlePasswordChange = useCallback(async () => {
        setLoading(true);
        if (oldPassword.trim() === "" || newPassword.trim() === "" || repeatNewPassword.trim() === "") {
            if (oldPassword.trim() === "") {
                setOldPasswordError(true);
            }
            if (newPassword.trim() === "") {
                setNewPasswordError(true);
            }
            if (repeatNewPassword.trim() === "") {
                setRepeatNewPasswordError(true);
            }
            setLoading(false);
            return;
        }
        if (newPassword !== repeatNewPassword) {
            setNewPasswordError(true);
            setRepeatNewPasswordError(true);
            createErrorNotification(translate("Passwords do not match"));
            setLoading(false);
            return;
        }

        try {
            await postPasswordChange(props.username, oldPassword, newPassword);
            createSuccessNotification(translate("Password changed successfully"));
            handleClose();
        } catch (err) {
            resetPasswordErrors();
            setLoading(false);
            if (axios.isAxiosError(err) && err.response) {
                switch (err.response.status) {
                    case 400: // Bad Request - Weak Password
                        setNewPasswordError(true);
                        setRepeatNewPasswordError(true);
                        createErrorNotification(
                            translate("Your supplied password does not meet the password policy requirements"),
                        );
                        break;

                    case 401: // Unauthorized - Incorrect Password
                        setOldPasswordError(true);
                        createErrorNotification(translate("Incorrect password"));
                        break;

                    case 500: // Internal Server Error
                    default:
                        createErrorNotification(translate("There was an issue changing the password"));
                        break;
                }
            } else {
                // Handle non-axios errors
                createErrorNotification(translate("There was an issue changing the password"));
            }
            return;
        }
    }, [
        createErrorNotification,
        createSuccessNotification,
        resetPasswordErrors,
        handleClose,
        newPassword,
        oldPassword,
        repeatNewPassword,
        props.username,
        translate,
    ]);

    const handleOldPWKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== "Enter") return;
            if (!oldPassword.length) {
                setOldPasswordError(true);
            } else if (newPasswordRef.current) {
                newPasswordRef.current.focus();
            }
        },
        [oldPassword.length],
    );

    const handleNewPWKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== "Enter") return;
            if (!newPassword.length) {
                setNewPasswordError(true);
            } else if (repeatNewPasswordRef.current) {
                repeatNewPasswordRef.current.focus();
            }
        },
        [newPassword.length],
    );

    const handleRepeatNewPWKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== "Enter") return;
            if (!repeatNewPassword.length) {
                setRepeatNewPasswordError(true);
            } else {
                handlePasswordChange().catch(console.error);
            }
        },
        [handlePasswordChange, repeatNewPassword.length],
    );

    const disabled = props.disabled || false;

    return (
        <Dialog
            open={props.open}
            onOpenChange={(o) => {
                if (!o) handleClose();
            }}
        >
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>{translate("Change Password")}</DialogTitle>
                </DialogHeader>
                <form id="change-password-form" className="flex flex-col gap-4 pt-2 text-center">
                    <div className="w-full">
                        <Label htmlFor="old-password" className="mb-2">
                            <span>{translate("Old Password")}</span>
                            <span> *</span>
                        </Label>
                        <div className="relative">
                            <Input
                                ref={oldPasswordRef}
                                id="old-password"
                                required
                                className="w-full pr-10"
                                value={oldPassword}
                                aria-invalid={oldPasswordError}
                                disabled={disabled || loading}
                                onChange={(v) => setOldPassword(v.target.value)}
                                onFocus={() => setOldPasswordError(false)}
                                type={showOldPassword ? "text" : "password"}
                                autoCapitalize="off"
                                autoComplete="off"
                                onKeyDown={handleOldPWKeyDown}
                                onKeyUp={checkCapsLockOldPW}
                                onBlur={() => setIsCapsLockOnOldPW(false)}
                            />
                            <button
                                type="button"
                                aria-label={translate("Toggle password visibility")}
                                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
                                onMouseDown={() => setShowOldPassword(true)}
                                onMouseUp={() => setShowOldPassword(false)}
                                onMouseLeave={() => setShowOldPassword(false)}
                                onTouchStart={() => setShowOldPassword(true)}
                                onTouchEnd={() => setShowOldPassword(false)}
                                onTouchCancel={() => setShowOldPassword(false)}
                            >
                                {showOldPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                            </button>
                        </div>
                        <p className="text-sm text-destructive">
                            {isCapsLockOnOldPW ? translate("Caps Lock is on") : " "}
                        </p>
                    </div>
                    <div className="w-full">
                        <Label htmlFor="new-password" className="mb-2">
                            <span>{translate("New Password")}</span>
                            <span> *</span>
                        </Label>
                        <div className="relative">
                            <Input
                                ref={newPasswordRef}
                                id="new-password"
                                required
                                className="w-full pr-10"
                                disabled={disabled || loading}
                                value={newPassword}
                                aria-invalid={newPasswordError}
                                onChange={(v) => setNewPassword(v.target.value)}
                                onFocus={() => setNewPasswordError(false)}
                                type={showNewPassword ? "text" : "password"}
                                autoCapitalize="off"
                                autoComplete="off"
                                onKeyDown={handleNewPWKeyDown}
                                onKeyUp={checkCapsLockNewPW}
                                onBlur={() => setIsCapsLockOnNewPW(false)}
                            />
                            <button
                                type="button"
                                aria-label={translate("Toggle password visibility")}
                                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
                                onMouseDown={() => setShowNewPassword(true)}
                                onMouseUp={() => setShowNewPassword(false)}
                                onMouseLeave={() => setShowNewPassword(false)}
                                onTouchStart={() => setShowNewPassword(true)}
                                onTouchEnd={() => setShowNewPassword(false)}
                                onTouchCancel={() => setShowNewPassword(false)}
                            >
                                {showNewPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                            </button>
                        </div>
                        <p className="text-sm text-destructive">
                            {isCapsLockOnNewPW ? translate("Caps Lock is on") : " "}
                        </p>
                        {pPolicy.mode === PasswordPolicyMode.Disabled ? null : (
                            <PasswordMeter value={newPassword} policy={pPolicy} />
                        )}
                    </div>
                    <div className="w-full">
                        <Label htmlFor="repeat-new-password" className="mb-2">
                            <span>{translate("Repeat New Password")}</span>
                            <span> *</span>
                        </Label>
                        <div className="relative">
                            <Input
                                ref={repeatNewPasswordRef}
                                id="repeat-new-password"
                                required
                                className="w-full pr-10"
                                disabled={disabled || loading}
                                value={repeatNewPassword}
                                aria-invalid={repeatNewPasswordError}
                                onChange={(v) => setRepeatNewPassword(v.target.value)}
                                onFocus={() => setRepeatNewPasswordError(false)}
                                type={showRepeatNewPassword ? "text" : "password"}
                                autoCapitalize="off"
                                autoComplete="off"
                                onKeyDown={handleRepeatNewPWKeyDown}
                                onKeyUp={checkCapsLockRepeatNewPW}
                                onBlur={() => setIsCapsLockOnRepeatNewPW(false)}
                            />
                            <button
                                type="button"
                                aria-label={translate("Toggle password visibility")}
                                className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
                                onMouseDown={() => setShowRepeatNewPassword(true)}
                                onMouseUp={() => setShowRepeatNewPassword(false)}
                                onMouseLeave={() => setShowRepeatNewPassword(false)}
                                onTouchStart={() => setShowRepeatNewPassword(true)}
                                onTouchEnd={() => setShowRepeatNewPassword(false)}
                                onTouchCancel={() => setShowRepeatNewPassword(false)}
                            >
                                {showRepeatNewPassword ? <Eye className="size-5" /> : <EyeOff className="size-5" />}
                            </button>
                        </div>
                        <p className="text-sm text-destructive">
                            {isCapsLockOnRepeatNewPW ? translate("Caps Lock is on") : " "}
                        </p>
                    </div>
                </form>
                <DialogFooter>
                    <Button id={"password-change-dialog-cancel"} variant={"destructive"} onClick={handleClose}>
                        {translate("Cancel")}
                    </Button>
                    <Button
                        id={"password-change-dialog-submit"}
                        onClick={handlePasswordChange}
                        disabled={!(oldPassword.length && newPassword.length && repeatNewPassword.length) || loading}
                    >
                        {loading ? <LoaderCircle className="size-5 animate-spin" /> : null}
                        {translate("Submit")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ChangePasswordDialog;
