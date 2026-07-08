import { render, screen } from "@testing-library/react";

import ComponentWithTooltip from "@components/ComponentWithTooltip";

beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
});

it("renders without crashing", () => {
    render(
        <ComponentWithTooltip render={false} title="test">
            <div>child</div>
        </ComponentWithTooltip>,
    );
});

it("renders children without tooltip when render is false", () => {
    render(
        <ComponentWithTooltip render={false} title="test">
            <div>child</div>
        </ComponentWithTooltip>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
    const child = screen.getByText("child");
    expect(child.parentElement?.tagName).not.toBe("SPAN");
});

it("renders children with tooltip when render is true", () => {
    render(
        <ComponentWithTooltip render={true} title="test">
            <div>child</div>
        </ComponentWithTooltip>,
    );
    expect(screen.getByText("child")).toBeInTheDocument();
    const child = screen.getByText("child");
    expect(child.parentElement?.tagName).toBe("SPAN");
});

it("wraps children in a tooltip trigger when render is true", () => {
    render(
        <ComponentWithTooltip render={true} title="test title" placement="top">
            <span>child</span>
        </ComponentWithTooltip>,
    );
    const trigger = screen.getByText("child").parentElement;
    expect(trigger?.tagName).toBe("SPAN");
    expect(trigger).toHaveAttribute("data-slot", "tooltip-trigger");
});
