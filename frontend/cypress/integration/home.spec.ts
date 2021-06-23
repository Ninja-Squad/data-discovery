describe('Home page', () => {
  it('should display pillars', () => {
    cy.intercept('GET', '/faidare-dev/api/pillars', [
      {
        name: 'INRAE-URGI',
        databaseSources: [
          { name: 'GnpIS', url: null, documentCount: 5943 },
          { name: 'IWGSC@GnpIS', url: null, documentCount: 3392 }
        ],
        documentCount: 9335
      }
    ]).as('getPillars');
    cy.visit('/');
    cy.wait('@getPillars');
    cy.contains('h1', 'DataDiscovery');
    cy.contains('h1', 'Genetic and Genomic Information System');
    cy.get('.pillar-name').should('have.length', 1).should('contain', 'INRAE-URGI');
    cy.get('.pillar li li').should('have.length', 2);
    cy.get('.pillar li li').first().should('contain', 'GnpIS');
    cy.get('.pillar li small').first().should('contain', '[5,943]');
  });
});
