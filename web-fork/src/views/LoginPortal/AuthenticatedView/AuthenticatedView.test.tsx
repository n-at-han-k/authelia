import { render, screen } from "@testing-library/react";

import AuthenticatedView from "@views/LoginPortal/AuthenticatedView/AuthenticatedView";

const redirect = vi.fn();

vi.mock("@hooks/Redirector", () => ({
    useRedirector: () => redirect,
}));

vi.mock("@views/LoadingPage/LoadingPage", () => ({
    default: () => <div data-testid="loading-page" />,
}));

beforeEach(() => {
    redirect.mockClear();
});

it("redirects to the kremlin.email app once authenticated", () => {
    render(<AuthenticatedView userInfo={{ display_name: "John", emails: [], method: 1 } as any} />);
    expect(redirect).toHaveBeenCalledWith("https://kremlin.email");
});

it("shows the loading page while redirecting", () => {
    render(<AuthenticatedView userInfo={{ display_name: "John", emails: [], method: 1 } as any} />);
    expect(screen.getByTestId("loading-page")).toBeInTheDocument();
});
