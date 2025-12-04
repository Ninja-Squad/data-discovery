import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { GenericDocumentModel } from '../generic-document.model';
import { TruncatableDescriptionComponent } from '../../truncatable-description/truncatable-description.component';
import { AnalyticsService } from '../../analytics.service';

@Component({
  selector: 'dd-document',
  templateUrl: './generic-document.component.html',
  styleUrl: './generic-document.component.scss',
  imports: [TruncatableDescriptionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericDocumentComponent {
  private readonly analyticsService = inject(AnalyticsService);

  readonly document = input.required<GenericDocumentModel>();

  traceNavigation() {
    const doc = this.document();
    this.analyticsService.traceExternalNavigation({
      databaseName: doc.databaseName,
      node: doc.node,
      entryType: doc.entryType,
      species: doc.species[0],
      toUrl: doc.url
    });
  }
}
