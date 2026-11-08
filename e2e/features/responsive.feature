Feature: Responsive layout
  As a visitor on a phone
  I want the pages to fit my screen
  So that I never have to scroll sideways

  Scenario: The home page fits a phone screen
    Given a viewport of 360 by 640 pixels
    When I visit "/"
    Then there is no horizontal scrolling

  Scenario Outline: The catalog adapts its columns to the screen
    Given a viewport of <width> by 800 pixels
    When I visit "/servicios"
    Then the first row of the catalog has <columns> cards

    Examples:
      | width | columns |
      | 360   | 1       |
      | 800   | 2       |
      | 1280  | 3       |
