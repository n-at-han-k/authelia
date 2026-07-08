import { Fragment, useCallback, useMemo, useState } from "react";

import { ChevronDown, ChevronUp, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { ChildLocale, Language, Locale } from "@models/LocaleInformation";
import { cn } from "@utils/cn";

export interface Props {
    localeCurrent?: string;
    localeList?: Language[];
    onChange?: (_lng: string) => void;
}

const Fallbacks: { [id: string]: string } = {
    sc: "Basa Sunda",
    ss: "Siswati",
    ty: "reo Tahiti",
    vec: "vèneto",
};

const rowClass =
    "flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent";

const AppBarItemLanguage = function (props: Props) {
    const { t: translate } = useTranslation();

    const [open, setOpen] = useState(false);
    const [expanded, setExpanded] = useState("");

    const render = props.localeList !== undefined && props.localeCurrent !== undefined && props.onChange !== undefined;

    const handleLanguageDisplayName = useCallback((locale: string, fallback: string) => {
        const browser = new Intl.DisplayNames(locale, { type: "language" }).of(locale);

        if (browser && browser !== locale && browser !== "") {
            return browser;
        }

        if (fallback !== "") {
            return fallback;
        }

        if (locale in Fallbacks) {
            return Fallbacks[locale];
        }

        console.error(
            `Error determining display value for locale ${locale} as it's unknown by both the browser and Golang, and does not have a unique fallback configured. Using the raw locale instead.`,
        );

        return browser || locale;
    }, []);

    const handleChange = useCallback(
        (language: ChildLocale) => {
            setOpen(false);

            if (props.onChange) {
                props.onChange(language.locale);
            }
        },
        [props],
    );

    const handleCollapse = useCallback(
        (locale: string) => {
            if (locale === expanded) {
                setExpanded("");
            } else {
                setExpanded(locale);
            }
        },
        [expanded],
    );

    const filterParent = (locale: Language) => !locale.parent;
    const filterChildren = (parent: Language) => (locale: Language) =>
        locale.locale !== parent.locale && locale.parent === parent.locale;

    const items = useMemo(() => {
        if (!props.localeList || !render) return [];

        const locales = props.localeList;

        return locales.filter(filterParent).map((parent) => {
            const locale: Locale = {
                children: locales.filter(filterChildren(parent)).map((child) => {
                    return {
                        display: handleLanguageDisplayName(child.locale, child.display),
                        locale: child.locale,
                    };
                }),
                display: handleLanguageDisplayName(parent.locale, parent.display),
                locale: parent.locale,
            };

            if (locale.children.length === 1) {
                locale.locale = locale.children[0].locale;
            }

            return locale;
        });
    }, [props.localeList, render, handleLanguageDisplayName]);

    const current = useMemo(() => {
        if (!items.length || !props.localeCurrent) return null;

        for (const parent of items) {
            if (parent.locale === props.localeCurrent) {
                return parent;
            }

            for (const child of parent.children) {
                if (child.locale === props.localeCurrent) {
                    return child;
                }
            }
        }

        return null;
    }, [items, props.localeCurrent]);

    return render ? (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <button
                            id="language-button"
                            aria-label={translate("Language")}
                            className="ml-2 flex items-center gap-1 rounded-md px-2 py-1 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <Languages />
                            <span>{current?.display}</span>
                        </button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{translate("Language")}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent id="language-menu" align="end" className="max-h-[80vh] min-w-48 overflow-y-auto">
                {items.map((language) => {
                    const hasChildren = language.children.length > 1;
                    const isExpanded = expanded === language.locale;

                    return (
                        <Fragment key={language.locale}>
                            <button
                                id={`language-${language.locale}`}
                                className={cn(rowClass, props.localeCurrent === language.locale && "bg-accent/60")}
                                onClick={
                                    hasChildren ? () => handleCollapse(language.locale) : () => handleChange(language)
                                }
                            >
                                <span>
                                    {language.display} ({language.locale})
                                </span>
                                {hasChildren ? (
                                    isExpanded ? (
                                        <ChevronUp data-testid="expand-less" className="size-4" />
                                    ) : (
                                        <ChevronDown data-testid="expand-more" className="size-4" />
                                    )
                                ) : null}
                            </button>
                            {hasChildren && isExpanded
                                ? language.children.map((child) => (
                                      <button
                                          key={`${language.locale}-child-${child.locale}`}
                                          id={`language-${language.locale}-child-${child.locale}`}
                                          className={cn(
                                              rowClass,
                                              "pl-6",
                                              props.localeCurrent === child.locale && "bg-accent/60",
                                          )}
                                          onClick={() => handleChange(child)}
                                      >
                                          <span>
                                              {child.display} ({child.locale})
                                          </span>
                                      </button>
                                  ))
                                : null}
                        </Fragment>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    ) : null;
};

export default AppBarItemLanguage;
