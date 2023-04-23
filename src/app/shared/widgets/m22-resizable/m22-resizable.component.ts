import { CdkDragEnd, CdkDragMove } from '@angular/cdk/drag-drop';
import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Output,
  EventEmitter,
} from '@angular/core';
import { Subject, merge, of } from 'rxjs';
import { tap, auditTime, withLatestFrom } from 'rxjs/operators';

@Component({
  selector: '[m22Resizable]',
  templateUrl: './m22-resizable.component.html',
  styleUrls: ['./m22-resizable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class M22ResizableComponent {

  @Output() resized = new EventEmitter<DOMRect>();

  private startSize$ = new Subject<DOMRect>();
  private dragMove$ = new Subject<CdkDragMove>();
  private dragMoveAudited$ = this.dragMove$.pipe(
    withLatestFrom(this.startSize$),
    auditTime(16),
    tap(([{ distance }, rect]) => {
      this.el.nativeElement.style.width = `${rect.width + distance.x}px`;
      this.el.nativeElement.style.height = `${rect.height + distance.y}px`;
    })
  );

  sub$ = merge(this.dragMoveAudited$, of(true));

  constructor(private el: ElementRef<HTMLElement>) {}

  dragStarted(): void {
    this.startSize$.next(this.el.nativeElement.getBoundingClientRect());
  }

  dragEnded($event: CdkDragEnd): void {
    $event.source._dragRef.reset();
    this.resized.emit(this.el.nativeElement.getBoundingClientRect());
  }

  dragMoved($event: CdkDragMove): void {
    this.dragMove$.next($event);
  }
}
