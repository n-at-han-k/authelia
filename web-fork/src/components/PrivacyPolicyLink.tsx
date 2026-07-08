import { ComponentProps } from "react";

import { useTranslation } from "react-i18next";

import { cn } from "@utils/cn";
import { getPrivacyPolicyURL } from "@utils/Configuration";

const PrivacyPolicyLink = function ({ className, ...props }: ComponentProps<"a">) {
    const { t: translate } = useTranslation();

    const hrefPrivacyPolicy = getPrivacyPolicyURL();

    return (
        <a
            {...props}
            href={hrefPrivacyPolicy}
            target="_blank"
            rel="noopener"
            className={cn("hover:underline", className)}
        >
            {translate("Privacy Policy")}
        </a>
    );
};

export default PrivacyPolicyLink;
