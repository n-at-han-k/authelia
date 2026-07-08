import { Fragment } from "react";

import { useTranslation } from "react-i18next";

import PrivacyPolicyLink from "@components/PrivacyPolicyLink";
import { EncodedName, EncodedURL } from "@constants/constants";
import { getPrivacyPolicyEnabled } from "@utils/Configuration";

export interface Props {}

const Brand = function () {
    const { t: translate } = useTranslation();

    const privacyEnabled = getPrivacyPolicyEnabled();

    return (
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
            <a
                href={atob(String.fromCodePoint(...EncodedURL))}
                target="_blank"
                rel="noopener"
                className="text-[0.7rem] text-[#9e9e9e] hover:underline"
            >
                {translate("Powered by {{authelia}}", { authelia: atob(String.fromCodePoint(...EncodedName)) })}
            </a>
            {privacyEnabled ? (
                <Fragment>
                    <div className="h-4 w-px self-center bg-border" />
                    <PrivacyPolicyLink className="text-[0.7rem] text-[#9e9e9e]" />
                </Fragment>
            ) : null}
        </div>
    );
};

export default Brand;
