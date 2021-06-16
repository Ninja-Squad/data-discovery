import { AggregationNamePipe } from './aggregation-name.pipe';

describe('AggregationNamePipe', () => {
  it('should return the displayed name of an aggregation', () => {
    const pipe = new AggregationNamePipe();

    // for know aggregation names
    const cooResult = pipe.transform('coo');
    expect(cooResult).toBe("Pays d'origine");
    const domainResult = pipe.transform('domain');
    expect(domainResult).toBe('Domaine');
  });

  it('should return the key for an unknown aggregation', () => {
    const pipe = new AggregationNamePipe();

    // for an unknow aggregation names
    const result = pipe.transform('unknown');
    expect(result).toBe('unknown');
  });
});
