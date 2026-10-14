import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import es from "../../../../src/i18n/locales/es.json";
import { renderWithProviders } from "../../../renderWithProviders";
import { TeamSection } from "../../../../src/features/team/components/TeamSection";

describe("TeamSection", () => {
  it("shows the team with the roles in the active language", () => {
    renderWithProviders(<TeamSection />);
    expect(screen.getByRole("heading", { name: es.footer.team.title })).toBeInTheDocument();
    expect(screen.getByText(es.team.person1.role)).toBeInTheDocument();
  });
});
