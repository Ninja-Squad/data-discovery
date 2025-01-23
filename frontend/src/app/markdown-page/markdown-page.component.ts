import { ChangeDetectionStrategy, Component, inject, LOCALE_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'dd-markdown',
  templateUrl: './markdown-page.component.html',
  styleUrl: './markdown-page.component.scss',
  imports: [MarkdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkdownPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly locale = inject(LOCALE_ID);

  readonly mdFile = toSignal(
    this.route.data.pipe(
      map(({ mdFile }) => mdFile.replace('.md', `-${this.locale.substring(0, 2)}.md`))
    )
  );
}
