import PrivacyPolicyLink from "@components/PrivacyPolicyLink";
import { getPrivacyPolicyEnabled } from "@utils/Configuration";

export interface Props {}

const Brand = function () {
    const privacyEnabled = getPrivacyPolicyEnabled();

    if (!privacyEnabled) {
        return null;
    }

    return (
        <div className="flex w-full flex-wrap items-center justify-center gap-3">
            <PrivacyPolicyLink className="text-[0.7rem] text-muted-foreground" />
        </div>
    );
};

export default Brand;
