import { render, screen } from "@testing-library/react";

import { AuthenticationLevel } from "@services/State";
import AuthenticatedView from "@views/LoginPortal/AuthenticatedView/AuthenticatedView";

const redirect = vi.fn();

vi.mock("@hooks/Redirector", () => ({
    useRedirector: () => redirect,
}));

vi.mock("@views/LoadingPage/LoadingPage", () => ({
    default: () => <div data-testid="loading-page" />,
}));

const state = (defaultRedirectionURL?: string) =>
    ({
        authentication_level: AuthenticationLevel.OneFactor,
        default_redirection_url: defaultRedirectionURL,
        factor_knowledge: false,
        username: "john",
    }) as any;

beforeEach(() => {
    redirect.mockClear();
});

it("redirects to the configured default redirection url", () => {
    render(<AuthenticatedView state={state("https://app.example.com")} />);
    expect(redirect).toHaveBeenCalledWith("https://app.example.com");
});

it("does not redirect when no default redirection url is configured", () => {
    render(<AuthenticatedView state={state(undefined)} />);
    expect(redirect).not.toHaveBeenCalled();
    expect(screen.getByTestId("loading-page")).toBeInTheDocument();
});
