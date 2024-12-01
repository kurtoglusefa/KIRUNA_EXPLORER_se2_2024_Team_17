describe('template spec', () => {
    beforeEach(() => {
        // Visit the WelcomePage
        cy.visit('http://localhost:5173/');
    });
    it('displays the welcome message', () => {
      cy.get('h1').should('contain', 'Welcome to Kiruna eXplorer');
      cy.get('.welcome-message p').should('contain', 'Join us in mapping the transformation of Kiruna');
    });
    it('should navigate to the home page when the button is clicked', () => {
    // Click the "Explore the Move!" button
    cy.get('.welcome-message-button').click();

    // Verify that the URL changes to /home
    cy.url().should('include', '/home');
  });
  

})