import { render, screen } from "@testing-library/react";

import AuthenticatedView from "@views/LoginPortal/AuthenticatedView/AuthenticatedView";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@layouts/MinimalLayout", () => ({
    default: (props: any) => (
        <div
            data-testid="minimal-layout"
            data-title={props.title ?? ""}
            data-wide={props.wide ? "true" : "false"}
            data-hide-logo={props.hideLogo ? "true" : "false"}
        >
            {props.children}
        </div>
    ),
}));

vi.mock("@views/LoginPortal/AuthenticatedView/AuthenticatedProfile", () => ({
    default: (props: any) => <div data-testid="authenticated" data-user={props.userInfo?.display_name} />,
}));

it("renders wide with no layout logo or title", () => {
    render(<AuthenticatedView userInfo={{ display_name: "John", emails: [], groups: [], method: "totp" } as any} />);
    expect(screen.getByTestId("minimal-layout")).toHaveAttribute("data-wide", "true");
    expect(screen.getByTestId("minimal-layout")).toHaveAttribute("data-hide-logo", "true");
    expect(screen.getByTestId("minimal-layout")).toHaveAttribute("data-title", "");
});

it("renders the authenticated profile with the current user", () => {
    render(<AuthenticatedView userInfo={{ display_name: "Jane", emails: [], groups: [], method: "totp" } as any} />);
    expect(screen.getByTestId("authenticated")).toBeInTheDocument();
    expect(screen.getByTestId("authenticated")).toHaveAttribute("data-user", "Jane");
});
