import { useTranslation } from "react-i18next";

import SuccessIcon from "@components/SuccessIcon";

const Authenticated = function () {
    const { t: translate } = useTranslation();

    return (
        <div id="authenticated-stage">
            <div className="mb-4 basis-full">
                <SuccessIcon />
            </div>
            <p className="text-base">{translate("Authenticated")}</p>
        </div>
    );
};

export default Authenticated;
