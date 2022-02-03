import { Component, OnInit,OnChanges, EventEmitter, Output, Input, ElementRef, ViewChild, ChangeDetectionStrategy, SimpleChange } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';

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

  @Output() outPutValue   = new EventEmitter();
  @Output() outPutReturnEnter = new EventEmitter();

  @Input() value          = '';
  @Input() instruction    = 'Enter Value';
  @Input() inputTypeValue = 'password';
  @Input() inputForm      : FormGroup;
  @Input() showInput      = false;
  @Input() formatted      : string;
  inputType               = 'text';
  showPassword            : boolean;
  showDoubleZero          = false // for faster entry.

  @Input() numberbuttons  = 'number-buttons button-sized-1';
  @Input() alternateClass = 'grid-keypad'

  constructor(  private fb: FormBuilder) {
    // this.initForm();
    if (this.formatted) {
      if (this.inputTypeValue.toLowerCase() === 'decimal')
      { this.showDoubleZero = true}
    }
  }

  ngOnInit() {

    if (!this.inputForm) {
      this.initForm();
    }
  }

  initForm() {

    this.inputForm = this.fb.group({
      itemName: ['']
    })
    if (this.inputForm) {
      this.inputForm.controls['itemName'].valueChanges.subscribe(data => {
        if (data == '' || data == undefined) {
          this.returnEnter(data);
        }
      })
      this.initSearchOption();
    }
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
    this.value = ''
    this.formatted = ''
  }

  initSearchOption() {
    // const input$ = fromEvent(this.input.nativeElement, 'onSelectionChange');
    if (this.input) {
      console.log('input initSearch' )
      fromEvent(this.input.nativeElement,'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(350),
        distinctUntilChanged(),
        tap((event:KeyboardEvent) => {
          if (this.input.nativeElement.value) {
            const search  = this.input.nativeElement.value
            this.input.nativeElement.focus();
            if (search > 1) {
              this.outPutValue.emit(search)
            }
          }
        })
      )
      .subscribe();
    }
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

  returnEnterPress(){
    // this.returnEnter(this.value)

    this.refreshDisplay()
    this.outPutReturnEnter.emit(this.value)
  }

  returnEnter(value) {
    if (value){
      this.value = value
      this.refreshDisplay()
      this.outPutValue.emit(value)
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
    if (!this.value) {
      this.inputForm.controls['itemName'].setValue('')
      return
    }

    if (this.value)
    {
      //formating of input box
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
      if (this.inputTypeValue == 'decimal') {
        const numVal = parseInt( this.value) / 100
        this.formatted = Number(numVal).toLocaleString('en', this.options);
      }

      //wholeValue
      if (this.inputTypeValue == 'wholeValue' ) {
        const numVal = parseInt( this.value) / 100
        this.formatted = Number(numVal).toLocaleString('en', this.options);
      }

      if (this.inputTypeValue == 'text' ) {
        const numVal = parseInt( this.value)
        this.formatted = this.value //Number(numVal).toLocaleString('en', this.options);
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
        // const numVal = parseInt( this.value)
        this.formatted = this.value //Number(numVal).toLocaleString('en', this.options);
      } else {
        this.formatted = Number(0).toLocaleString('en', this.options);
      }
    }

    if (this.formatted) {
      this.inputForm.controls['itemName'].setValue(this.formatted)
    } else {
      this.initForm();
    }

  }

  updateDisplayOutput() {
    this.refreshDisplay();
    if (this.formatted && this.formatted.length > 1) {
      this.outPutValue.emit(this.formatted)
    }
  }

}

