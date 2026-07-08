import { useCallback, useEffect, useState } from "react";

import { Alert, AlertDescription } from "@components/ui/alert";
import { useNotifications } from "@contexts/NotificationsContext";
import { Notification } from "@models/Notifications";
import { cn } from "@utils/cn";

const levelClass: Record<string, string> = {
    error: "border-transparent bg-destructive text-white *:data-[slot=alert-description]:text-white",
    info: "border-transparent bg-blue-600 text-white *:data-[slot=alert-description]:text-white",
    success: "border-transparent bg-green-600 text-white *:data-[slot=alert-description]:text-white",
    warning: "border-transparent bg-amber-500 text-black *:data-[slot=alert-description]:text-black",
};

const NotificationBar = function () {
    const { notification, resetNotification } = useNotifications();
    const [lastNotification, setLastNotification] = useState<Notification | null>(null);

    if (notification !== null && notification !== lastNotification) {
        setLastNotification(notification);
    }

    const handleExited = useCallback(() => {
        setLastNotification(null);
    }, []);

    const open = notification !== null;
    const displayed = notification ?? lastNotification;

    useEffect(() => {
        if (!open) return;

        const id = setTimeout(() => resetNotification(), displayed ? displayed.timeout * 1000 : 10000);

        return () => clearTimeout(id);
    }, [open, displayed, resetNotification]);

    if (!displayed) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
            <Alert
                data-state={open ? "open" : "closed"}
                data-level={displayed.level}
                className={cn(
                    "notification shadow-lg animate-in slide-in-from-right-full data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-full",
                    levelClass[displayed.level],
                )}
                onAnimationEnd={open ? undefined : handleExited}
            >
                <AlertDescription>{displayed.message}</AlertDescription>
            </Alert>
        </div>
    );
};

export default NotificationBar;
