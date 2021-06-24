describe('Home page', () => {
  it('should display aggregations', () => {
    cy.intercept('GET', '/faidare-dev/api/aggregate?main=true', {
      aggregations: [
        {
          name: 'tg',
          type: 'LARGE',
          buckets: [
            {
              key: 'NULL',
              documentCount: 21416
            }
          ]
        },
        {
          name: 'entry',
          type: 'LARGE',
          buckets: [
            {
              key: 'NULL',
              documentCount: 10000
            },
            {
              key: 'Genome annotation',
              documentCount: 8090
            },
            {
              key: 'Germplasm',
              documentCount: 1432
            }
          ]
        },
        {
          name: 'db',
          type: 'LARGE',
          buckets: [
            {
              key: 'GnpIS',
              documentCount: 5963
            },
            {
              key: 'CR-EST',
              documentCount: 5387
            }
          ]
        },
        {
          name: 'node',
          type: 'SMALL',
          buckets: [
            {
              key: 'IPK',
              documentCount: 10000
            },
            {
              key: 'INRAE-URGI',
              documentCount: 9355
            }
          ]
        }
      ]
    }).as('getMainAggregations');
    cy.visit('/');
    cy.wait('@getMainAggregations');
    cy.contains('h1', 'FAIR Data-finder for Agronomic REsearch');
    cy.get('dd-aggregations')
      .should('have.length', 1)
      .should('contain', 'Taxon group')
      .should('contain', 'Aucun')
      .should('contain', '[21,416]')
      .should('contain', 'Data type')
      .should('contain', 'Database')
      .should('contain', 'Data provider');
  });
});
