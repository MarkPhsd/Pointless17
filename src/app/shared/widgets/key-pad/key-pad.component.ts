import { Component, OnInit,OnChanges, EventEmitter, Output, Input, ElementRef, ViewChild, ChangeDetectionStrategy, SimpleChange } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription, of } from 'rxjs';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { TagChipsProductsComponent } from 'src/app/modules/admin/products/productedit/_product-edit-parts/tag-chips-products/tag-chips-products.component';

// https://market.ionicframework.com/plugins/ion-numeric-keyboard
@Component({
  selector: 'app-key-pad',
  templateUrl: './key-pad.component.html',
  styleUrls: ['./key-pad.component.scss'],
})
export class KeyPadComponent implements OnInit, OnChanges {
  options = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };

  @ViewChild('input', {static: true}) input: ElementRef;
  private el: HTMLInputElement;
  checked: any;

  //returns on number input
  @Output() outPutValue   = new EventEmitter();
  @Output() outPutCheckEntry  = new EventEmitter();
  //returns on enter press
  @Output() outPutReturnEnter = new EventEmitter();
  @Output() outPutFocus   = new EventEmitter();
  @Input() _value        : Subscription;
  @Input() value          = '';
  @Input() instruction    = 'Enter Value';
  @Input() inputTypeValue = '';
  @Input() inputForm      : UntypedFormGroup;
  @Input() showInput      = false;
  @Input() formatted      : any;
  @Input() fieldName      : string;
  @Input() disableFocus: boolean;
  formattedValue          : any;
  inputType               = 'text';
  showPassword            : boolean;
  showDoubleZero          = false // for faster entry.
  cashValue: any;
  quantityValue$: any;
  placeHolder: string;
  @Input() numberbuttons  = 'number-buttons button-sized-1';
  @Input() alternateClass = 'grid-keypad'
  @Input() decimals       = 0;
  @Input() requireWholeNumber: boolean;

  constructor(
    private orderMethodsService: OrderMethodsService,
    private fb: UntypedFormBuilder) {
    if (this.formatted) {
      if (this.inputTypeValue.toLowerCase() === 'decimal')
      { this.showDoubleZero = true}
    }
  }

  ngOnInit() {
    if (this.inputTypeValue) {
      this.inputType = this.inputTypeValue;
    }
    if (!this.fieldName) {this.fieldName = 'itemName'}
    this.initForm();

    this.quantityValue$ = this.orderMethodsService.quantityValue$.pipe(switchMap(data => {
      this.placeHolder = 'Quantity'

      if (data != this.inputForm.controls['itemName'].value) {
        if (data == 1) {
          this.inputForm.controls['itemName'].setValue(null)
          return of(data)
        }
        this.inputForm.controls['itemName'].setValue(data)
      }

      this.setFocusOnScanner();
      return of(data)
    }))

  }

  formSubscriber() {
    if (this.inputForm) {
      this.inputForm.controls['itemName'].valueChanges.subscribe(data => {
        if (data) {
          this.onChangeValueUpdate(data)
        }
      })

      if (this.fieldName  && this.fieldName != 'itemName') {
        this.inputForm.controls[this.fieldName].valueChanges.subscribe(data => {
          if (data) {
            this.onChangeValueUpdate(data)
          }
        })
      }

    }
  }

  clearInput() {
    this.value = '';
    this.cashValue = ''
    this.formattedValue = ''
    this.outPutValue.emit('')
    this.outPutCheckEntry.emit(null)
    this.initForm()
  }

  initForm() {
    this._initForm();
    if (this.inputForm && this.fieldName) {
      this.inputForm.addControl( this.fieldName,new UntypedFormControl([]) );
      this.formSubscriber()
      this.inputForm.controls[this.fieldName].valueChanges.subscribe(data => {
        if (data == '' || data == undefined) {
          this.returnEnter(data);
        }
      })
      this.initSearchOption();
    }
  }

  _initForm() {
    this.inputForm = this.fb.group({
      itemName: [],
    })

  }

  resetValues() {
    this._initForm();
    this.value = '';
    this.cashValue = ''
    this.formattedValue = ''
  }

  initShowInput() {
    this.showInput = !this.showInput
    if (this.showInput) {
      this.initForm()
      this.initSearchOption();
    }
  }

  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    // Extract changes to the input property by its name
    let change: SimpleChange = changes['data'];
    this.value     = ''
    this.formatted = ''

  }

  initSearchOption() {
    // const input$ = fromEvent(this.input.nativeElement, 'onSelectionChange');
    if (this.input) {
      fromEvent(this.input.nativeElement,'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(350),
        distinctUntilChanged(),
        tap((event:KeyboardEvent) => {
          if (this.input.nativeElement.value) {
            const search  = this.input.nativeElement.value

            if (search > 1) {
              this.outPutValue.emit(search)
            }

            this.setFocusOnScanner();

          }
        })
      )
      .subscribe();
    }
  }

  setFocusOnScanner() {
    // if (this.disableFocus) {
    //   console.log('focusing')
    //   this.outPutFocus.emit(true)
    //   return;
    // }
    if (this.input) {
      this.input.nativeElement.focus();
    }
  }

  onChangeValueUpdate(data: number) {
    if (this.showInput)  { return }
    this.formatted = data
    this.value     = this.formatted
    this.outPutValue.emit(this.formatted)
    this.outPutCheckEntry.emit(this.formatted);

  }

  enterValue(event) {
    this.value =  this.value + event
    this.updateDisplayOutput()
  }

  inputDoubleZero() {
    this.value =  this.value + '00'
    this.updateDisplayOutput()
  }

  inputTripleZero() {
    this.value =  this.value + '000'
    this.updateDisplayOutput()
  }

  returnEnter(value) {
    if (value){
      this.value = value
      this.refreshDisplay()
      this.outPutValue.emit(this.formatted)
    }
  }

  deleteLastItem() {
    const len = this.value.length;
    if (len == 1 || len == 0) {
      this.value = ''
      this.refreshDisplay();
      return
    }
    if (len > 0) {  this.value = this.value.substring(0, len -1) }
    this.updateDisplayOutput();
  }

  refreshDisplay() {
    if (this.value)
    {
      if (this.inputTypeValue === 'password') {
        if (this.showPassword) {
          this.inputType = 'password'
        } else {
          this.inputType = 'text'
        }
      }
      if (this.inputTypeValue != 'password') {
        this.inputType = this.inputTypeValue
      }
      //decimal
      let divider = 0
      if (!this.decimals) {
        this.decimals = 2
        divider = 100
      }
      if (this.decimals = 1) {
        divider = 10
      }
      if (this.decimals = 2) {
        divider = 100
      }
      if (this.decimals = 0) {
        divider = 1
      }

      if ( (this.inputTypeValue == 'number' &&  this.requireWholeNumber) || this.inputTypeValue == 'decimal' ) {
        if (this.requireWholeNumber) {
          const numVal = parseInt( this.value)
          this.formatted = Number(numVal).toLocaleString('en', this.options);
        }
        if (!this.requireWholeNumber) {
          const numVal = parseInt( this.value) / divider
          this.formatted = Number(numVal).toLocaleString('en', this.options);
        }
      }

      //wholeValue
      if ( this.decimals > 0 && (this.inputTypeValue == 'wholeValue' || this.inputTypeValue == 'number' || this.requireWholeNumber) ) {
        if (this.requireWholeNumber) {
          const numVal = parseInt( this.value)
          this.formatted = Number(numVal).toLocaleString('en', this.options);
        }
        if (!this.requireWholeNumber) {
          const numVal = parseInt( this.value) / 1 * this.decimals
          this.formatted = Number(numVal).toLocaleString('en', this.options);
        }
      }

      if (this.inputTypeValue == 'text' ) {
        const numVal = parseInt( this.value)
        this.formatted = this.value
      }

      //password
      if (this.inputTypeValue == 'password') {
        if (this.showPassword) {
          this.inputType = 'text'
        }
        if (!this.showPassword) {
          this.inputType = 'password'
        }
        this.formatted = this.value;
      }

    } else {

      if (this.inputTypeValue == 'text' ) {
        this.formatted = this.value //Number(numVal).toLocaleString('en', this.options);
      } else {
        this.formatted = Number(0).toLocaleString('en', this.options);
      }
    }

    if (this.formatted == undefined || !this.formatted) {
      const item      = { itemName:  this.value }
      this.inputForm.patchValue(item)
      return
    }

    if (this.formatted != undefined) {
      const fieldName = this.fieldName
      const value     = this.formatted
      const item      = { itemName:  this.formatted, packageQuantity: this.formatted, }
      this.inputForm.patchValue(item)
    } else {
      this.initForm();
    }
  }

  returnEnterPress(){
    if (!this.value && this.cashValue) {
      this.outPutReturnEnter.emit(this.cashValue);
      return;
    }

    if (!this.formatted) {
      this.outPutReturnEnter.emit(this.value)
      return
    }

    this.refreshDisplay()
    this.outPutReturnEnter.emit(this.formatted)
  }

  updateDisplayOutput() {
    //user choice on what they want to update
    this.refreshDisplay();
    if (this.formatted && this.formatted.length > 1) {
      this.outPutValue.emit(this.formatted)
    }
    this.outPutCheckEntry.emit(this.formatted)

  }

}

// import { Component, OnInit,OnChanges, EventEmitter, Output, Input, ElementRef, ViewChild, ChangeDetectionStrategy, SimpleChange } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { debounceTime, distinctUntilChanged, filter,tap } from 'rxjs/operators';
// import { fromEvent } from 'rxjs';

// // https://market.ionicframework.com/plugins/ion-numeric-keyboard
// @Component({
//   selector: 'app-key-pad',
//   templateUrl: './key-pad.component.html',
//   styleUrls: ['./key-pad.component.scss'],
// })
// export class KeyPadComponent implements OnInit, OnChanges {
//   options = {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   };

//   @ViewChild('input', {static: true}) input: ElementRef;
//   private el: HTMLInputElement;
//   checked: any;

//   @Output() outPutValue   = new EventEmitter();
//   @Output() outPutReturnEnter = new EventEmitter();

//   @Input() value          = '';
//   @Input() instruction    = 'Enter Value';
//   @Input() inputTypeValue = 'password';
//   @Input() inputForm      : FormGroup;
//   @Input() showInput      = false;
//   @Input() formatted      : string;
//   @Input() fieldName      : string;
//   inputType               = 'text';
//   showPassword            : boolean;
//   showDoubleZero          = false // for faster entry.

//   @Input() numberbuttons  = 'number-buttons button-sized-1';
//   @Input() alternateClass = 'grid-keypad'

//   constructor(  private fb: FormBuilder) {
//     // this.initForm();
//     if (this.formatted) {
//       if (this.inputTypeValue.toLowerCase() === 'decimal')
//       { this.showDoubleZero = true}
//     }
//   }

//   ngOnInit() {
//     if (!this.fieldName) { this.fieldName = 'itemName'}
//     if (!this.inputForm) { this.initForm();  }
//   }

//   initForm() {
//     if (this.fieldName === 'itemName'){
//         this.inputForm = this.fb.group({
//         itemName: ['']
//       })
//     }

//     if (this.inputForm) {
//       this.inputForm.controls[this.fieldName].valueChanges.subscribe(data => {
//         if (data == '' || data == undefined) {
//           this.returnEnter(data);
//         }
//       })
//       this.initSearchOption();
//     }
//   }

//   initShowInput() {
//     this.showInput = !this.showInput
//     if (this.showInput) {
//       this.initForm()
//       this.initSearchOption();
//     }
//   }

//   ngOnChanges(changes: { [property: string]: SimpleChange }) {
//     // Extract changes to the input property by its name
//     let change: SimpleChange = changes['data'];
//     this.value = ''
//     this.formatted = ''
//   }

//   initSearchOption() {
//     if (this.input) {
//       console.log('input initSearch' )
//       fromEvent(this.input.nativeElement,'keyup')
//       .pipe(
//         filter(Boolean),
//         debounceTime(350),
//         distinctUntilChanged(),
//         tap((event:KeyboardEvent) => {
//           if (this.input.nativeElement.value) {
//             const search  = this.input.nativeElement.value
//             this.input.nativeElement.focus();
//             if (search > 1) {
//               this.outPutValue.emit(search)
//             }
//           }
//         })
//       )
//       .subscribe();
//     }
//   }

//   enterValue(event) {
//     // if (this.value && event) {
//       this.value =  this.value + event
//     // }
//     console.log(this.value, event)
//     this.updateDisplayOutput()
//   }

//   inputDoubleZero() {
//     this.value =  this.value + '00'
//     this.updateDisplayOutput()
//   }

//   inputTripleZero() {
//     this.value =  this.value + '000'
//     this.updateDisplayOutput()
//   }

//   returnEnterPress(){
//     // this.returnEnter(this.value)
//     this.refreshDisplay()
//     this.outPutReturnEnter.emit(this.value)
//   }

//   returnEnter(value) {
//     if (value){
//       this.value = value
//       this.refreshDisplay()
//       this.outPutValue.emit(value)
//     }
//   }

//   deleteLastItem() {
//     const len = this.value.length;
//     if (len == 1 || len == 0) {
//       this.value = ''
//       this.refreshDisplay();
//       return
//     }
//     if (len > 0) {  this.value = this.value.substring(0, len -1) }
//     this.updateDisplayOutput();
//   }

//   refreshDisplay() {
//     console.log('refreshDisplay this.value', this.value, this.fieldName)
//     if (!this.fieldName) { return }

//     if (this.value)
//     {
//       //formating of input box
//       if (this.inputTypeValue === 'password') {
//         if (this.showPassword) {
//           this.inputType = 'password'
//         } else {
//           this.inputType = 'text'
//         }
//       }
//       if (this.inputTypeValue != 'password') {
//         this.inputType = this.inputTypeValue
//       }

//       //decimal
//       if (this.inputTypeValue == 'decimal') {
//         const numVal = parseInt( this.value) / 100
//         this.formatted = Number(numVal).toLocaleString('en', this.options);
//       }

//       //wholeValue
//       if (this.inputTypeValue == 'wholeValue' ) {
//         const numVal = parseInt( this.value) / 100
//         this.formatted = Number(numVal).toLocaleString('en', this.options);
//       }

//       if (this.inputTypeValue == 'text' ) {
//         const numVal = parseInt( this.value)
//         this.formatted = this.value //Number(numVal).toLocaleString('en', this.options);
//       }

//       //password
//       if (this.inputTypeValue == 'password') {
//         if (this.showPassword) {
//           this.inputType = 'text'
//         }
//         if (!this.showPassword) {
//           this.inputType = 'password'
//         }
//         this.formatted = this.value;
//       }

//     } else {
//       if (this.inputTypeValue == 'text' ) {
//         // const numVal = parseInt( this.value)
//         this.formatted = this.value //Number(numVal).toLocaleString('en', this.options);
//       } else {
//         this.formatted = Number(0).toLocaleString('en', this.options);
//       }
//     }

//     if (this.formatted) {
//       console.log('Update local form control')
//       this.inputForm.controls[this.fieldName].setValue(this.formatted)
//     } else {
//       this.initForm();
//     }

//   }

//   updateDisplayOutput() {
//     this.refreshDisplay();
//     console.log('update display output', this.formatted)
//     if (this.formatted && this.formatted.length > 1) {
//       //   console.log('update display output')
//       //   this.inputForm.controls[this.fieldName].setValue(this.formatted)

//       this.outPutValue.emit(this.formatted)
//     }
//   }

// }

