import { ChangeDetectionStrategy , Component, Input, forwardRef, NgZone } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl } from '@angular/forms';
import {
  OnDestroy,
  AfterViewInit,
  EventEmitter,
  Output
} from '@angular/core';

import {  validEvents } from 'src/app/_interfaces/';

import 'tinymce/tinymce.min';
declare var tinymce: any;

//import 'tinymce/themes/modern/theme';
//import 'tinymce/plugins/link/plugin.js';
//import 'tinymce/plugins/paste/plugin.js';
// import 'tinymce/plugins/table/plugin.js';
//import 'tinymce/plugins/advlist/plugin.js';
// import 'tinymce/plugins/autoresize/plugin.js';
//import 'tinymce/plugins/lists/plugin.js';
//import 'tinymce/plugins/autolink/plugin.js';
// import 'tinymce/plugins/code/plugin.js';
// import 'tinymce/langs/nl.js';

@Component({
  selector: 'simple-tinymce',
  template: `<textarea id="{{elementId}}"></textarea>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SimpleTinyComponent),
      multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SimpleTinyComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {

  public elementId: string = 'tiny-' + Math.random().toString(36).substring(2);
  public editor: any;
  public content: string;

  @Input() init: { [key: string]: any } | undefined;
  @Input() inline: boolean | undefined;
  @Input() tagName: string | undefined;
  @Input() plugins: string | undefined;
  @Input() toolbar: string | string[] | null = null;
  @Input() initialValue: string | undefined;

  private onTouchedCallback = () => { };
  private onChangeCallback = (x: any) => { };

  constructor(private _ngZone: NgZone) {
     this.initialise = this.initialise.bind(this);
  }
  ngAfterViewInit() {
    this.initialise();
    //console.log(this.initialValue);
    // this._ngZone.runOutsideAngular(() => {
    //   tinymce.init({
    //     selector: '#' + this.elementId,
    //     skin_url: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.8.2/skins/lightgray/',

    //     setup: editor => {
    //       this.editor = editor;
    //       editor.on('input keyup',
    //         () => {
    //           this._ngZone.run(() => {
    //             this.content = editor.getContent();
    //             this.propagateChange(this.content);
    //           })
    //         });
    //     },
    //     inline: false,
    //     menubar: false,
    //     format: 'html',
    //     init_instance_callback: editor => {
    //       editor.setContent(this.content);
    //     },
    //   });
    // });
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }

  writeValue(value: string | null): void {
    this.initialValue = value || this.initialValue;

    if (this.editor && this.editor.initialized && typeof value === 'string') {
      this.editor.setContent(value);
    }
  }

  // registers 'fn' that will be fired wheb changes are made
  // this is how we emit the changes back to the form
  
  registerOnChange(fn: (_: any) => void): void {
      this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
      this.onTouchedCallback = fn;
  }

  private initEditor(initEvent: Event, editor: any) {
    if (typeof this.initialValue === 'string') {
      this._ngZone.run(() => editor.setContent(this.initialValue));
    }
    editor.once('blur', () => this._ngZone.run(() => this.onTouchedCallback()));
    editor.on(
      'setcontent',
      ({ content, format }: any) => format === 'html' && content && this._ngZone.run(() => this.onChangeCallback(content))
    );
    editor.on('change keyup undo redo', () => this._ngZone.run(() => this.onChangeCallback(editor.getContent())));
    this.bindHandlers(this, editor, initEvent);
  }

  initialise() {
    const finalInit = {
      ...this.init,
      selector: '#' + this.elementId,
      // inline: this.inline,
      // plugins: mergePlugins(this.init && this.init.plugins, this.plugins),
      toolbar: this.toolbar || (this.init && this.init.toolbar),
      // skin_url: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/4.8.2/skins/lightgray/',
      setup: (editor: any) => {
        this.editor = editor;
        editor.on('init', (e: Event) => {
          this.initEditor(e, editor);
        });

        if (this.init && typeof this.init.setup === 'function') {
          this.init.setup(editor);
        }
      }
    };

    // if (isTextarea(this.element)) {
    //   this.element.style.visibility = '';
    // }

    this._ngZone.runOutsideAngular(() => {
      tinymce.init(finalInit);
    });
  }

    bindHandlers(ctx: SimpleTinyComponent, editor: any, initEvent: Event) {
      validEvents.forEach((eventName) => {
        const eventEmitter: EventEmitter<any> = ctx[eventName];
        try {
          if (eventEmitter != undefined ){

            if ( eventEmitter.observers.length > 0) {
              if (eventName === 'onInit') {
                ctx._ngZone.run(() => eventEmitter.emit({ event: initEvent, editor }));
              } else {
                editor.on(eventName.substring(2), ctx._ngZone.run(() => (event: any) => eventEmitter.emit({ event, editor })));
              }
            }

          }
         
        } catch (error) {
          
        }
      

      });
    };

}
