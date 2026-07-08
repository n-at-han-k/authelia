import { ReactNode, useCallback, useEffect, useState } from "react";

import { useTranslation } from "react-i18next";

import AppBarLoginPortal from "@components/AppBarLoginPortal";
import Brand from "@components/Brand";
import PrivacyPolicyDrawer from "@components/PrivacyPolicyDrawer";
import { EncodedName } from "@constants/constants";
import { useLanguageContext } from "@contexts/LanguageContext";
import { Language } from "@models/LocaleInformation";
import { UserInfo } from "@models/UserInfo";
import { getLocaleInformation } from "@services/LocaleInformation";
import { cn } from "@utils/cn";

export type MaxWidth = "lg" | "md" | "sm" | "xl" | "xs" | false;

const maxWidthClass: Record<string, string> = {
    lg: "max-w-[1200px]",
    md: "max-w-[900px]",
    sm: "max-w-[600px]",
    xl: "max-w-[1536px]",
    xs: "max-w-[444px]",
};

export interface Props {
    id?: string;
    children?: ReactNode;
    title?: null | string;
    titleTooltip?: null | string;
    subtitle?: null | string;
    subtitleTooltip?: null | string;
    userInfo?: UserInfo;
    maxWidth?: MaxWidth;
}

const LoginLayout = function (props: Props) {
    const { t: translate } = useTranslation();
    const { locale, setLocale } = useLanguageContext();

    const [localeList, setLocaleList] = useState<Language[]>([]);

    const handleChangeLanguage = (locale: string) => {
        setLocale(locale);
    };

    const fetchLocaleInformation = useCallback(async () => {
        try {
            const data = await getLocaleInformation();
            setLocaleList(data.languages);

            return data;
        } catch (err) {
            console.error("could not get locale list:", err);
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            await fetchLocaleInformation();
        };
        void fetchData();
    }, [fetchLocaleInformation]);

    useEffect(() => {
        document.title = translate("Login - {{authelia}}", { authelia: atob(String.fromCodePoint(...EncodedName)) });
    }, [translate]);

    const width = props.maxWidth === false ? "" : maxWidthClass[props.maxWidth ?? "xs"];

    return (
        <div>
            <AppBarLoginPortal
                userInfo={props.userInfo}
                onLocaleChange={handleChangeLanguage}
                localeList={localeList}
                localeCurrent={locale}
            />
            <div id={props.id} className="flex min-h-[90vh] items-center justify-center text-center">
                <div className={cn("mx-auto w-full px-8", width)}>
                    <div className="flex flex-col items-center">
                        <div className="w-full py-2">{props.children}</div>
                        <Brand />
                    </div>
                </div>
                <PrivacyPolicyDrawer />
            </div>
        </div>
    );
};

export default LoginLayout;
