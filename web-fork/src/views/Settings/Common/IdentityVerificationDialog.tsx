import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import OneTimeCodeTextField from "@components/OneTimeCodeTextField";
import SuccessIcon from "@components/SuccessIcon";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { useNotifications } from "@contexts/NotificationsContext";
import {
    UserSessionElevation,
    deleteUserSessionElevation,
    generateUserSessionElevation,
    verifyUserSessionElevation,
} from "@services/UserSessionElevation";

type Props = {
    elevation?: UserSessionElevation;
    opening: boolean;
    handleClosed: (_ok: boolean) => void;
    handleOpened: () => void;
};

const IdentityVerificationDialog = function (props: Props) {
    const { elevation, handleClosed, handleOpened, opening } = props;
    const { t: translate } = useTranslation("settings");
    const { createErrorNotification } = useNotifications();

    const [closing, setClosing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [codeInput, setCodeInput] = useState("");
    const [codeDelete, setCodeDelete] = useState<string>();
    const [codeError, setCodeError] = useState(false);
    const [ready, setReady] = useState(false);
    const codeRef = useRef<HTMLInputElement>(null);

    const open = useMemo(() => ready && !closing && opening && !!elevation, [ready, closing, opening, elevation]);

    const handleClose = useCallback(
        (ok: boolean) => {
            setCodeInput("");
            setCodeDelete(undefined);
            setCodeError(false);
            setLoading(false);
            setSuccess(false);
            setClosing(false);
            setReady(false);
            handleClosed(ok);
        },
        [handleClosed],
    );

    const handleDelete = useCallback(async () => {
        if (!codeDelete) {
            throw new Error("The delete code was empty.");
        }

        await deleteUserSessionElevation(codeDelete);
    }, [codeDelete]);

    const handleCancelled = useCallback(() => {
        setClosing(true);

        handleDelete().catch(console.error);

        handleClose(false);
    }, [handleClose, handleDelete]);

    const handleSuccess = useCallback(() => {
        setSuccess(true);

        setTimeout(() => {
            handleClose(true);
        }, 750);
    }, [handleClose]);

    const handleFailure = useCallback(() => {
        setCodeInput("");
        setCodeError(true);
        setLoading(false);

        createErrorNotification(
            translate("The One-Time Code either doesn't match the one generated or an unknown error occurred"),
        );

        codeRef.current?.focus();
    }, [createErrorNotification, translate]);

    const handleSubmit = useCallback(async () => {
        if (codeInput === "") return;

        setLoading(true);
        const success = await verifyUserSessionElevation(codeInput);

        if (success) {
            handleSuccess();
        } else {
            handleFailure();
        }
    }, [codeInput, handleFailure, handleSuccess]);

    const handleSubmitKeyDown = useCallback(
        async (event: KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter") {
                if (codeInput.length === 0) {
                    setCodeError(true);
                } else {
                    await handleSubmit();
                }
            }
        },
        [codeInput.length, handleSubmit],
    );

    useEffect(() => {
        if (closing || !opening || !elevation) {
            return;
        }

        if (ready) return;

        generateUserSessionElevation()
            .then((attempt) => {
                if (!attempt) throw new Error("Failed to load the data.");

                setCodeDelete(attempt.delete_id);
                handleOpened();
                setReady(true);
            })
            .catch((error) => {
                console.error(error);
                createErrorNotification(translate("Failed to generate the One-Time Code. Please try again later."));
                handleClose(false);
            });
    }, [closing, opening, elevation, ready, translate, handleClose, handleOpened, createErrorNotification]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setCodeInput(e.target.value.replaceAll(/\s/g, ""));
        setCodeError(false);
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                if (!o) handleCancelled();
            }}
        >
            <DialogContent id={"dialog-verify-one-time-code"}>
                <DialogHeader>
                    <DialogTitle>{translate("Identity Verification")}</DialogTitle>
                </DialogHeader>
                {success ? (
                    <div className="m-auto flex w-fit flex-col p-[5rem]">
                        <SuccessIcon />
                    </div>
                ) : (
                    <div>
                        <p className="mb-2 text-sm text-muted-foreground">
                            {translate(
                                "In order to perform this action policy enforcement requires additional identity verification and a One-Time Code has been sent to your email",
                            )}
                        </p>
                        <p className="mb-2 text-sm text-muted-foreground">
                            {translate("Closing this dialog or selecting cancel will invalidate the One-Time Code")}
                        </p>
                        <div className="m-auto my-10 flex w-fit flex-col">
                            <OneTimeCodeTextField
                                id={"one-time-code"}
                                label={"One-Time Code"}
                                value={codeInput}
                                onChange={handleChange}
                                error={codeError}
                                disabled={loading}
                                ref={codeRef}
                                onKeyDown={handleSubmitKeyDown}
                            />
                        </div>
                    </div>
                )}
                {success ? null : (
                    <DialogFooter>
                        <Button
                            id={"dialog-cancel"}
                            variant={"destructive"}
                            disabled={loading}
                            onClick={handleCancelled}
                        >
                            {translate("Cancel")}
                        </Button>
                        <Button id={"dialog-verify"} disabled={loading} onClick={handleSubmit}>
                            {loading ? <LoaderCircle className="size-5 animate-spin" /> : null}
                            {translate("Verify")}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default IdentityVerificationDialog;
