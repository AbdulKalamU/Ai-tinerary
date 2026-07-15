describe('Authentication Flow', () => {
  it('should navigate to login page and simulate authentication', () => {
    // Visit the application homepage
    cy.visit('/');

    // Ensure we are redirected to /login if not authenticated
    cy.url().should('include', '/login');

    // Check if the login form elements exist
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button').contains(/login/i).should('exist');

    // Simulate typing (we don't actually hit the real backend in this test
    // to avoid creating dummy users every time, just verify the UI reacts)
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');

    // For a true E2E test, we would click login and wait for the redirect
    // cy.get('button').contains(/login/i).click();
    // cy.url().should('include', '/dashboard');
  });
});
