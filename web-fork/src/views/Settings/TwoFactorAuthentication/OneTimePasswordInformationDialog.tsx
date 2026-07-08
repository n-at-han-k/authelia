import { Fragment } from "react";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Separator } from "@components/ui/separator";
import { FormatDateHumanReadable } from "@i18n/formats";
import { UserInfoTOTPConfiguration, toAlgorithmString } from "@models/TOTPConfiguration";

interface Props {
    config: null | undefined | UserInfoTOTPConfiguration;
    open: boolean;
    handleClose: () => void;
}

const OneTimePasswordInformationDialog = function (props: Props) {
    const { t: translate } = useTranslation("settings");

    return (
        <Dialog
            open={props.open}
            onOpenChange={(o) => {
                if (!o) props.handleClose();
            }}
        >
            <DialogContent aria-labelledby="one-time-password-info-dialog-title" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle id="one-time-password-info-dialog-title">
                        {translate("One-Time Password Information")}
                    </DialogTitle>
                </DialogHeader>
                {props.config ? (
                    <Fragment>
                        <p className="mb-3 text-sm text-muted-foreground">
                            {translate("Extended information for One-Time Password")}
                        </p>
                        <div className="flex flex-col gap-2">
                            <Separator />
                            <PropertyText
                                name={translate("Algorithm")}
                                value={translate("{{algorithm}}", {
                                    algorithm: toAlgorithmString(props.config.algorithm),
                                })}
                            />
                            <PropertyText
                                name={translate("Digits")}
                                value={translate("{{digits}}", {
                                    digits: props.config.digits,
                                })}
                            />
                            <PropertyText
                                name={translate("Period")}
                                value={translate("{{seconds}}", {
                                    seconds: props.config.period,
                                })}
                            />
                            <PropertyText name={translate("Issuer")} value={props.config.issuer} />
                            <PropertyText
                                name={translate("Added")}
                                value={translate("{{when, datetime}}", {
                                    formatParams: { when: FormatDateHumanReadable },
                                    when: new Date(props.config.created_at),
                                })}
                            />
                            <PropertyText
                                name={translate("Last Used")}
                                value={
                                    props.config.last_used_at
                                        ? translate("{{when, datetime}}", {
                                              formatParams: { when: FormatDateHumanReadable },
                                              when: new Date(props.config.last_used_at),
                                          })
                                        : translate("Never")
                                }
                            />
                        </div>
                    </Fragment>
                ) : (
                    <p className="mb-3 text-sm text-muted-foreground">
                        {translate("The One-Time Password information is not loaded")}
                    </p>
                )}
                <DialogFooter>
                    <Button id={"dialog-close"} variant="ghost" onClick={props.handleClose}>
                        {translate("Close")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface PropertyTextProps {
    readonly name: string;
    readonly value: string;
}

function PropertyText(props: PropertyTextProps) {
    return (
        <div className="text-base">
            <span className="font-bold">{`${props.name}: `}</span>
            <span>{props.value}</span>
        </div>
    );
}

export default OneTimePasswordInformationDialog;
