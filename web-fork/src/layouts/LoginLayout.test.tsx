import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import LoginLayout from "@layouts/LoginLayout";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@components/AppBarLoginPortal", () => ({
    default: (props: any) => (
        <div data-testid="app-bar" data-locale={props.localeCurrent}>
            <button data-testid="change-locale" onClick={() => props.onLocaleChange?.("fr")} />
        </div>
    ),
}));

vi.mock("@components/Brand", () => ({
    default: () => <div data-testid="brand" />,
}));

vi.mock("@components/DotGridSpotlight", () => ({
    DotGridSpotlight: () => <div data-testid="dot-grid" />,
}));

vi.mock("@hooks/ResolvedTheme", () => ({
    useResolvedDark: () => false,
}));

vi.mock("@components/PrivacyPolicyDrawer", () => ({
    default: () => <div data-testid="privacy-policy" />,
}));

vi.mock("@constants/constants", () => ({
    EncodedName: [81, 88, 86, 48, 97, 71, 86, 115, 97, 87, 69, 61],
}));

const mockSetLocale = vi.fn();
vi.mock("@contexts/LanguageContext", () => ({
    useLanguageContext: () => ({ locale: "en", setLocale: mockSetLocale }),
}));

vi.mock("@services/LocaleInformation", () => ({
    getLocaleInformation: vi.fn().mockResolvedValue({ languages: [{ display: "English", locale: "en" }] }),
}));

beforeEach(() => {
    mockSetLocale.mockReset();
});

afterEach(() => {
    vi.restoreAllMocks();
});

it("renders the app bar, brand, and privacy policy without a logo header", async () => {
    await act(async () => {
        render(<LoginLayout />);
    });

    expect(screen.getByTestId("app-bar")).toBeInTheDocument();
    expect(screen.getByTestId("brand")).toBeInTheDocument();
    expect(screen.getByTestId("privacy-policy")).toBeInTheDocument();
    expect(screen.queryByTestId("user-svg")).not.toBeInTheDocument();
});

it("does not render a title or subtitle header", async () => {
    await act(async () => {
        render(<LoginLayout title="Test Title" subtitle="Test Subtitle" />);
    });

    expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
    expect(screen.queryByText("Test Subtitle")).not.toBeInTheDocument();
});

it("renders children", async () => {
    await act(async () => {
        render(
            <LoginLayout>
                <div data-testid="child">Content</div>
            </LoginLayout>,
        );
    });

    expect(screen.getByTestId("child")).toBeInTheDocument();
});

it("sets the document title", async () => {
    document.title = "Sentinel Title";

    await act(async () => {
        render(<LoginLayout />);
    });

    expect(document.title).not.toBe("Sentinel Title");
    expect(document.title).toContain("Login");
});

it("calls setLocale when language is changed", async () => {
    await act(async () => {
        render(<LoginLayout />);
    });

    await act(async () => {
        fireEvent.click(screen.getByTestId("change-locale"));
    });

    expect(mockSetLocale).toHaveBeenCalledWith("fr");
});

it("logs error when locale fetch fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const { getLocaleInformation } = await import("@services/LocaleInformation");
    vi.mocked(getLocaleInformation).mockRejectedValueOnce(new Error("fetch failed"));

    render(<LoginLayout />);

    await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith("could not get locale list:", expect.any(Error));
    });
});
