import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";

interface Props {
    open: boolean;
    title: string;
    text: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteDialog = function (props: Props) {
    const { t: translate } = useTranslation("settings");

    const handleCancel = () => {
        props.onCancel();
    };

    const handleDelete = () => {
        props.onConfirm();
    };

    return (
        <Dialog
            open={props.open}
            onOpenChange={(o) => {
                if (!o) handleCancel();
            }}
        >
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{props.title}</DialogTitle>
                </DialogHeader>
                <p className="my-2 text-sm text-muted-foreground">{props.text}</p>
                <DialogFooter>
                    <Button id={"dialog-cancel"} variant="ghost" onClick={handleCancel}>
                        {translate("Cancel")}
                    </Button>
                    <Button id={"dialog-delete"} variant="destructive" onClick={handleDelete}>
                        <Trash2 />
                        {translate("Remove")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteDialog;
