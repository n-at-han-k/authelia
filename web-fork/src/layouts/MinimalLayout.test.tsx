import { act, render, screen } from "@testing-library/react";

import MinimalLayout from "@layouts/MinimalLayout";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@components/AppBarLoginPortal", () => ({
    default: () => <div data-testid="app-bar" />,
}));

vi.mock("@components/PrivacyPolicyDrawer", () => ({
    default: () => <div data-testid="privacy-policy" />,
}));

vi.mock("@constants/constants", () => ({
    EncodedName: [81, 88, 86, 48, 97, 71, 86, 115, 97, 87, 69, 61],
}));

it("renders the app bar and privacy policy without a logo header", async () => {
    await act(async () => {
        render(<MinimalLayout />);
    });

    expect(screen.getByTestId("app-bar")).toBeInTheDocument();
    expect(screen.getByTestId("privacy-policy")).toBeInTheDocument();
    expect(screen.queryByTestId("user-svg")).not.toBeInTheDocument();
});

it("does not render a title header", async () => {
    await act(async () => {
        render(<MinimalLayout title="Test Title" />);
    });

    expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
});

it("renders children", async () => {
    await act(async () => {
        render(
            <MinimalLayout>
                <div data-testid="child">Content</div>
            </MinimalLayout>,
        );
    });

    expect(screen.getByTestId("child")).toBeInTheDocument();
});

it("sets the document title", async () => {
    await act(async () => {
        render(<MinimalLayout />);
    });

    expect(document.title).toContain("Login");
});
