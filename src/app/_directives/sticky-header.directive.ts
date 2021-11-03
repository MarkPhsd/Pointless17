import { Directive, OnInit, ElementRef, HostBinding, HostListener } from '@angular/core';

@Directive({
    /* tslint:disable-next-line:directive-selector */
    selector: '[stickyHeaderDirective]'
})
export class StickyHeaderDirective implements OnInit {


    ngOnInit() {
        console.log('lets track ths scroll');
    }

    constructor() {}

    @HostListener('scroll', ['$event']) private onScroll($event: Event): void {
        console.log($event.target, $event.target);
    }
}
