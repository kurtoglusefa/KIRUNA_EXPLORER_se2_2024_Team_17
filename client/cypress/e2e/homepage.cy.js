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
    it('should be login in successfully', () => {
      // Verify that the user is logged in by checking for an element only visible when logged in
      cy.get('span').should('contain', 'Signed in as: Mario');

    });
    it('should see some documents by name if search ', () => {
        // Verify that the document list is displayed
        cy.get('input[placeholder="Search Document"]')
        .type('Document 1'); // Enter search term
        cy.get('button[type="submit"]').click(); // Click the search button
    });
    it('Searches by stakeholder', () => {
      // Open filters
      cy.get('button i.bi-funnel').click();
  
      // Select a stakeholder from the dropdown
      cy.get('select').eq(0).select('LKAB'); // Adjust index and option text
  
      // Perform search
      cy.get('button[type="submit"]').click(); // Click the search button
  
    });
    it('Searches by issuance year', () => {
      // Open filters
      cy.get('button i.bi-funnel').click();
  
      // Enter a year in the filter
      cy.get('input[type="number"]').type('2023');
  
      // Perform search
      cy.get('button[type="submit"]').click(); // Click the search button
    });

    it('Resets filters', () => {
      // Open filters
      cy.get('button i.bi-funnel').click();
  
      // Apply filters
      cy.get('select').eq(0).select('LKAB'); // Adjust index and option text
      cy.get('input[type="number"]').type('2023');
  
      // Reset filters
      cy.get('button')
      .contains('Reset') // Locate the Reset button by its text
      .click();
  
      // Verify all filters are cleared
      cy.get('select').eq(0).should('have.value', '');
      //cy.get('input[type="number"]').should('have.value', '');
    });
    
 
    
   
  });
  