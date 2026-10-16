Feature: Responsive layout
  As a visitor on a phone
  I want the pages to fit my screen
  So that I never have to scroll sideways

  Scenario: The home page fits a phone screen
    Given a viewport of 360 by 640 pixels
    When I visit "/"
    Then there is no horizontal scrolling
