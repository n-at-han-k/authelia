import { FC, Fragment, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { Checkbox } from "@components/ui/checkbox";
import { Label } from "@components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";

export interface Props {
    pre_configuration: boolean;
    onChangePreConfiguration: (_value: boolean) => void;
}

const DecisionFormPreConfiguration: FC<Props> = (props: Props) => {
    const { t: translate } = useTranslation(["consent"]);

    const [preConfigure, setPreConfigure] = useState(false);

    const handlePreConfigureChanged = () => {
        setPreConfigure((preConfigure) => !preConfigure);
    };

    useEffect(() => {
        props.onChangePreConfiguration(preConfigure);
    }, [preConfigure, props]);

    return (
        <Fragment>
            {props.pre_configuration ? (
                <div className="w-full">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Label htmlFor="pre-configure" className="inline-flex">
                                <Checkbox
                                    id="pre-configure"
                                    value="preConfigure"
                                    checked={preConfigure}
                                    onCheckedChange={handlePreConfigureChanged}
                                />
                                <span>{translate("Remember Consent")}</span>
                            </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                            {translate("This saves this consent as a pre-configured consent for future use")}
                        </TooltipContent>
                    </Tooltip>
                </div>
            ) : null}
        </Fragment>
    );
};

export default DecisionFormPreConfiguration;
