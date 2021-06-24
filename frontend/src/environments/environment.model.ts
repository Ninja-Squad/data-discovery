/**
 * A link of the navbar
 */
import { Type } from '@angular/core';

interface Link {
  label: string;
  url: string;
  subMenu?: Array<Link>; // not all navbar links have sub menus
}

/**
 * Interface modeling the environment.
 * This helps TypeScript to understand correctly the shape of the environment file,
 * and allow to use it in the template without resorting to `$any`.
 */
export interface DataDiscoveryEnvironment {
  production: boolean;
  title: string;
  navbar: {
    title: string;
    logoUrl: string;
    links: Array<Link>;
  };
  searchPlaceholder: string;
  resourceModule: Type<any>;
  helpMdFile: string;
  aboutUsMdFile: string;
  joinUsMdFile: string;
  legalMentionsMdFile: string;
  eulaMdFile: string;
  newsMdFile: string;
  dataProvider?: string; // not always displayed
  aggregationNames: {
    [key: string]: string;
  };
  rareBasket?: string; // only necessary for applications with rare basket
}
