import {
  Directive,
  Output,
  Input,
  EventEmitter,
  HostBinding,
  HostListener,
  ElementRef
} from "@angular/core";

 @Directive({     selector: 'img[default]', })
 export class DefaultImageDirective {

  constructor(private elem: ElementRef) {     }

    @Input() default = "../assets/images/placeholderimage.png"

    @HostListener('error') onError(): void {
       this.elem.nativeElement.src = this.default;     }
}


