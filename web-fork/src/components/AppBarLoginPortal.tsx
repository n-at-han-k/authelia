import AppBarItemAccountSettings from "@components/AppBarItemAccountSettings";
import AppBarItemLanguage from "@components/AppBarItemLanguage";
import { ThemeToggle } from "@components/ThemeToggle";
import { Language } from "@models/LocaleInformation";
import { UserInfo } from "@models/UserInfo";

export interface Props {
    userInfo?: UserInfo;
    localeCurrent?: string;
    localeList?: Language[];
    onLocaleChange?: (_locale: string) => void;
}

const AppBarLoginPortal = function (props: Props) {
    return (
        <header className="static w-full bg-transparent">
            <div className="mx-auto flex items-start gap-2 px-4 pt-1 pb-2">
                <ThemeToggle variant="ghost" />
                <div className="flex-grow" />
                <AppBarItemLanguage
                    localeCurrent={props.localeCurrent}
                    localeList={props.localeList}
                    onChange={props.onLocaleChange}
                />
                <AppBarItemAccountSettings userInfo={props.userInfo} />
            </div>
        </header>
    );
};

export default AppBarLoginPortal;
