import MinimalLayout from "@layouts/MinimalLayout";
import { UserInfo } from "@models/UserInfo";
import AuthenticatedProfile from "@views/LoginPortal/AuthenticatedView/AuthenticatedProfile";

export interface Props {
    userInfo: UserInfo;
}

const AuthenticatedView = function (props: Props) {
    return (
        <MinimalLayout id={"authenticated-stage"} userInfo={props.userInfo} wide hideLogo>
            <AuthenticatedProfile userInfo={props.userInfo} />
        </MinimalLayout>
    );
};

export default AuthenticatedView;
