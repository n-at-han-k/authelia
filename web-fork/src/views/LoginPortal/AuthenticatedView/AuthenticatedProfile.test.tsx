import { fireEvent, render, screen } from "@testing-library/react";

import { SecondFactorMethod } from "@models/Methods";
import AuthenticatedProfile from "@views/LoginPortal/AuthenticatedView/AuthenticatedProfile";

const navigate = vi.fn();
const signOut = vi.fn();

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@hooks/RouterNavigate", () => ({
    useRouterNavigate: () => navigate,
}));

vi.mock("@hooks/SignOut", () => ({
    useSignOut: () => signOut,
}));

vi.mock("@hooks/Flow", () => ({
    useFlowPresent: () => false,
}));

const userInfo = {
    display_name: "John Doe",
    emails: ["john@example.com", "j.doe@example.com"],
    has_duo: false,
    has_totp: true,
    has_webauthn: false,
    method: SecondFactorMethod.TOTP,
} as any;

beforeEach(() => {
    navigate.mockClear();
    signOut.mockClear();
});

it("renders the profile heading and user identity", () => {
    render(<AuthenticatedProfile userInfo={userInfo} />);
    expect(screen.getByText("Your Profile")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
});

it("shows the registered second-factor methods", () => {
    render(<AuthenticatedProfile userInfo={userInfo} />);
    expect(screen.getByText("Registered")).toBeInTheDocument();
    expect(screen.getAllByText("Not configured")).toHaveLength(2);
});

it("navigates to settings and signs out", () => {
    render(<AuthenticatedProfile userInfo={userInfo} />);
    fireEvent.click(screen.getByText("Settings"));
    expect(navigate).toHaveBeenCalledWith("/settings");
    fireEvent.click(screen.getByText("Logout"));
    expect(signOut).toHaveBeenCalledWith(false);
});
