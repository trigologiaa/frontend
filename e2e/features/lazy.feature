Feature: Lazy pages
  As a visitor
  I want each page to load only when needed
  So that the first page opens fast

  Scenario: The home page does not download the private pages
    When I visit "/" recording the downloaded files
    Then no file of the private pages was downloaded

  Scenario: Opening the login page downloads it then
    Given I am on the home page
    When I record the downloaded files
    And I open the page "/login"
    Then the file of the "Login" page was downloaded
