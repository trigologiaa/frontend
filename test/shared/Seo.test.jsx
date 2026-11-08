import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Seo } from "../../src/shared/Seo";
import { renderWithProviders } from "../renderWithProviders";

describe("Seo", () => {
  it("sets the document title with the site name", async () => {
    renderWithProviders(<Seo title="Servicios" />);
    await waitFor(() => expect(document.title).toBe("Servicios | Trigologiaa Dev"));
  });

  it("sets the description and the Open Graph tags", async () => {
    renderWithProviders(<Seo title="Servicios" description="Catálogo de servicios." />);
    await waitFor(() =>
      expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
        "content",
        "Catálogo de servicios.",
      ),
    );
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Servicios | Trigologiaa Dev",
    );
    expect(document.querySelector('meta[property="og:description"]')).toHaveAttribute(
      "content",
      "Catálogo de servicios.",
    );
  });

  it("replaces the tags of the previous page instead of repeating them", async () => {
    const { unmount } = renderWithProviders(<Seo title="Uno" description="Primera" />);
    await waitFor(() => expect(document.title).toBe("Uno | Trigologiaa Dev"));
    unmount();
    renderWithProviders(<Seo title="Dos" description="Segunda" />);
    await waitFor(() => expect(document.title).toBe("Dos | Trigologiaa Dev"));
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute("content", "Segunda");
  });

  it("omits the description tags when there is no description", async () => {
    renderWithProviders(<Seo title="Cargando" />);
    await waitFor(() => expect(document.title).toBe("Cargando | Trigologiaa Dev"));
    expect(document.querySelector('meta[name="description"]')).not.toBeInTheDocument();
  });
});
