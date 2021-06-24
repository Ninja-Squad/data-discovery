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
  /**
   * Name of the app, used in the i18n process, to translate specific values
   */
  name: string;
  /**
   * The title of the application, displayed on screen
   */
  title: string;
  /**
   * The navbar has a dynamic system to display different links depending on the app.
   */
  navbar: {
    logoUrl: string;
    links: Array<Link>;
  };
  /**
   * The applications can override default components with custom one by loading a module
   */
  resourceModule: Type<any>;
  /**
   * Markdown files served
   */
  helpMdFile: string;
  aboutUsMdFile: string;
  joinUsMdFile: string;
  legalMentionsMdFile: string;
  eulaMdFile: string;
  newsMdFile: string;
  /**
   * Only necessary for applications with rare basket
   */
  rareBasket?: string;
  home: {
    /**
     * if true, instead of showing pillars on the home page, we show the main aggregations
     */
    showAggregations: boolean;
    /**
     * these will be displayed as example queries on the home page. Use an empty array to avoid displaying the example queries section
     */
    exampleQueries: Array<string>;
  };
}
