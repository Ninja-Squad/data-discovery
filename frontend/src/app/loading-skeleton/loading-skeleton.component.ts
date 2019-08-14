import { Component, Input, OnInit } from '@angular/core';
import { ErrorInterceptorService } from '../error-interceptor.service';

// Based on https://codepen.io/Dreamdealer/pen/JyBdMX

@Component({
    selector: 'dd-loading-skeleton',
    template: `
        <div *ngIf="loading" class="card loading">
          <div class="skeleton-default skeleton-animated-background"></div>
        </div>
        <div *ngIf="loading" class="card loading">
          <div class="skeleton-default skeleton-animated-background"></div>
        </div>
        <div *ngIf="loading" class="card loading">
          <div class="skeleton-default skeleton-animated-background"></div>
        </div>
        <div *ngIf="loading" class="card loading">
          <div class="skeleton-default skeleton-animated-background"></div>
        </div>
    `,
    styleUrls: ['./loading-skeleton.component.scss']
})
export class LoadingSkeletonComponent implements OnInit {

    @Input() loading: boolean;

    constructor(private errorService: ErrorInterceptorService) {
    }

    ngOnInit(): void {
        // Force loading stop when an error is intercepted
        this.errorService.getErrors().subscribe(() => {
            this.loading = false;
        });
    }
}
