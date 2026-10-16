Feature: Navigation
  As a visitor
  I want to recover from a wrong address
  So that I am never stuck

  Scenario: A wrong address leads back home
    When I visit "/esto-no-existe"
    Then I see the not-found page
    When I follow "Volver al inicio"
    Then I see the home page
