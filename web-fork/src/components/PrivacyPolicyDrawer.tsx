import { Trans, useTranslation } from "react-i18next";

import PrivacyPolicyLink from "@components/PrivacyPolicyLink";
import { Button } from "@components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@components/ui/sheet";
import { EncodedName } from "@constants/constants";
import { LocalStoragePrivacyPolicyAccepted } from "@constants/LocalStorage";
import { usePersistentStorageValue } from "@hooks/PersistentStorage";
import { getPrivacyPolicyEnabled, getPrivacyPolicyRequireAccept } from "@utils/Configuration";

const PrivacyPolicyDrawer = function () {
    const { t: translate } = useTranslation();

    const privacyEnabled = getPrivacyPolicyEnabled();
    const privacyRequireAccept = getPrivacyPolicyRequireAccept();
    const [accepted, setAccepted] = usePersistentStorageValue<boolean>(LocalStoragePrivacyPolicyAccepted, false);

    return privacyEnabled && privacyRequireAccept && !accepted ? (
        <Sheet open={!accepted}>
            <SheetContent side="bottom" showCloseButton={false} className="items-center text-center">
                <SheetHeader className="items-center">
                    <SheetTitle id="privacy-policy-drawer-title">{translate("Privacy Policy")}</SheetTitle>
                    <SheetDescription id="privacy-policy-drawer-description">
                        <Trans
                            i18nKey="You must view and accept the Privacy Policy before using {{authelia}}."
                            values={{ authelia: atob(String.fromCharCode(...EncodedName)) }}
                            components={{
                                policy: <PrivacyPolicyLink />,
                            }}
                        />
                    </SheetDescription>
                </SheetHeader>
                <div className="flex justify-center py-2">
                    <Button
                        onClick={() => {
                            setAccepted(true);
                        }}
                    >
                        {translate("Accept")}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    ) : null;
};

export default PrivacyPolicyDrawer;
