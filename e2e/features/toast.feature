Feature: Notices
  As a visitor
  I want a short notice when I add a service to the cart
  So that I get feedback without a dialog

  Scenario: The notice appears and goes away by itself
    Given I am on the home page
    When I go to the services catalog
    And I open the service "Landing page"
    And I add 1 units to the cart
    Then I see the notice "Agregado al carrito"
    And the notice goes away by itself
