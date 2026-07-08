import { Progress } from "@components/ui/progress";

export interface Props {
    value: number;
    height?: number | string;
}

const LinearProgressBar = function (props: Props) {
    return (
        <Progress value={props.value} className="mt-2" style={props.height ? { height: props.height } : undefined} />
    );
};

export default LinearProgressBar;
