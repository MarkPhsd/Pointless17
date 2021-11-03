import { OnInit, ElementRef, Renderer2, Input, Directive } from '@angular/core';
import { Capacitor, Plugins, KeyboardInfo } from '@capacitor/core';

const { Keyboard } = Plugins;
@Directive({
  selector: '[appAutoFocusInput]'
})

export class AutofocusDirective implements OnInit {

  get platForm() {  return Capacitor.getPlatform(); }
  // @Input focusMe = 'true';

  constructor(private hostElement: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
      // if (this.focusMe) {
    this.hostElement.nativeElement.focus();
    if (this.platForm != 'web') {
      console.log('hide keyboard')
        Keyboard.hide()
    }
  }

}
