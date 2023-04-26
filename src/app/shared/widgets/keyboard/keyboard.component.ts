import { AfterViewInit, Component, Input, Output, ViewEncapsulation } from "@angular/core";
import Keyboard from "simple-keyboard";
import { InputTrackerService } from "src/app/_services/system/input-tracker.service";
import { UISettingsService } from "src/app/_services/system/settings/uisettings.service";

@Component({
  selector: 'app-keyboard',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})

export class KeyboardComponent implements AfterViewInit {

    @Input() disableClose: boolean;
    
    constructor(
      public trackerService: InputTrackerService,
      private uiSettingService: UISettingsService) {}

    value = "";
    keyboard: Keyboard;

    ngAfterViewInit() {
      try {
        this.keyboard = new Keyboard({
          onChange: input => this.onChange(input),
          onKeyPress: button => this.onKeyPress(button)
        });
      } catch (error) {
        console.log('Error Initializing Keyboard', error)
      }
    }

    clearText() { 
      if (this.trackerService.lastSelectedInput) { 
        let input = this.trackerService.lastSelectedInput;
        // this.value = ''
        input.setValue('')
        this.trackerService.setLastSelectedInput(input)
      }
    }

    close() { 
      this.uiSettingService.updateSetKeyboard(false)
    }
  
    onChange = (input: string) => {
      this.value = input ;
      const anyControl = this.trackerService._lastSelectedInput;
      if (input && input.toString()) { 
        anyControl.setValue(input.toString())
        this.trackerService.setLastSelectedInput(anyControl)
      }
      // this.uiSettingService.updateRelativeValue(input)
    };
  
    onKeyPress = (button: string) => {
      console.log("Button pressed", button);
      console.log('value', this.value)
      /**
       * If you want to handle the shift and caps lock buttons
       */
      if (button === "{shift}" || button === "{lock}") this.handleShift();

    };

    clearInput() {
      // this.value =''
      this.trackerService.clearInput()
      this.value =''
      // console.log('onInputChange', event.target.value)
      this.keyboard.setInput('');
      this.keyboard.clearInput()
    };
  
    onInputChange = (event: any) => {
      console.log('onInputChange', event.target.value)
      this.keyboard.setInput(event.target.value);
    };
  
    handleShift = () => {
      let currentLayout = this.keyboard.options.layoutName;
      let shiftToggle = currentLayout === "default" ? "shift" : "default";
  
      this.keyboard.setOptions({
        layoutName: shiftToggle
      });
    };
  }
  
  // keyboard: Keyboard;
  // keyboardLayouts: any;
  // layouts: Array<object>;
  // layoutsObj: object;
  // selectedLayout = 'english';
  // inputName: string;
  // @Output() clickOutside = new EventEmitter<void>();

  // @Input() keyboardValue: number | string;
  // @Output() keyboardChange = new EventEmitter();

  // inputValue;
  // showKeyboard: boolean;
  // shiftActive: boolean;

  // constructor() {
  //   this.keyboardLayouts = new SimpleKeyboardLayouts();
  //   this.layoutsObj = this.keyboardLayouts.get();
  //   this.layouts = Object.keys(this.layoutsObj).map((layoutName) => ({
  //     name: layoutName,
  //     value: this.layoutsObj[layoutName],
  //   }));
  // }

  // public initialiseKeyboard() {
//     this.selectedLayout = 'english';

//     this.keyboard = new Keyboard({
//       debug: true,
//       inputName: this.inputName,
//       onChange: (input) => this.onChange(input),
//       onKeyPress: (button) => this.onKeyPress(button),
//       preventMouseDownDefault: true, // If you want to keep focus on input
//       disableCaretPositioning: true,
//       newLineOnEnter: false,
//       layout: {
//         default: [this.layoutsObj[this.selectedLayout].layout.default][0],
//         shift: [this.layoutsObj[this.selectedLayout].layout.shift][0],
//         numeric: ['1 2 3', '4 5 6', '7 8 9', '{bksp} 0 {enter}'],
//         decimal: ['1 2 3', '4 5 6', '7 8 9', '.00 0 .', '{bksp} {enter}'],
//       },
//       buttonTheme: [
//         {
//           class: 'hg-enter',
//           buttons: '{enter}',
//         },
//       ],
//       display: {
//         '{enter}': '↩',
//         '{bksp}': '⌫',
//         '{space}': ' ',
//         '{shift}': '⇪',
//         '{lock}': '🄰',
//         '{tab}': '⇄',
//       },
//     });

//     this.showKeyboard = false;
//     /**
//      * Since we have default values for our inputs,
//      * we must sync them with simple-keyboard
//      */
//     /*    this.keyboard.replaceInput(this.inputs);*/
//   }

//   @HostListener('document:click', ['$event.target'])
//   public onClick(target) {
//     var keyboard = document.getElementsByClassName('simple-keyboard')[0];
//     if (keyboard) {
//       if (keyboard !== event.target && !keyboard.contains(target)) {
//         if (
//           !target.classList.contains('form-control') ||
//           target.tagName === 'SELECT'
//         ) {
//           this.clickOutside.emit();
//           this.closeKeyboard();
//         }
//       }
//     }
//   }

//   onInputFocus = (event: any) => {
//     if (!this.keyboard) {
//       this.initialiseKeyboard();
//     }

//     this.inputName = event.target.id;
//     this.keyboardValue = event.target.value;

//     var layout = 'default';
//     if (event.target.classList.contains('numeric')) {
//       layout = 'numeric';
//     }
//     if (event.target.classList.contains('decimal')) {
//       layout = 'decimal';
//     }

//     this.keyboard.setOptions({
//       inputName: event.target.id,
//       layoutName: layout,
//     });

//     //if (!this.showKeyboard) {
//     setTimeout(() => {
//       this.showKeyboard = true;
//       console.log('keyboard shown ' + this.showKeyboard);
//     }, 100);
//     //}

//     this.keyboard.setInput(event.target.value);
//   };

//   setInputCaretPosition = (elem: any, pos: number) => {
//     if (elem.setSelectionRange) {
//       elem.focus();
//       elem.setSelectionRange(pos, pos);
//     }
//   };

//   onInputChange = (event: any) => {
//     this.keyboardValue = event.target.value;
//     this.keyboard.setInput(event.target.value, event.target.id);
//   };

//   onChange = (input: string) => {
//     this.keyboard.setInput(input);
//     this.keyboardValue = input;
//     this.keyboardChange.emit(this.keyboardValue);
//     this.inputValue = input;
//     //this.systemParametersForm.controls[this.inputName].setValue(input);

//     /**
//      * Synchronizing input caret position
//      * This part is optional and only relevant if using the option "preventMouseDownDefault: true"
//      */
//     let caretPosition = this.keyboard.caretPosition;

//     if (caretPosition !== null)
//       this.setInputCaretPosition(
//         document.querySelector(`#${this.inputName}`),
//         caretPosition
//       );
//   };

//   onKeyPress = (button: string) => {
//     if (this.shiftActive) {
//       this.shiftActive = false;
//       this.handleShift(button);
//     }

//     if (button === '{enter}') {
//       this.closeKeyboard();
//     }

//     if (button === '{clr}') {
//       this.keyboard.clearInput(this.inputName);
//     }

//     /**
//      * If you want to handle the shift and caps lock buttons
//      */
//     if (button === '{shift}' || button === '{lock}') this.handleShift(button);
//   };

//   handleShift = (button) => {
//     let currentLayout = this.keyboard.options.layoutName;
//     let shiftToggle = currentLayout === 'default' ? 'shift' : 'default';

//     if (button === '{shift}') {
//       this.shiftActive = true;
//     } else {
//       this.shiftActive = false;
//     }

//     this.keyboard.setOptions({
//       layoutName: shiftToggle,
//     });
//   };

//   closeKeyboard() {
//     this.showKeyboard = false;
//     //this.showKeyboard.next(false);
//   }
// }
