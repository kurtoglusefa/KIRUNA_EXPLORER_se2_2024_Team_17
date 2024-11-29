describe('template spec', () => {
    beforeEach(() => {
        // Visit the WelcomePage
        cy.visit('http://localhost:5173/login');
    });
    it('displays the login form correctly', () => {
        // Check if the page title is correct
        cy.get('h1').should('contain', 'Kiruna eXplorer');

        // Check if the login form is rendered
        cy.get('form').should('exist');
        
        // Check if the username and password fields exist
        cy.get('input[name="username"]').should('exist');
        cy.get('input[name="password"]').should('exist');
    });

    it('shows an error message when username is empty', () => {
        // Leave the username empty and type a password
        cy.get('input[name="username"]').clear();
        cy.get('input[name="password"]').type('pwd');

        // Submit the form
        cy.get('button[type="submit"]').click();

        // Verify the error message is displayed for the missing username
        cy.get('.alert-danger').should('contain', 'Username is a required field!');
    });

    it('shows an error message when password is empty', () => {
        // Type a username but leave password empty
        cy.get('input[name="username"]').clear().type('mario@test.it');  // Clear the input first to ensure it's empty
        cy.get('input[name="password"]').clear();  // Clear the input first to ensure it's empty

        // Submit the form
        cy.get('button[type="submit"]').click();

        // Verify the error message is displayed for the missing password
        cy.get('.alert-danger').should('contain', 'Password is a required field!');
    });
    it('shows an error message when username/password is empty', () => {
        // Type a username but leave password empty
        cy.get('input[name="username"]').clear();  // Clear the input first to ensure it's empty

        cy.get('input[name="password"]').clear();  // Clear the input first to ensure it's empty
        // Submit the form
        cy.get('button[type="submit"]').click();

        // Verify the error message is displayed for the missing password
        cy.get('.alert-danger').should('contain', 'Username is a required field!');
    });
    it('shows an error message when username/password is incorrect', () => {
        // Type a username but leave password empty
        cy.get('input[name="username"]').clear().type('mario@tst.it');  // Clear the input first to ensure it's empty
        cy.get('input[name="password"]').clear().type('dsn');  // Clear the input first to ensure it's empty
        // Submit the form
        cy.get('button[type="submit"]').click();
        cy.get('.alert-danger').should('contain', 'Wrong username and/or password');
        

    });
    it('shows an enter in the page if ok', () => {
        // Type a username but leave password empty
        cy.get('input[name="username"]').clear().type('mario@test.it');  // Clear the input first to ensure it's empty
        cy.get('input[name="password"]').clear().type('pwd');  // Clear the input first to ensure it's empty
        // Submit the form
        cy.get('button[type="submit"]').click();
        

    });

})