import { render, screen } from "@testing-library/react";

import { SecondFactorMethod } from "@models/Methods";
import SettingsView from "@views/Settings/SettingsView";

const navigate = vi.fn();
const fetchUserInfo = vi.fn();

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@hooks/RouterNavigate", () => ({
    useRouterNavigate: () => navigate,
}));

vi.mock("@contexts/NotificationsContext", () => ({
    useNotifications: () => ({ createErrorNotification: vi.fn() }),
}));

vi.mock("@hooks/UserInfo", () => ({
    useUserInfoGET: () => [
        {
            display_name: "John Doe",
            emails: ["john@example.com"],
            has_duo: false,
            has_totp: true,
            has_webauthn: false,
            method: SecondFactorMethod.TOTP,
        },
        fetchUserInfo,
        undefined,
        undefined,
    ],
}));

it("renders the profile overview with the current user", () => {
    render(<SettingsView />);
    expect(screen.getByText("Your Profile")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Registered")).toBeInTheDocument();
});
