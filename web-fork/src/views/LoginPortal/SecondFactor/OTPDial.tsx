import { Fragment } from "react";

import _OtpInputModule from "react18-input-otp";

const OtpInput = (_OtpInputModule as { default?: typeof _OtpInputModule }).default ?? _OtpInputModule;

import SuccessIcon from "@components/SuccessIcon";
import TimerIcon from "@components/TimerIcon";
import { cn } from "@utils/cn";
import IconWithContext from "@views/LoginPortal/SecondFactor/IconWithContext";

export interface Props {
    passcode: string;
    state: State;

    digits: number;
    period: number;

    onChange: (_passcode: string) => void;
}

export enum State {
    Idle = 1,
    InProgress = 2,
    Success = 3,
    Failure = 4,
    RateLimited = 5,
}

const OTPDial = function (props: Props) {
    return (
        <IconWithContext icon={<Icon state={props.state} period={props.period} />}>
            <span
                id="otp-input"
                className={cn(
                    "mt-4 inline-block",
                    "[&_input]:mx-1 [&_input]:box-content [&_input]:rounded-[5px] [&_input]:border [&_input]:border-black/30 [&_input]:p-2 [&_input]:text-base",
                    props.state === State.Failure && "[&_input]:border-[rgba(255,2,2,0.95)]",
                )}
            >
                <OtpInput
                    shouldAutoFocus
                    onChange={props.onChange}
                    value={props.passcode}
                    numInputs={props.digits}
                    isDisabled={
                        props.state === State.InProgress ||
                        props.state === State.Success ||
                        props.state === State.RateLimited
                    }
                    isInputNum
                    hasErrored={props.state === State.Failure}
                    autoComplete="one-time-code"
                />
            </span>
        </IconWithContext>
    );
};

interface IconProps {
    readonly state: State;
    readonly period: number;
}

function Icon(props: IconProps) {
    return (
        <Fragment>
            {props.state === State.Success ? (
                <SuccessIcon />
            ) : (
                <TimerIcon backgroundColor="#000" color="#FFFFFF" width={64} height={64} period={props.period} />
            )}
        </Fragment>
    );
}

export default OTPDial;
