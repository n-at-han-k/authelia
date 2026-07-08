import { useCallback, useEffect, useRef, useState } from "react";

import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import ComponentWithTooltip from "@components/ComponentWithTooltip";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { IndexRoute } from "@constants/Routes";
import { useNotifications } from "@contexts/NotificationsContext";
import MinimalLayout from "@layouts/MinimalLayout";
import { initiateResetPasswordProcess } from "@services/ResetPassword";

const ResetPasswordStep1 = function () {
    const [username, setUsername] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const [rateLimited, setRateLimited] = useState(false);
    const timeoutRateLimitRef = useRef<NodeJS.Timeout | null>(null);

    const { createErrorNotification, createInfoNotification } = useNotifications();
    const navigate = useNavigate();
    const { t: translate } = useTranslation();

    useEffect(() => {
        return () => {
            if (timeoutRateLimitRef.current !== null) {
                clearTimeout(timeoutRateLimitRef.current);
                timeoutRateLimitRef.current = null;
            }
        };
    }, []);

    const handleRateLimited = useCallback(
        (retryAfter: number) => {
            if (timeoutRateLimitRef.current) {
                clearTimeout(timeoutRateLimitRef.current);
            }

            setRateLimited(true);

            createErrorNotification(translate("You have made too many requests"));

            timeoutRateLimitRef.current = setTimeout(() => {
                setRateLimited(false);
                timeoutRateLimitRef.current = null;
            }, retryAfter * 1000);
        },
        [createErrorNotification, translate],
    );

    const doInitiateResetPasswordProcess = async () => {
        setError(false);
        setLoading(true);

        if (username === "") {
            setError(true);
            setLoading(false);
            createErrorNotification(translate("Username is required"));
            return;
        }

        try {
            const response = await initiateResetPasswordProcess(username);
            if (response?.limited === false) {
                createInfoNotification(translate("An email has been sent to your address to complete the process"));
                navigate(IndexRoute);
            } else if (response?.limited) {
                handleRateLimited(response.retryAfter);
            } else {
                createErrorNotification(translate("There was an issue initiating the password reset process"));
            }
        } catch {
            createErrorNotification(translate("There was an issue initiating the password reset process"));
        }
        setLoading(false);
    };

    const handleResetClick = () => {
        doInitiateResetPasswordProcess();
    };

    const handleCancelClick = () => {
        navigate(IndexRoute);
    };

    return (
        <MinimalLayout title={translate("Reset password")} id="reset-password-step1-stage">
            <div id={"form-reset-password-username"}>
                <div className="my-4 flex flex-wrap gap-4">
                    <div className="w-full">
                        <Label htmlFor="username-textfield" className="mb-2">
                            {translate("Username")}
                        </Label>
                        <Input
                            id="username-textfield"
                            disabled={loading}
                            className="w-full"
                            aria-invalid={error}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onKeyDown={(ev) => {
                                if (ev.key === "Enter") {
                                    ev.preventDefault();
                                    doInitiateResetPasswordProcess();
                                }
                            }}
                        />
                    </div>
                    <div className="flex-1">
                        <ComponentWithTooltip render={rateLimited} title={translate("You have made too many requests")}>
                            <Button
                                id="reset-button"
                                disabled={loading || rateLimited}
                                className="w-full"
                                onClick={handleResetClick}
                            >
                                {loading ? <LoaderCircle className="size-5 animate-spin" /> : null}
                                {translate("Reset")}
                            </Button>
                        </ComponentWithTooltip>
                    </div>
                    <div className="flex-1">
                        <Button id="cancel-button" disabled={loading} className="w-full" onClick={handleCancelClick}>
                            {translate("Cancel")}
                        </Button>
                    </div>
                </div>
            </div>
        </MinimalLayout>
    );
};

export default ResetPasswordStep1;
