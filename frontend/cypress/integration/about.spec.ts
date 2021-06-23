describe('About page', () => {
  it('should display markdown file in assets', () => {
    cy.visit('/about');
    cy.contains('h1', 'About this data portal');
  });
});
