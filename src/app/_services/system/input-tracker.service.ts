// input-tracker.service.ts
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class InputTrackerService {
  private renderer: Renderer2;
  public _lastSelectedInput: FormControl | null = null;
  private inputControlsMap: Map<string, FormControl> = new Map();

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.listenForFocusEvents();
  }

  get lastSelectedInput(): FormControl | null {
    return this._lastSelectedInput;
  }

  setLastSelectedInput(input: FormControl): void {
    this._lastSelectedInput = input;
  }

  clearInput() { 
    if (this.lastSelectedInput) { 
      let input = this.lastSelectedInput
      input.setValue('');
      this.setLastSelectedInput(input)
    }
  }

  registerFormControl(id: string, control: FormControl): void {
    this.inputControlsMap.set(id, control);
  }

  private listenForFocusEvents(): void {
    this.renderer.listen('document', 'focusin', (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' && target.hasAttribute('data-ng-control-id')) {
        const controlId = target.getAttribute('data-ng-control-id');
        const formControl = this.inputControlsMap.get(controlId);
        if (formControl instanceof FormControl) {
          this.setLastSelectedInput(formControl);
        }
      }
    });
  }
}
