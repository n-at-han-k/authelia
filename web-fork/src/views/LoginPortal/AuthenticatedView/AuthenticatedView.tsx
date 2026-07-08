import { useTranslation } from "react-i18next";

import MinimalLayout from "@layouts/MinimalLayout";
import { UserInfo } from "@models/UserInfo";
import AuthenticatedProfile from "@views/LoginPortal/AuthenticatedView/AuthenticatedProfile";

export interface Props {
    userInfo: UserInfo;
}

const AuthenticatedView = function (props: Props) {
    const { t: translate } = useTranslation();

    return (
        <MinimalLayout
            id={"authenticated-stage"}
            title={`${translate("Hi")} ${props.userInfo.display_name}`}
            userInfo={props.userInfo}
            wide
        >
            <AuthenticatedProfile userInfo={props.userInfo} />
        </MinimalLayout>
    );
};

export default AuthenticatedView;
