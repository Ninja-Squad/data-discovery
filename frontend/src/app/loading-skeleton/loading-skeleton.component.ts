import { Component, Input, OnInit } from '@angular/core';
import { ErrorInterceptorService } from '../error-interceptor.service';

// Based ideas taken from https://codepen.io/Dreamdealer/pen/JyBdMX
/*
Copyright (c) 2020 by Johan van Tongeren (https://codepen.io/Dreamdealer/pen/JyBdMX)

Permission is hereby granted, free of charge, to any person obtaining a copy of this
software and associated documentation files (the "Software"), to deal in the Software
without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies
or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.

 */

@Component({
  selector: 'dd-loading-skeleton',
  template: `
    @if (loading) {
      <div class="loading">
        @if (aggregationStyle) {
          @for (iAgg of [].constructor(3); track iAgg) {
            <div class="card skeleton-loading-aggregation">
              <div class="skeleton-aggregation skeleton-animated-background"></div>
            </div>
          }
        } @else {
          @for (iSearch of [].constructor(5); track iSearch) {
            <div class="card skeleton-loading">
              <div class="skeleton-default skeleton-animated-background"></div>
            </div>
          }
        }
      </div>
    }
  `,
  styleUrl: './loading-skeleton.component.scss',
  standalone: true,
  imports: []
})
export class LoadingSkeletonComponent implements OnInit {
  @Input() loading = false;
  @Input() aggregationStyle = false;

  constructor(private errorService: ErrorInterceptorService) {}

  ngOnInit(): void {
    // Force loading stop when an error is intercepted
    this.errorService.getErrors().subscribe(() => {
      this.loading = false;
    });
  }
}
