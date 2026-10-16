Feature: Main purchase flow
  As a visitor
  I want to browse, add a service to the cart and review it
  So that I can collect what I want to hire

  Scenario: Add a service to the cart and see it in the cart
    Given I am on the home page
    When I go to the services catalog
    And I open the service "Landing page"
    And I add 2 units to the cart
    Then the cart icon shows 2
    When I open the cart
    Then I see "Landing page" with quantity 2
