describe('template spec', () => {
    beforeEach(() => {
        // Visit the WelcomePage
        cy.visit('http://localhost:5173/');
    });
    it('displays the welcome message', () => {
      cy.get('h1').should('contain', 'Welcome to Kiruna eXplorer');
      cy.get('.welcome-message p').should('contain', 'Join us in mapping the transformation of Kiruna');
  });

  it('displays the navbar and logo', () => {
      cy.get('.navbar').should('exist');
      cy.get('.logo-img').should('have.attr', 'src', '/kiruna2.webp');
  });

  it('contains breadcrumb links with popups', () => {
      // Verify "Explore the Move!" link
      cy.get('.breadcrumb-nav').within(() => {
          cy.contains('Explore the Move!').should('exist')
              .trigger('mouseover'); // Simulate hover to show popup
          cy.get('.popup-message').should('contain', 'Discover the journey of relocating Kiruna city.');
      });
  });

  it('navigates to login page on clicking Login breadcrumb', () => {
      cy.contains('Login').click();
      cy.url().should('include', '/login'); // Verify the URL includes /login
  });

})