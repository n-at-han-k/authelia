import { useTranslation } from "react-i18next";

const WebAuthnCredentialsDisabledPanel = function () {
    const { t: translate } = useTranslation("settings");

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col gap-4 p-4">
                <div className="w-full">
                    <h5 className="text-xl">{translate("WebAuthn Credentials")}</h5>
                </div>
                <div className="flex w-full items-center justify-center">
                    <h6 className="text-lg font-medium text-muted-foreground">
                        {translate(
                            "Your administrator has disabled WebAuthn preventing you from registering WebAuthn Credentials including Passkeys",
                        )}
                        .
                    </h6>
                </div>
                <div className="flex w-full items-center justify-center">
                    <p className="text-sm">
                        <span>
                            {translate(
                                "WebAuthn Credentials are widely considered the most secure means of authentication, regardless of if they're used for Multi-Factor Authentication or Passwordless Authentication",
                            )}
                            .
                        </span>
                        <span>
                            {translate(
                                "The decision to disable WebAuthn Credentials when Multi-Factor Authentication is enabled significantly undermines security and is highly inadvisable",
                            )}
                            .
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WebAuthnCredentialsDisabledPanel;
