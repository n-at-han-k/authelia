import { render, screen } from "@testing-library/react";

import Brand from "@components/Brand";

it("renders without crashing", () => {
    document.body.dataset.privacypolicyurl = "";
    render(<Brand />);
});

it("does not render a Powered by Authelia link", () => {
    document.body.dataset.privacypolicyurl = "https://example.com";
    render(<Brand />);
    expect(screen.queryByText(/Powered by/i)).not.toBeInTheDocument();
});

it("renders privacy policy when enabled", () => {
    document.body.dataset.privacypolicyurl = "https://example.com";
    render(<Brand />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
});

it("does not render privacy policy when disabled", () => {
    document.body.dataset.privacypolicyurl = "";
    render(<Brand />);
    expect(screen.queryByText("Privacy Policy")).not.toBeInTheDocument();
});
