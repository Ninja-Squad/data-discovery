import { Component, Input, OnInit } from '@angular/core';
import { ErrorInterceptorService } from '../error-interceptor.service';

// Based on https://codepen.io/Dreamdealer/pen/JyBdMX

@Component({
    selector: 'dd-loading-skeleton',
    template: `
      <div *ngIf=" ! aggregationStyle">
        <div *ngIf="loading" class="card skeleton-loading">
          <div class="skeleton-default skeleton-animated-background"></div>
        </div>
        <div *ngIf="loading" class="card skeleton-loading">
          <div class="skeleton-default skeleton-animated-background"></div>
        </div>
        <div *ngIf="loading" class="card skeleton-loading">
          <div class="skeleton-default skeleton-animated-background"></div>
        </div>
        <div *ngIf="loading" class="card skeleton-loading">
          <div class="skeleton-default skeleton-animated-background"></div>
        </div>
      </div>
      <div *ngIf="aggregationStyle">
          <div *ngIf="loading" class="card skeleton-loading-aggregation">
              <div class="skeleton-aggregation skeleton-animated-background"></div>
          </div>
          <div *ngIf="loading" class="card skeleton-loading-aggregation">
              <div class="skeleton-aggregation skeleton-animated-background"></div>
          </div>
          <div *ngIf="loading" class="card skeleton-loading-aggregation">
              <div class="skeleton-aggregation skeleton-animated-background"></div>
          </div>
      </div>
    `,
    styleUrls: ['./loading-skeleton.component.scss']
})
export class LoadingSkeletonComponent implements OnInit {

    @Input() loading: boolean;
    @Input() aggregationStyle = false;

    constructor(private errorService: ErrorInterceptorService) {
    }

    ngOnInit(): void {
        // Force loading stop when an error is intercepted
        this.errorService.getErrors().subscribe(() => {
            this.loading = false;
        });
    }
}
