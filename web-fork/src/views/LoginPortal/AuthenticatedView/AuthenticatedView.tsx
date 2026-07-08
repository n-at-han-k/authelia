import { useEffect } from "react";

import { useRedirector } from "@hooks/Redirector";
import { UserInfo } from "@models/UserInfo";
import LoadingPage from "@views/LoadingPage/LoadingPage";

const PostLoginRedirectURL = "https://kremlin.email";

export interface Props {
    userInfo: UserInfo;
}

const AuthenticatedView = function (_props: Props) {
    const redirect = useRedirector();

    // Once authenticated with no onward redirect target, send the user to the actual app.
    useEffect(() => {
        redirect(PostLoginRedirectURL);
    }, [redirect]);

    return <LoadingPage />;
};

export default AuthenticatedView;
