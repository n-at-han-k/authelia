import { useEffect } from "react";

import { useRedirector } from "@hooks/Redirector";
import { AutheliaState } from "@services/State";
import LoadingPage from "@views/LoadingPage/LoadingPage";

export interface Props {
    state: AutheliaState;
}

const AuthenticatedView = function (props: Props) {
    const redirect = useRedirector();

    // Send the user to Authelia's configured default redirection URL
    // (session.cookies[].default_redirection_url), surfaced on the state.
    const target = props.state.default_redirection_url;

    useEffect(() => {
        if (target) {
            redirect(target);
        }
    }, [redirect, target]);

    return <LoadingPage />;
};

export default AuthenticatedView;
