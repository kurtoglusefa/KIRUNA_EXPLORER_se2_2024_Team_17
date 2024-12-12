describe('Add document Flow', () => {
    // Step 1: Use `beforeEach` to log in before each test
    beforeEach(() => {
      // Visit the login page
      cy.visit('http://localhost:5173/login');  // Adjust the URL if needed
  
      // Submit the login form
      cy.get('button[type="submit"]').click();
  
      // Verify that the user is redirected to the home page
      cy.url().should('include', '/home'); // Adjust if necessary
      cy.get("#tbg-view-mode").click();
    });
    it('should select one document and visualize the document card and update it ', () => {
        cy.get('#document-list')
        .find('#list-group-item') // Find all list items within the ListGroup
        .first() // Select the first item
        .click(); // Click the first item
        cy.get('#modify-document').click();

        //modify some fields

        cy.get('#title').type('Sample Title');

        // Submit the form
        cy.get('.btn-document') // Target the button by its class
        .contains('Save') // Ensure it contains the text "Save"
        .click();

        cy.url().should('include', '/home'); // Adjust as needed

    });
    it('should give error if clear some fields ', () => {
        cy.get('#document-list')
        .find('#list-group-item') // Find all list items within the ListGroup
        .first() // Select the first item
        .click(); // Click the first item
        cy.get('#modify-document').click();

        //modify some fields

        cy.get('#title').clear();
        cy.get('#description').clear();

        // Submit the form
        cy.get('.btn-document') // Target the button by its class
        .contains('Save') // Ensure it contains the text "Save"
        .click();

            cy.get('.alert-danger') // Target the error alert by its class
        .should('be.visible') // Ensure the alert is visible
        .and('contain', 'Please complete all fields to add a document.'); // Adjust the error text as per your application

    });

    it('should give add a connection inside the document and save it ', () => {
        cy.get('#document-list')
        .find('#list-group-item') // Find all list items within the ListGroup
        .first() // Select the first item
        .click(); // Click the first item
        cy.get('#modify-document').click();


        // add a connection 
        cy.get('#add-connection').click();

        cy.get('#connectionType').select('1');

        cy.get('#documentSearch').type('esempio');
        cy.wait(500); // Adjust the time as necessary
        cy.get('#list-document', { timeout: 10000 }) // Wait for the list to render
        .should('be.visible') // Ensure the list is visible
        .within(() => {
            // Look for an item with the specific title
            cy.contains('esempio').click(); // Replace with actual title
        });

        cy.get('#save-connection').click();

        cy.get("#connections").contains('esempio');


    });


});