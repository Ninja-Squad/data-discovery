import { InjectionToken } from '@angular/core';

export const LOCATION = new InjectionToken<Location>('Location', {
  providedIn: 'root',
  factory: () => window.location
});
