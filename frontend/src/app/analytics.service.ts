import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

export interface AnalyticsNavigation {
  toUrl: string;
  node: string;
  species: string;
  entryType: string;
  databaseName: string;
}

interface NavigationCommand extends AnalyticsNavigation {
  fromUrl: string;
  application: 'FAIDARE' | 'WHEATIS';
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly analyticsProperties = environment.analytics;

  traceExternalNavigation(navigation: AnalyticsNavigation): void {
    if (!this.analyticsProperties) {
      return;
    }
    const command: NavigationCommand = {
      ...navigation,
      application: this.analyticsProperties.application,
      fromUrl: window.location.href
    };
    // we use sendBeacon rather than a regular http client post because... that's exactly what it's for.
    // see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
    window.navigator.sendBeacon(
      this.analyticsProperties.url,
      new Blob([JSON.stringify(command)], { type: 'application/json' })
    );
  }
}
