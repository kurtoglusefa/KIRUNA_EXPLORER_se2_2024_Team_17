describe('Home page Flow', () => {
    // Step 1: Use `beforeEach` to log in before each test
    beforeEach(() => {
      // Visit the login page
      cy.visit('http://localhost:5173/login');  // Adjust the URL if needed
  
      // Submit the login form
      cy.get('button[type="submit"]').click();
  
      // Verify that the user is redirected to the home page
      cy.url().should('include', '/home'); // Adjust if necessary
    });
  
    it('should be click and add a document in successfully', () => {
      // Verify that the user is logged in by checking for an element only visible when logged in
      cy.get('span').should('contain', 'Signed in as: Mario');

    });
    it('should some documents by name if search ', () => {
        // Verify that the document list is displayed
        cy.get('input[placeholder="Search Doc"]')
        .type('Document 1'); // Enter search term
        cy.get('button[type="submit"]').click(); // Click the search button
        
        
    });
    
 
    
   
  });
  