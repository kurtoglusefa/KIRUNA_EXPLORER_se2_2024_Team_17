describe('Add document Flow', () => {
    // Step 1: Use `beforeEach` to log in before each test
    beforeEach(() => {
      // reset the database
      cy.request('POST', 'http://localhost:3001/api/test/reset-db'); // Adjust the URL as needed

      // Visit the login page
      cy.visit('http://localhost:5173/login');  // Adjust the URL if needed
  
      // Submit the login form
      cy.get('button[type="submit"]').click();
  
      // Verify that the user is redirected to the home page
      cy.url().should('include', '/home'); // Adjust if necessary

      cy.contains('Enable drag / add new location for a document').click();
    
      // Verify that the mode is enabled
      cy.contains('Drag / Add new document enabled').should('be.visible');
      // Click on the map to select a location (adjust the map selector as needed)
      cy.get('.leaflet-container').click(800, 300); // Adjust coordinates to a valid map area
      // Verify the selected location is displayed
      cy.get('.form.overlay .mx-3 h5').should('contain', 'Selected Location');
      // Add a document at the selected location
      cy.get('.btn-document').contains('Add document').click();
    
      // Verify navigation to the document creation page
      cy.url().should('include', '/documents/create-document');
    });
    it("should give the possibility to compile the fields and submit the document", () => {

        // now add fields
        cy.get('#title').type('Sample Title');
        cy.get('#description').type('example description');
        cy.get('#scale').select('1');
        cy.get('#language').select('English');
        cy.get('#year').type('2000');
        cy.get("#documentType").select('1');

        cy.get('#stakeholders').type('LKAB');
        cy.wait(500); // Adjust the time as necessary
        cy.get('div[id^="react-select"]', { timeout: 10000 }).contains('LKAB').click();
        
        // Verify the input contains the typed value
        cy.get('#title').should('have.value', 'Sample Title');
        cy.get('#description').should('have.value', 'example description');
        cy.get('#scale').should('have.value', '1');
        cy.get('#language').should('have.value', 'English');
        cy.get('#documentType').should('have.value', '1');
        cy.get('#year').should('have.value', '2000');

        // Submit the form
        cy.get('.btn-document') // Target the button by its class
        .contains('Save') // Ensure it contains the text "Save"
        .click();

        
        cy.url().should('include', '/home'); // Adjust as needed

    });
    it("should give the possibility to compile the fields and if not all provided give an error if  submit the document", () => {

        // now add fields
        cy.get('#title').type('Sample Title');
        cy.get('#description').type('example description');
        cy.get('#scale').select('1');
        
        // Verify the input contains the typed value
        cy.get('#title').should('have.value', 'Sample Title');
        cy.get('#description').should('have.value', 'example description');
        cy.get('#scale').should('have.value', '1');
        // Submit the form 
        cy.get('.btn-document') // Target the button by its class
        .contains('Save') // Ensure it contains the text "Save"
        .click();

        // it should give error 
        cy.get('.alert-danger') // Target the error alert by its class
        .should('be.visible') // Ensure the alert is visible
        .and('contain', 'Please complete all fields to add a document.'); // Adjust the error text as per your application

    });
    
    it("should give the possibility to compile the fields, adding new fields like scale,stakeholder,documentType and submit the document", () => {
        // now add scale field
        cy.get('#addScale').click();

        // Verify that the modal is visible
        cy.get('.modal') // Replace `.modal` with the actual class or ID of your modal
        .should('be.visible');

        cy.get('#scale_text').type('Sample Scale');
        cy.get('#scale_number').type('100');
        cy.get('#save_scale').click();

        cy.get('#scale').select('1');

        // now add stakeholder field
        cy.get('#addStakeholder').click();
        // Verify that the modal is visible
        cy.get('.modal') // Replace `.modal` with the actual class or ID of your modal
        .should('be.visible');

        cy.get('#stakeholder_name').type('Sample Stakeholder');
        cy.get('#save_stakeholder').click();

        cy.get('#stakeholders').type('Sample Stakeholder');
        cy.wait(500); // Adjust the time as necessary
        cy.get('div[id^="react-select"]', { timeout: 10000 }).contains('Sample Stakeholder').click();


        // now add fields
        cy.get('#addDocumentType').click();

        // Verify that the modal is visible
        cy.get('.modal') // Replace `.modal` with the actual class or ID of your modal
        .should('be.visible');

        cy.get('#document_type_name').type('Sample Document Type');
        cy.get('#save_DocumentType').click();

        cy.get("#documentType").select('1');

        cy.get('#language').select('English');
        cy.get('#year').type('2000');

        cy.get('#title').type('Sample Title');
        cy.get('#description').type('example description');
        // Submit the form
        cy.get('.btn-document') // Target the button by its class
        .contains('Save') // Ensure it contains the text "Save"
        .click();
        
        cy.url().should('include', '/home'); // Adjust as needed
        
    });

});