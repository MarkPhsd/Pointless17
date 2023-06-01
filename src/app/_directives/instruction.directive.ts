import { Directive, ElementRef, HostListener, Renderer2, Input } from '@angular/core';

@Directive({
  selector: '[appInstruction]'
})
export class InstructionDirective {
  @Input('appInstruction') instructionText: string;

  private instructionDiv: HTMLElement;
  private closeButton: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    this.instructionDiv = this.renderer.createElement('div');
    this.closeButton = this.renderer.createElement('button');

    // Setting up the close button
    this.renderer.listen(this.closeButton, 'click', (event) => {
      this.renderer.setStyle(this.instructionDiv, 'display', 'none');
    });
    this.renderer.setProperty(this.closeButton, 'innerHTML', ' x ');
    this.renderer.addClass(this.closeButton, 'close-button');

    this.renderer.setStyle(this.closeButton, 'width', '50px');
    this.renderer.setStyle(this.closeButton, 'height', '50px');
    this.renderer.setStyle(this.closeButton, 'margin', '5px');
    this.renderer.setStyle(this.closeButton, 'border-style', 'solid');
    this.renderer.setStyle(this.closeButton, 'border-width', '1px');
    this.renderer.setStyle(this.closeButton, 'border-radius', '5px');

    // Adding the instruction div to the body to make it independent of the host element layout
    document.body.appendChild(this.instructionDiv);

    // Setting up the initial display properties
    this.renderer.setStyle(this.instructionDiv, 'display', 'none');
    this.renderer.setStyle(this.instructionDiv, 'position', 'fixed');
    this.renderer.setStyle(this.instructionDiv, 'z-index', '9999');

  }

  ngOnInit() {
    let textNode = this.renderer.createText(this.instructionText);
    this.renderer.appendChild(this.instructionDiv, textNode);
    this.renderer.appendChild(this.instructionDiv, this.closeButton);
    // this.instr
  }

  // Expose a method to show the instruction
  showInstruction() {
    this.renderer.setStyle(this.instructionDiv, 'display', 'block');
    this.adjustPosition();
  }

  // Expose a method to show the instruction
  hideInstruction() {
    this.renderer.setStyle(this.instructionDiv, 'display', `none`);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.adjustPosition();
  }

  adjustPosition() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    //style="background-color: rgb(219, 219, 158); padding: 10px;"
    this.renderer.setStyle(this.instructionDiv, 'padding', `10px`);
    this.renderer.setStyle(this.instructionDiv, 'border-width', `1px`);
    this.renderer.setStyle(this.instructionDiv, 'border-radius', `5px`);
    this.renderer.setStyle(this.instructionDiv, 'border-style', 'solid');
    this.renderer.setStyle(this.instructionDiv, 'background-color', ` rgb(255,255, 158)`);

    this.renderer.setStyle(this.instructionDiv, 'left', `${rect.left}px`);
    this.renderer.setStyle(this.instructionDiv, 'top', `${rect.bottom}px`);
  }
}
