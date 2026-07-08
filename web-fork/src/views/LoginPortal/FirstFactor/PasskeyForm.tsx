import { Fragment, useCallback, useRef, useState } from "react";

import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import PasskeyIcon from "@components/PasskeyIcon";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { RedirectionURL, RequestMethod } from "@constants/SearchParams";
import { useAbortSignal } from "@hooks/Abort";
import { useFlow } from "@hooks/Flow";
import { useQueryParam } from "@hooks/QueryParam";
import { AssertionResult, AssertionResultFailureString } from "@models/WebAuthn";
import { getWebAuthnPasskeyOptions, getWebAuthnResult, postWebAuthnPasskeyResponse } from "@services/WebAuthn";

export interface Props {
    disabled: boolean;
    rememberMe: boolean;

    onAuthenticationStart: () => void;
    onAuthenticationStop: () => void;
    onAuthenticationError: (_err: Error) => void;
    onAuthenticationSuccess: (_redirectURL: string | undefined) => void;
}

const PasskeyForm = function (props: Props) {
    const { t: translate } = useTranslation();

    const redirectionURL = useQueryParam(RedirectionURL);
    const requestMethod = useQueryParam(RequestMethod);
    const { flow, id: flowID, subflow } = useFlow();
    const getSignal = useAbortSignal();

    const [loading, setLoading] = useState(false);

    const onSignInErrorCallback = useRef(props.onAuthenticationError).current;

    const handleAuthenticationStart = useCallback(() => {
        props.onAuthenticationStart();
        setLoading(true);
    }, [props]);

    const handleAuthenticationStop = useCallback(() => {
        props.onAuthenticationStop();
        setLoading(false);
    }, [props]);

    const handleSignIn = useCallback(async () => {
        if (loading) {
            return;
        }

        handleAuthenticationStart();

        const signal = getSignal();

        try {
            const optionsStatus = await getWebAuthnPasskeyOptions(signal);

            if (optionsStatus.status !== 200 || optionsStatus.options == null) {
                handleAuthenticationStop();
                onSignInErrorCallback(new Error(translate("Failed to initiate security key sign in process")));

                return;
            }

            const result = await getWebAuthnResult(optionsStatus.options);

            if (signal.aborted) return;

            if (result.result !== AssertionResult.Success) {
                handleAuthenticationStop();

                onSignInErrorCallback(new Error(translate(AssertionResultFailureString(result.result))));

                return;
            }

            if (result.response == null) {
                onSignInErrorCallback(
                    new Error(translate("The browser did not respond with the expected attestation data")),
                );
                handleAuthenticationStop();

                return;
            }

            const response = await postWebAuthnPasskeyResponse(
                result.response,
                props.rememberMe,
                redirectionURL,
                requestMethod,
                flowID,
                flow,
                subflow,
                signal,
            );

            handleAuthenticationStop();

            if (response.data.status === "OK" && response.status === 200) {
                props.onAuthenticationSuccess(response.data.data ? response.data.data.redirect : undefined);
                return;
            }

            onSignInErrorCallback(new Error(translate("The server rejected the security key")));
        } catch (err) {
            handleAuthenticationStop();

            if (axios.isCancel(err)) return;
            console.error(err);
            onSignInErrorCallback(new Error(translate("Failed to initiate security key sign in process")));
        }
    }, [
        getSignal,
        loading,
        handleAuthenticationStart,
        props,
        redirectionURL,
        requestMethod,
        flowID,
        flow,
        subflow,
        handleAuthenticationStop,
        onSignInErrorCallback,
        translate,
    ]);

    return (
        <Fragment>
            <div className="w-full">
                <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-sm uppercase text-muted-foreground">{translate("or")}</span>
                    <Separator className="flex-1" />
                </div>
            </div>
            <div className="w-full">
                <Button id="passkey-sign-in-button" className="w-full" onClick={handleSignIn} disabled={props.disabled}>
                    <PasskeyIcon />
                    {translate("Sign in with a passkey")}
                    {loading ? <LoaderCircle className="size-5 animate-spin" /> : null}
                </Button>
            </div>
        </Fragment>
    );
};

export default PasskeyForm;
