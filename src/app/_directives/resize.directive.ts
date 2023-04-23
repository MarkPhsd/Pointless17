import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[resize]'
})
export class ResizeDirective {
  private startX: number;
  private startY: number;
  private isResizing: boolean = false;
  private mouseOffsetX: number;
  private mouseOffsetY: number;

  @Output() resize = new EventEmitter<{ width: number, height: number }>();

  constructor(private el: ElementRef) {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // Check if the mouse is clicked in the bottom right corner
    const rect = this.el.nativeElement.getBoundingClientRect();
    if (event.clientX > rect.right - 10 && event.clientY > rect.bottom - 10) {
      this.startX = event.clientX;
      this.startY = event.clientY;
      this.mouseOffsetX = event.clientX - rect.right;
      this.mouseOffsetY = event.clientY - rect.bottom;
      this.isResizing = true;
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
      document.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
  }

  private onMouseMove(event: MouseEvent) {
    if (this.isResizing) {
      const dx = event.clientX - this.startX;
      const dy = event.clientY - this.startY;

      // Resize the element
      this.el.nativeElement.style.width = this.el.nativeElement.offsetWidth + dx + 'px';
      this.el.nativeElement.style.height = this.el.nativeElement.offsetHeight + dy + 'px';

      // Move the mouse along with the corner of the box
      const rect = this.el.nativeElement.getBoundingClientRect();
      const newMouseX = rect.right + this.mouseOffsetX;
      const newMouseY = rect.bottom + this.mouseOffsetY;
      const offsetX = newMouseX - event.clientX;
      const offsetY = newMouseY - event.clientY;
      window.scrollBy(offsetX, offsetY);

      this.startX = event.clientX;
      this.startY = event.clientY;

      // Emit a resize event with the new size
      const width = this.el.nativeElement.offsetWidth;
      const height = this.el.nativeElement.offsetHeight;
      this.resize.emit({ width, height });
    }
  }

  private onMouseUp(event: MouseEvent) {
    if (this.isResizing) {
      document.removeEventListener('mousemove', this.onMouseMove.bind(this));
      document.removeEventListener('mouseup', this.onMouseUp.bind(this));
      this.isResizing = false;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUpOutside(event: MouseEvent) {
    if (this.isResizing && !this.el.nativeElement.contains(event.target)) {
      this.onMouseUp(event);
    }
  }
}
