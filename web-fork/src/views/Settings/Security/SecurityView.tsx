import { Fragment, useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { useNotifications } from "@contexts/NotificationsContext";
import { useConfiguration } from "@hooks/Configuration";
import { useUserInfoGET } from "@hooks/UserInfo";
import { Configuration } from "@models/Configuration";
import { UserSessionElevation, getUserSessionElevation } from "@services/UserSessionElevation";
import IdentityVerificationDialog from "@views/Settings/Common/IdentityVerificationDialog";
import SecondFactorDialog from "@views/Settings/Common/SecondFactorDialog";
import ChangePasswordDialog from "@views/Settings/Security/ChangePasswordDialog";

interface PasswordChangeButtonProps {
    configuration: Configuration | undefined;
    translate: (_key: string) => string;
    handleChangePassword: () => void;
}

const PasswordChangeButton = ({ configuration, handleChangePassword, translate }: PasswordChangeButtonProps) => {
    const disabled = !configuration || configuration.password_change_disabled;

    const buttonContent = (
        <Button id="change-password-button" className="w-full p-2" onClick={handleChangePassword} disabled={disabled}>
            {translate("Change Password")}
        </Button>
    );

    return disabled ? (
        <Tooltip>
            <TooltipTrigger asChild>
                <span>{buttonContent}</span>
            </TooltipTrigger>
            <TooltipContent>{translate("This is disabled by your administrator")}</TooltipContent>
        </Tooltip>
    ) : (
        buttonContent
    );
};

const SecurityView = function () {
    const { t: translate } = useTranslation(["settings", "portal"]);
    const { createErrorNotification } = useNotifications();

    const [userInfo, fetchUserInfo, , fetchUserInfoError] = useUserInfoGET();
    const [elevation, setElevation] = useState<UserSessionElevation>();
    const [dialogSFOpening, setDialogSFOpening] = useState(false);
    const [dialogIVOpening, setDialogIVOpening] = useState(false);
    const [dialogPWChangeOpen, setDialogPWChangeOpen] = useState(false);
    const [dialogPWChangeOpening, setDialogPWChangeOpening] = useState(false);
    const [configuration, fetchConfiguration, , fetchConfigurationError] = useConfiguration();

    const handleResetStateOpening = () => {
        setDialogSFOpening(false);
        setDialogIVOpening(false);
        setDialogPWChangeOpening(false);
    };

    const handleResetState = useCallback(() => {
        handleResetStateOpening();

        setElevation(undefined);
        setDialogPWChangeOpen(false);
    }, []);

    const handleOpenChangePWDialog = useCallback(() => {
        handleResetStateOpening();
        setDialogPWChangeOpen(true);
    }, []);

    const handleSFDialogClosed = (ok: boolean, changed: boolean) => {
        if (!ok) {
            console.warn("Second Factor dialog close callback failed, it was likely cancelled by the user.");

            handleResetState();

            return;
        }

        if (changed) {
            handleElevationRefresh()
                .then((refreshedElevation) => {
                    if (refreshedElevation) {
                        const isElevatedFromRefresh =
                            refreshedElevation.elevated || refreshedElevation.skip_second_factor;
                        if (isElevatedFromRefresh) {
                            setElevation(undefined);
                            if (dialogPWChangeOpening) {
                                handleOpenChangePWDialog();
                            }
                        } else {
                            setDialogIVOpening(true);
                        }
                    }
                })
                .catch((error) => {
                    console.error(error);
                    createErrorNotification(translate("Failed to get session elevation status"));
                });
        } else {
            const isElevated = elevation && (elevation.elevated || elevation.skip_second_factor);
            if (isElevated) {
                setElevation(undefined);
                if (dialogPWChangeOpening) {
                    handleOpenChangePWDialog();
                }
            } else {
                setDialogIVOpening(true);
            }
        }
    };

    const handleSFDialogOpened = () => {
        setDialogSFOpening(false);
    };

    const handleIVDialogClosed = useCallback(
        (ok: boolean) => {
            if (!ok) {
                console.warn(
                    "Identity Verification dialog close callback failed, it was likely cancelled by the user.",
                );

                handleResetState();

                return;
            }

            setElevation(undefined);
            if (dialogPWChangeOpening) {
                handleOpenChangePWDialog();
            }
        },
        [dialogPWChangeOpening, handleOpenChangePWDialog, handleResetState],
    );

    const handleIVDialogOpened = () => {
        setDialogIVOpening(false);
    };

    const handleElevationRefresh = async () => {
        const result = await getUserSessionElevation();
        setElevation(result);
        return result;
    };

    const handleElevation = () => {
        handleElevationRefresh().catch(console.error);

        setDialogSFOpening(true);
    };

    const handleChangePassword = () => {
        setDialogPWChangeOpening(true);

        handleElevation();
    };

    useEffect(() => {
        if (fetchUserInfoError) {
            createErrorNotification(translate("There was an issue retrieving user preferences", { ns: "portal" }));
        }
        if (fetchConfigurationError) {
            createErrorNotification(translate("There was an issue retrieving configuration"));
        }
    }, [fetchUserInfoError, fetchConfigurationError, createErrorNotification, translate]);

    useEffect(() => {
        fetchUserInfo();
        fetchConfiguration();
    }, [fetchUserInfo, fetchConfiguration]);

    return (
        <Fragment>
            <SecondFactorDialog
                info={userInfo}
                elevation={elevation}
                opening={dialogSFOpening}
                handleClosed={handleSFDialogClosed}
                handleOpened={handleSFDialogOpened}
            />
            <IdentityVerificationDialog
                opening={dialogIVOpening}
                elevation={elevation}
                handleClosed={handleIVDialogClosed}
                handleOpened={handleIVDialogOpened}
            />
            <ChangePasswordDialog
                username={userInfo?.display_name || ""}
                open={dialogPWChangeOpen}
                setClosed={() => {
                    handleResetState();
                }}
            />

            <div className="mx-auto flex h-screen w-full max-w-[600px] items-start justify-center px-4 pt-16">
                <div className="flex h-auto items-center justify-center border bg-card text-card-foreground shadow-sm">
                    <div className="m-4 flex w-full flex-col gap-4">
                        <div className="p-2 md:p-6">
                            <div className="mb-2 w-full border border-gray-500 p-[10px]">
                                <p>
                                    {translate("Name")}: {userInfo?.display_name || ""}
                                </p>
                            </div>
                            <div className="mb-2 w-full border border-gray-500 p-[10px]">
                                <div className="flex items-center">
                                    <p className="mr-2">{translate("Email")}:</p>
                                    <p>{userInfo?.emails?.[0] || ""}</p>
                                </div>
                                {userInfo?.emails && userInfo.emails.length > 1 && (
                                    <ul className="w-full list-none pl-8">
                                        {userInfo.emails.slice(1).map((email: string) => (
                                            <li key={email}>
                                                <p>{email}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="mb-2 border border-gray-500 p-[10px]">
                                <p>{translate("Password")}: ●●●●●●●●</p>
                            </div>
                            <PasswordChangeButton
                                configuration={configuration}
                                translate={translate}
                                handleChangePassword={handleChangePassword}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default SecurityView;
