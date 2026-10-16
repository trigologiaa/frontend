Feature: Catppuccin themes
  As a visitor
  I want to choose the colors of the site
  So that I can read it comfortably

  Scenario: The first visit follows the system preference
    Given the system prefers "light" colors
    When I visit "/"
    Then the page uses the "latte" theme

  Scenario: The chosen theme survives a reload
    Given I am on the home page
    When I choose the theme "Macchiato"
    Then the page uses the "macchiato" theme
    When I reload the page
    Then the page uses the "macchiato" theme
