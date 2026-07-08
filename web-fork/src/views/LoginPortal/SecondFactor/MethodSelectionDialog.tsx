import { ReactNode } from "react";

import { useTranslation } from "react-i18next";

import FingerTouchIcon from "@components/FingerTouchIcon";
import PushNotificationIcon from "@components/PushNotificationIcon";
import TimerIcon from "@components/TimerIcon";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { SecondFactorMethod } from "@models/Methods";

export interface Props {
    open: boolean;
    methods: Set<SecondFactorMethod>;
    webauthn: boolean;

    onClose: () => void;
    onClick: (_method: SecondFactorMethod) => void;
}

const MethodSelectionDialog = function (props: Props) {
    const { t: translate } = useTranslation();
    const pieChartIcon = (
        <TimerIcon width={24} height={24} period={15} color={"var(--primary)"} backgroundColor={"white"} />
    );

    return (
        <Dialog
            open={props.open}
            onOpenChange={(o) => {
                if (!o) props.onClose();
            }}
        >
            <DialogContent className={"text-center"} showCloseButton={false}>
                <DialogHeader className={"sr-only"}>
                    <DialogTitle>{translate("Methods")}</DialogTitle>
                </DialogHeader>
                <div className={"flex flex-wrap justify-center gap-2"} id={"methods-dialog"}>
                    {props.methods.has(SecondFactorMethod.TOTP) ? (
                        <MethodItem
                            id={"one-time-password-option"}
                            method={translate("Time-based One-Time Password")}
                            icon={pieChartIcon}
                            onClick={() => props.onClick(SecondFactorMethod.TOTP)}
                        />
                    ) : null}
                    {props.methods.has(SecondFactorMethod.WebAuthn) && props.webauthn ? (
                        <MethodItem
                            id={"webauthn-option"}
                            method={translate("Security Key - WebAuthn")}
                            icon={<FingerTouchIcon size={32} />}
                            onClick={() => props.onClick(SecondFactorMethod.WebAuthn)}
                        />
                    ) : null}
                    {props.methods.has(SecondFactorMethod.MobilePush) ? (
                        <MethodItem
                            id={"push-notification-option"}
                            method={translate("Push Notification")}
                            icon={<PushNotificationIcon width={32} height={32} />}
                            onClick={() => props.onClick(SecondFactorMethod.MobilePush)}
                        />
                    ) : null}
                </div>
                <DialogFooter>
                    <Button onClick={props.onClose}>{translate("Close")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

interface MethodItemProps {
    readonly id: string;
    readonly method: string;
    readonly icon: ReactNode;

    readonly onClick: () => void;
}

function MethodItem(props: MethodItemProps) {
    return (
        <div className={"method-option w-full"} id={props.id}>
            <Button className={"block w-full py-8 [&_svg]:fill-white"} onClick={props.onClick}>
                <span className={"inline-block fill-white"}>{props.icon}</span>
                <span className={"block"}>{props.method}</span>
            </Button>
        </div>
    );
}

export default MethodSelectionDialog;
