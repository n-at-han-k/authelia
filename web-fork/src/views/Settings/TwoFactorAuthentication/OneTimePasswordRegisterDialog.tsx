import { Fragment, useCallback, useEffect, useState } from "react";

import { faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LoaderCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslation } from "react-i18next";

import AppStoreBadges from "@components/AppStoreBadges";
import CopyButton from "@components/CopyButton";
import SuccessIcon from "@components/SuccessIcon";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { GoogleAuthenticator } from "@constants/constants";
import { useNotifications } from "@contexts/NotificationsContext";
import { toAlgorithmString } from "@models/TOTPConfiguration";
import { completeTOTPRegister, stopTOTPRegister } from "@services/OneTimePassword";
import { getTOTPSecret } from "@services/RegisterDevice";
import { getTOTPOptions } from "@services/UserInfoTOTPConfiguration";
import { cn } from "@utils/cn";
import OTPDial, { State } from "@views/LoginPortal/SecondFactor/OTPDial";

const steps = ["Start", "Register", "Confirm"];

interface Props {
    open: boolean;
    setClosed: () => void;
}

interface Options {
    algorithm: string;
    length: number;
    period: number;
}

interface AvailableOptions {
    algorithms: string[];
    lengths: number[];
    periods: number[];
}

const OneTimePasswordRegisterDialog = function (props: Props) {
    const { t: translate } = useTranslation("settings");

    const { createErrorNotification, createSuccessNotification } = useNotifications();

    const [selected, setSelected] = useState<Options>({ algorithm: "", length: 6, period: 30 });
    const [defaults, setDefaults] = useState<null | Options>(null);
    const [available, setAvailable] = useState<AvailableOptions>({
        algorithms: [],
        lengths: [],
        periods: [],
    });

    const [activeStep, setActiveStep] = useState(0);

    const [secretURL, setSecretURL] = useState<null | string>(null);
    const [secretValue, setSecretValue] = useState<null | string>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [hasErrored, setHasErrored] = useState(false);
    const [dialValue, setDialValue] = useState("");
    const [dialState, setDialState] = useState(State.Idle);
    const [showQRCode, setShowQRCode] = useState(true);
    const [success, setSuccess] = useState(false);

    const resetStates = useCallback(() => {
        if (defaults) {
            setSelected(defaults);
        }

        setSecretURL(null);
        setSecretValue(null);
        setIsLoading(false);
        setShowAdvanced(false);
        setHasErrored(false);
        setActiveStep(0);
        setDialValue("");
        setDialState(State.Idle);
        setShowQRCode(true);
        setSuccess(false);
    }, [defaults]);

    const handleClose = useCallback(() => {
        (async () => {
            props.setClosed();

            if (secretURL) {
                try {
                    await stopTOTPRegister();
                } catch (err) {
                    console.error(err);
                }
            }

            resetStates();
        })();
    }, [props, secretURL, resetStates]);

    const handleFinished = useCallback(() => {
        setSuccess(true);

        setTimeout(() => {
            createSuccessNotification(
                translate("Successfully {{action}} the {{item}}", {
                    action: translate("added"),
                    item: translate("One-Time Password"),
                }),
            );

            props.setClosed();
            resetStates();
        }, 750);
    }, [createSuccessNotification, props, resetStates, translate]);

    const handleOnClose = () => {
        if (!props.open) {
            return;
        }

        handleClose();
    };

    useEffect(() => {
        if (!props.open || activeStep !== 0 || defaults !== null) {
            return;
        }

        (async () => {
            const opts = await getTOTPOptions();

            const decoded = {
                algorithm: toAlgorithmString(opts.algorithm),
                length: opts.length,
                period: opts.period,
            };

            setAvailable({
                algorithms: opts.algorithms.map((algorithm) => toAlgorithmString(algorithm)),
                lengths: opts.lengths,
                periods: opts.periods,
            });

            setDefaults(decoded);
            setSelected(decoded);
        })();
    }, [props.open, activeStep, defaults, selected]);

    const handleSetStepPrevious = useCallback(() => {
        if (activeStep === 0) {
            return;
        }

        setShowAdvanced(false);
        setActiveStep((prevState) => {
            return prevState - 1;
        });
    }, [activeStep]);

    const handleSetStepNext = useCallback(() => {
        if (activeStep === steps.length - 1) {
            return;
        }

        setShowAdvanced(false);
        setActiveStep((prevState) => {
            return prevState + 1;
        });
    }, [activeStep]);

    useEffect(() => {
        if (!props.open || activeStep !== 1) {
            return;
        }

        (async () => {
            setIsLoading(true);

            try {
                const secret = await getTOTPSecret(selected.algorithm, selected.length, selected.period);
                setSecretURL(secret.otpauth_url);
                setSecretValue(secret.base32_secret);
            } catch (err) {
                console.error(err);
                if ((err as Error).message.includes("Request failed with status code 403")) {
                    createErrorNotification(
                        translate("You must use the code from the same device and browser that initiated the process"),
                    );
                } else {
                    createErrorNotification(
                        translate("Failed to register device, the provided code is expired or has already been used"),
                    );
                }
                setHasErrored(true);
            }

            setIsLoading(false);
        })();
    }, [activeStep, createErrorNotification, selected, props.open, translate]);

    useEffect(() => {
        if (!props.open || activeStep !== 2 || dialState === State.InProgress || dialValue.length !== selected.length) {
            return;
        }

        (async () => {
            setDialState(State.InProgress);

            try {
                const registerValue = dialValue;
                setDialValue("");

                await completeTOTPRegister(registerValue);

                handleFinished();
            } catch (err) {
                console.error(err);
                setDialState(State.Failure);
            }
        })();
    }, [activeStep, dialState, dialValue, dialValue.length, handleFinished, props.open, selected.length]);

    const handleChangeAlgorithm = (value: string) => {
        setSelected((prevState) => {
            return {
                ...prevState,
                algorithm: value,
            };
        });
    };

    const handleChangeLength = (value: string) => {
        setSelected((prevState) => {
            return {
                ...prevState,
                length: Number.parseInt(value),
            };
        });
    };

    const handleChangePeriod = (value: string) => {
        setSelected((prevState) => {
            return {
                ...prevState,
                period: Number.parseInt(value),
            };
        });
    };

    const toggleAdvanced = () => {
        setShowAdvanced((prevState) => !prevState);
    };

    const advanced =
        defaults !== null &&
        (available.algorithms.length !== 1 || available.lengths.length !== 1 || available.periods.length !== 1);

    const disableAdvanced =
        defaults === null ||
        (available.algorithms.length <= 1 && available.lengths.length <= 1 && available.periods.length <= 1);

    const hideAlgorithms = advanced && available.algorithms.length <= 1;
    const hideLengths = advanced && available.lengths.length <= 1;
    const hidePeriods = advanced && available.periods.length <= 1;

    function renderStep(step: number) {
        switch (step) {
            case 0:
                return (
                    <Fragment>
                        {defaults === null ? (
                            <div className="my-6 w-full">
                                <p className="text-base">Loading...</p>
                            </div>
                        ) : (
                            <div className="flex w-full flex-col">
                                <div className="my-6 w-full">
                                    <p className="text-base">{translate("To begin select next")}</p>
                                </div>
                                <div className="w-full" hidden={disableAdvanced}>
                                    <label className="flex items-center justify-center gap-2">
                                        <input
                                            id={"one-time-password-advanced"}
                                            type="checkbox"
                                            disabled={disableAdvanced}
                                            checked={showAdvanced}
                                            onChange={toggleAdvanced}
                                        />
                                        <span className={cn("text-sm", disableAdvanced && "opacity-50")}>
                                            {translate("Advanced")}
                                        </span>
                                    </label>
                                </div>
                                <div
                                    className="flex w-full items-center justify-center"
                                    hidden={disableAdvanced || !showAdvanced}
                                >
                                    <div className="flex w-full flex-col gap-2">
                                        {hideAlgorithms ? null : (
                                            <Fragment>
                                                <Label id={"lbl-adv-algorithms"}>{translate("Algorithm")}</Label>
                                                <RadioGroup
                                                    className="flex flex-row flex-wrap justify-center gap-4"
                                                    aria-labelledby={"lbl-adv-algorithms"}
                                                    value={selected.algorithm}
                                                    onValueChange={handleChangeAlgorithm}
                                                >
                                                    {available.algorithms.map((algorithm) => (
                                                        <label
                                                            key={algorithm}
                                                            className="flex items-center gap-2 text-sm"
                                                        >
                                                            <RadioGroupItem
                                                                id={`one-time-password-algorithm-${algorithm}`}
                                                                value={algorithm}
                                                            />
                                                            {algorithm}
                                                        </label>
                                                    ))}
                                                </RadioGroup>
                                            </Fragment>
                                        )}
                                        {hideLengths ? null : (
                                            <Fragment>
                                                <Label id={"lbl-adv-lengths"}>{translate("Length")}</Label>
                                                <RadioGroup
                                                    className="flex flex-row flex-wrap justify-center gap-4"
                                                    aria-labelledby={"lbl-adv-lengths"}
                                                    value={selected.length.toString()}
                                                    onValueChange={handleChangeLength}
                                                >
                                                    {available.lengths.map((length) => (
                                                        <label
                                                            key={length.toString()}
                                                            className="flex items-center gap-2 text-sm"
                                                        >
                                                            <RadioGroupItem
                                                                id={`one-time-password-length-${length.toString()}`}
                                                                value={length.toString()}
                                                            />
                                                            {length.toString()}
                                                        </label>
                                                    ))}
                                                </RadioGroup>
                                            </Fragment>
                                        )}
                                        {hidePeriods ? null : (
                                            <Fragment>
                                                <Label id={"lbl-adv-periods"}>{translate("Seconds")}</Label>
                                                <RadioGroup
                                                    className="flex flex-row flex-wrap justify-center gap-4"
                                                    aria-labelledby={"lbl-adv-periods"}
                                                    value={selected.period.toString()}
                                                    onValueChange={handleChangePeriod}
                                                >
                                                    {available.periods.map((period) => (
                                                        <label
                                                            key={period.toString()}
                                                            className="flex items-center gap-2 text-sm"
                                                        >
                                                            <RadioGroupItem
                                                                id={`one-time-password-period-${period.toString()}`}
                                                                value={period.toString()}
                                                            />
                                                            {period.toString()}
                                                        </label>
                                                    ))}
                                                </RadioGroup>
                                            </Fragment>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Fragment>
                );
            case 1:
                return (
                    <Fragment>
                        <div className="my-4 w-full">
                            <label className="flex items-center justify-center gap-2">
                                <input
                                    id={"qr-toggle"}
                                    type="checkbox"
                                    checked={showQRCode}
                                    onChange={() => {
                                        setShowQRCode((value) => !value);
                                    }}
                                />
                                <span className="text-sm">{translate("QR Code")}</span>
                            </label>
                        </div>
                        <div className="w-full" hidden={!showQRCode}>
                            <div className={cn("relative inline-block", (isLoading || hasErrored) && "blur-[10px]")}>
                                {secretURL ? (
                                    <a href={secretURL} className="text-primary hover:underline">
                                        <QRCodeSVG
                                            value={secretURL}
                                            size={200}
                                            className="my-4 inline-block bg-white p-2"
                                        />
                                        {isLoading && !hasErrored ? (
                                            <LoaderCircle
                                                className="absolute animate-spin text-white/50"
                                                style={{ left: "calc(128px - 64px)", top: "calc(128px - 64px)" }}
                                                size={128}
                                            />
                                        ) : null}
                                        {hasErrored ? (
                                            <FontAwesomeIcon
                                                icon={faTimesCircle}
                                                className="absolute text-red-400"
                                                style={{
                                                    fontSize: "8rem",
                                                    left: "calc(128px - 64px)",
                                                    top: "calc(128px - 64px)",
                                                }}
                                            />
                                        ) : null}
                                    </a>
                                ) : null}
                            </div>
                        </div>
                        <div className="w-full" hidden={showQRCode}>
                            <div className="flex flex-wrap justify-center gap-2">
                                <div className="w-1/3">
                                    <CopyButton
                                        tooltip={translate("Click to Copy")}
                                        value={secretURL}
                                        childrenCopied={translate("Copied")}
                                        fullWidth={true}
                                    >
                                        {translate("URI")}
                                    </CopyButton>
                                </div>
                                <div className="w-1/3">
                                    <CopyButton
                                        tooltip={translate("Click to Copy")}
                                        value={secretValue}
                                        childrenCopied={translate("Copied")}
                                        fullWidth={true}
                                    >
                                        {translate("Secret")}
                                    </CopyButton>
                                </div>
                                <div className="w-full">
                                    <div className="mx-auto my-1 w-64 text-left">
                                        <Label htmlFor={"secret-url"} className="mb-1">
                                            {translate("Secret")}
                                        </Label>
                                        <Input
                                            id={"secret-url"}
                                            value={secretURL ?? ""}
                                            readOnly={true}
                                            className="w-64"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden w-full md:block">
                            <div>
                                <p className="text-[0.8rem]">{translate("Need Google Authenticator?")}</p>
                                <AppStoreBadges
                                    iconSize={110}
                                    targetBlank
                                    googlePlayLink={GoogleAuthenticator.googlePlay}
                                    appleStoreLink={GoogleAuthenticator.appleStore}
                                />
                            </div>
                        </div>
                    </Fragment>
                );
            case 2:
                return (
                    <div className="w-full py-8">
                        {success ? (
                            <div className="mb-4 basis-full">
                                <SuccessIcon />
                            </div>
                        ) : (
                            <OTPDial
                                passcode={dialValue}
                                state={dialState}
                                digits={selected.length}
                                period={selected.period}
                                onChange={setDialValue}
                            />
                        )}
                    </div>
                );
        }
    }

    return (
        <Dialog
            open={props.open}
            onOpenChange={(o) => {
                if (!o) handleOnClose();
            }}
        >
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {translate("Register {{item}}", { item: translate("One-Time Password") })}
                    </DialogTitle>
                </DialogHeader>
                <p className="mb-3 text-sm text-muted-foreground">
                    {translate("This dialog handles registration of a {{item}}", {
                        item: translate("One-Time Password"),
                    })}
                </p>
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <div className="flex w-full items-center justify-center gap-4">
                        {steps.map((label, index) => (
                            <div key={label} className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        "flex size-8 items-center justify-center rounded-full border text-sm",
                                        index === activeStep
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-input text-muted-foreground",
                                    )}
                                >
                                    {index + 1}
                                </span>
                                <span
                                    className={cn(
                                        "text-sm",
                                        index === activeStep ? "font-medium" : "text-muted-foreground",
                                    )}
                                >
                                    {translate(label)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="flex w-full flex-col items-center justify-center gap-1">
                        {renderStep(activeStep)}
                    </div>
                </div>
                <DialogFooter className="sm:justify-between">
                    <Button
                        id={"dialog-previous"}
                        variant="ghost"
                        onClick={handleSetStepPrevious}
                        disabled={activeStep === 0}
                    >
                        {translate("Previous")}
                    </Button>
                    <Button id={"dialog-cancel"} variant="destructive" onClick={handleClose}>
                        {translate("Cancel")}
                    </Button>
                    <Button
                        id={"dialog-next"}
                        variant="ghost"
                        onClick={handleSetStepNext}
                        disabled={activeStep === steps.length - 1}
                    >
                        {translate("Next")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OneTimePasswordRegisterDialog;
