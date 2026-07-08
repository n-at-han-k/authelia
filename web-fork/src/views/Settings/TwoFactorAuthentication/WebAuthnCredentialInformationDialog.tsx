import { Fragment } from "react";

import { useTranslation } from "react-i18next";

import CopyButton from "@components/CopyButton";
import { Alert, AlertDescription } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { Separator } from "@components/ui/separator";
import { FormatDateHumanReadable } from "@i18n/formats";
import { WebAuthnCredential, toAttachmentName, toTransportName } from "@models/WebAuthn";

interface Props {
    open: boolean;
    credential?: WebAuthnCredential;
    handleClose: () => void;
}

const WebAuthnCredentialInformationDialog = function (props: Props) {
    const { t: translate } = useTranslation("settings");

    return (
        <Dialog
            open={props.open}
            onOpenChange={(o) => {
                if (!o) props.handleClose();
            }}
        >
            <DialogContent showCloseButton={false} aria-labelledby="webauthn-credential-info-dialog-title">
                <DialogHeader>
                    <DialogTitle id="webauthn-credential-info-dialog-title">
                        {translate("WebAuthn Credential Information")}
                    </DialogTitle>
                </DialogHeader>
                {props.credential ? (
                    <Fragment>
                        <p className="mb-3 text-sm text-muted-foreground">
                            {translate("Extended information for WebAuthn Credential", {
                                description: props.credential.description,
                            })}
                        </p>
                        {props.credential.legacy ? (
                            <div className="mb-3">
                                <Alert>
                                    <AlertDescription>
                                        {translate(
                                            "This is a legacy WebAuthn Credential if it's not operating normally you may need to delete it and register it again",
                                        )}
                                    </AlertDescription>
                                </Alert>
                            </div>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                            <div className="hidden md:block md:w-1/4" />
                            <div className="w-full">
                                <Separator />
                            </div>
                            <PropertyText name={translate("Description")} value={props.credential.description} />
                            <PropertyText name={translate("Relying Party ID")} value={props.credential.rpid} />
                            <PropertyText
                                name={translate("Authenticator GUID")}
                                value={props.credential.aaguid ?? translate("Unknown")}
                            />
                            <PropertyText
                                name={translate("Attestation Type")}
                                value={
                                    props.credential.attestation_type == ""
                                        ? translate("Unknown")
                                        : props.credential.attestation_type
                                }
                            />
                            <PropertyText
                                name={translate("Attestation Format")}
                                value={props.credential.attestation_format}
                            />
                            <PropertyText
                                name={translate("Attachment")}
                                value={translate(toAttachmentName(props.credential.attachment))}
                            />
                            <PropertyText
                                name={translate("Discoverable")}
                                value={props.credential.discoverable ? translate("Yes") : translate("No")}
                            />
                            <PropertyText
                                name={translate("User Verified")}
                                value={props.credential.verified ? translate("Yes") : translate("No")}
                            />
                            <PropertyText
                                name={translate("Backup State")}
                                value={
                                    !props.credential.backup_eligible
                                        ? translate("Not Eligible")
                                        : props.credential.backup_state
                                          ? translate("Backed Up")
                                          : translate("Eligible")
                                }
                            />

                            <PropertyText
                                name={translate("Transports")}
                                value={
                                    props.credential.transports === null || props.credential.transports.length === 0
                                        ? translate("Unknown")
                                        : props.credential.transports
                                              .map((transport) => toTransportName(transport))
                                              .join(", ")
                                }
                            />
                            <PropertyText
                                name={translate("Clone Warning")}
                                value={props.credential.clone_warning ? translate("Yes") : translate("No")}
                            />
                            <PropertyText name={translate("Usage Count")} value={`${props.credential.sign_count}`} />
                            <PropertyText
                                name={translate("Added")}
                                value={translate("{{when, datetime}}", {
                                    formatParams: { when: FormatDateHumanReadable },
                                    when: new Date(props.credential.created_at),
                                })}
                            />
                            <PropertyText
                                name={translate("Last Used")}
                                value={
                                    props.credential.last_used_at
                                        ? translate("{{when, datetime}}", {
                                              formatParams: { when: FormatDateHumanReadable },
                                              when: new Date(props.credential.last_used_at),
                                          })
                                        : translate("Never")
                                }
                            />
                        </div>
                    </Fragment>
                ) : (
                    <p className="mb-3 text-sm text-muted-foreground">
                        {translate("The WebAuthn Credential information is not loaded")}
                    </p>
                )}
                <DialogFooter>
                    {props.credential ? (
                        <Fragment>
                            <CopyButton
                                variant={"contained"}
                                tooltip={translate("Click to copy the {{value}}", { value: "KID" })}
                                value={props.credential.kid.toString()}
                                fullWidth={false}
                                childrenCopied={translate("Copied")}
                            >
                                {translate("KID")}
                            </CopyButton>
                            <CopyButton
                                variant={"contained"}
                                tooltip={translate("Click to copy the {{value}}", { value: translate("Public Key") })}
                                value={props.credential.public_key.toString()}
                                fullWidth={false}
                                childrenCopied={translate("Copied")}
                            >
                                {translate("Public Key")}
                            </CopyButton>
                        </Fragment>
                    ) : undefined}
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
        <div className="w-full">
            <span className="font-bold">{`${props.name}: `}</span>
            <span>{props.value}</span>
        </div>
    );
}

export default WebAuthnCredentialInformationDialog;
