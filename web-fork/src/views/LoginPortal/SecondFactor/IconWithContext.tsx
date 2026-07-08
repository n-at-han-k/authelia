import { ReactNode } from "react";

interface IconWithContextProps {
    icon: ReactNode;
    children: ReactNode;

    className?: string;
}

const IconWithContext = function (props: IconWithContextProps) {
    return (
        <div className={props.className}>
            <div className={"flex flex-col items-center"}>
                <div className={"size-16"}>{props.icon}</div>
            </div>
            <div className={"block"}>{props.children}</div>
        </div>
    );
};

export default IconWithContext;
