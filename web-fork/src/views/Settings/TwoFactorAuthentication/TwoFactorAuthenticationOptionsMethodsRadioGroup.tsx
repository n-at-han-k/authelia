import { ChangeEvent } from "react";

import { useTranslation } from "react-i18next";

import { Label } from "@components/ui/label";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { SecondFactorMethod } from "@models/Methods";
import { toMethod2FA } from "@services/UserInfo";

interface Props {
    id: string;
    methods: SecondFactorMethod[];
    method: SecondFactorMethod;
    name: string;
    handleMethodChanged: (_event: ChangeEvent<HTMLInputElement>) => void;
}

const TwoFactorAuthenticationOptionsMethodsRadioGroup = function (props: Props) {
    const { t: translate } = useTranslation("settings");

    const handleValueChange = (value: string) => {
        props.handleMethodChanged({ target: { value } } as ChangeEvent<HTMLInputElement>);
    };

    return (
        <div className="flex flex-col gap-2">
            <Label>{translate(props.name)}</Label>
            <RadioGroup
                value={toMethod2FA(props.method)}
                onValueChange={handleValueChange}
                className="flex flex-row gap-4"
            >
                {props.methods.map((value, _index) => {
                    const v = toMethod2FA(value);

                    switch (value) {
                        case SecondFactorMethod.WebAuthn:
                            return (
                                <div className="flex items-center gap-2" key={v}>
                                    <RadioGroupItem id={`method-${props.id}-default-webauthn`} value={v} />
                                    <Label htmlFor={`method-${props.id}-default-webauthn`}>
                                        {translate("WebAuthn")}
                                    </Label>
                                </div>
                            );
                        case SecondFactorMethod.TOTP:
                            return (
                                <div className="flex items-center gap-2" key={v}>
                                    <RadioGroupItem id={`method-${props.id}-default-one-time-password`} value={v} />
                                    <Label htmlFor={`method-${props.id}-default-one-time-password`}>
                                        {translate("One-Time Password")}
                                    </Label>
                                </div>
                            );
                        case SecondFactorMethod.MobilePush:
                            return (
                                <div className="flex items-center gap-2" key={v}>
                                    <RadioGroupItem id={`method-${props.id}-default-duo`} value={v} />
                                    <Label htmlFor={`method-${props.id}-default-duo`}>{translate("Mobile Push")}</Label>
                                </div>
                            );
                        default:
                            return null;
                    }
                })}
            </RadioGroup>
        </div>
    );
};

export default TwoFactorAuthenticationOptionsMethodsRadioGroup;
