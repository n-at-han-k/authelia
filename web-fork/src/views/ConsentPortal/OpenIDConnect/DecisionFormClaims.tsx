import { FC, Fragment, useCallback, useMemo } from "react";

import { useTranslation } from "react-i18next";

import { Checkbox } from "@components/ui/checkbox";
import { Label } from "@components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@components/ui/tooltip";
import { formatClaim } from "@services/ConsentOpenIDConnect";

export interface Props {
    onChangeChecked: (_claims: string[]) => void;
    claims: null | string[];
    essential_claims: null | string[];
}

const DecisionFormClaims: FC<Props> = ({ claims, essential_claims, onChangeChecked }: Props) => {
    const { t: translate } = useTranslation(["consent"]);

    const checked = useMemo(() => claims || [], [claims]);

    const handleClaimCheckboxOnChange = (claim: string) => {
        const checking = !checked.includes(claim);

        if (checking) {
            onChangeChecked([...checked, claim]);
        } else {
            onChangeChecked(checked.filter((value) => value !== claim));
        }
    };

    const claimChecked = useCallback(
        (claim: string) => {
            return checked.includes(claim);
        },
        [checked],
    );

    const hasClaims = essential_claims || claims;

    return (
        <Fragment>
            {hasClaims ? (
                <div className="w-full">
                    <div className="text-center">
                        <ul className="my-4 inline-block bg-background text-left">
                            {essential_claims?.map((claim: string) => (
                                <li key={`${claim}-essential`}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Label
                                                htmlFor={`claim-${claim}-essential`}
                                                className="inline-flex px-4 py-1"
                                            >
                                                <Checkbox id={`claim-${claim}-essential`} disabled checked />
                                                <span>{formatClaim(translate(`claims.${claim}`), claim)}</span>
                                            </Label>
                                        </TooltipTrigger>
                                        <TooltipContent>{translate("Claim", { name: claim })}</TooltipContent>
                                    </Tooltip>
                                </li>
                            ))}
                            {claims?.map((claim: string) => (
                                <li key={claim}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Label htmlFor={"claim-" + claim} className="inline-flex px-4 py-1">
                                                <Checkbox
                                                    id={"claim-" + claim}
                                                    value={claim}
                                                    checked={claimChecked(claim)}
                                                    onCheckedChange={() => handleClaimCheckboxOnChange(claim)}
                                                />
                                                <span>{formatClaim(translate(`claims.${claim}`), claim)}</span>
                                            </Label>
                                        </TooltipTrigger>
                                        <TooltipContent>{translate("Claim", { name: claim })}</TooltipContent>
                                    </Tooltip>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : null}
        </Fragment>
    );
};

export default DecisionFormClaims;
