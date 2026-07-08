import { useTranslation } from "react-i18next";

const SettingsView = function () {
    const { t: translate } = useTranslation("settings");

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
                <h4 className="mb-2 text-center text-3xl">{translate("User Settings")}</h4>
                <p className="my-2 text-center">
                    {translate(
                        "This is the user settings area at the present time it's very minimal but will include new features in the near future",
                    )}
                </p>
                <p className="my-2 text-center">
                    {translate("To view the currently available options select the menu icon at the top left")}
                </p>
            </div>
        </div>
    );
};

export default SettingsView;
