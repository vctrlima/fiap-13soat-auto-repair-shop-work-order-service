Feature: Work Order Saga Lifecycle

  As an auto repair shop manager
  I want to manage the complete work order lifecycle
  So that services are tracked from creation through execution and payment

  Background:
    Given the system is running with all microservices available

  Scenario: Complete work order lifecycle - happy path
    Given a registered customer exists in the system
    And a vehicle is registered for that customer
    And a service catalog item exists
    And a part or supply item exists
    When I create a new work order with the customer, vehicle, service, and part
    Then the work order should be created with status "RECEIVED"
    When I update the work order status through diagnosis
    Then the work order should have status "IN_DIAGNOSIS"
    When I set the budget and move to waiting approval
    Then the work order should have status "WAITING_APPROVAL"
    When I approve the work order
    Then the work order should have status "APPROVED"
    And a saga should be started for the work order
    And an invoice should be created for the work order
    And execution logs should be created for the work order

  Scenario: Process payment for an approved work order
    Given an approved work order with an invoice exists
    When I process a payment for the invoice via PIX
    Then the payment should be completed successfully
    And the saga payment step should be marked as completed

  Scenario: Cancel a work order triggers compensation
    Given a work order exists with status "APPROVED"
    When I cancel the work order
    Then the work order should have status "CANCELED"
    And the saga should enter compensation flow

  Scenario: Query saga state
    Given a work order with an active saga exists
    When I query the saga state for the work order
    Then I should receive the current saga status and step history

  Scenario: CRUD operations on customers
    When I create a new individual customer
    Then the customer should be created successfully
    When I retrieve the customer by document
    Then the customer data should match
    When I update the customer name
    Then the customer should be updated
    When I delete the customer
    Then the customer should no longer exist

  Scenario: CRUD operations on vehicles
    Given a customer exists
    When I create a new vehicle for the customer
    Then the vehicle should be created successfully
    When I retrieve the vehicle by id
    Then the vehicle data should match
    When I update the vehicle brand
    Then the vehicle should be updated
    When I delete the vehicle
    Then the vehicle should no longer exist
