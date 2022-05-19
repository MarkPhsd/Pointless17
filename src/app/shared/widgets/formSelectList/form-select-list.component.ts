import { Component, EventEmitter, Input, OnInit, Output , OnChanges} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'form-select-list',
  templateUrl: './form-select-list.component.html',
  styleUrls: ['./form-select-list.component.scss']
})
export class FormSelectListComponent implements OnInit , OnChanges{
  @Input()  list            : any[];
  @Input()  list$           : Observable<any[]>;
  @Input()  formFieldName   : string;
  @Input()  searchForm      : FormGroup;
  @Input()  showActiveInactive: boolean;
  @Input()  formValue       : any;
  @Output() selectionChange       = new EventEmitter();
  @Output() selectionChangeValue = new EventEmitter();
  inputField: FormControl;

  itemList: any[];
  constructor() { }

  ngOnInit(): void {
    const i = 0
    if (this.searchForm) {
      this.inputField = this.searchForm.controls[this.formFieldName] as FormControl;
    }
  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    // if (this.list) {
    //   this.itemList = this.list // this.list.map( ({ name, id, active }) =>   ({name: name, id: id,active: active })  );
    //   this.setSelectValue()
    //   return
    // }
    if (this.list) { 
      this.itemList = this.list;
      this.setSelectValue()
      return;
    }
    if (!this.list$) { return }
    this.list$.subscribe(data => {
      this.itemList = data.map( ({ name, id, active }) =>   ({name: name, id: id,active: active })  );
      this.setSelectValue()
    })

  }
  setSelectValue() {
    if (this.formValue) {
      if (this.searchForm) {
        const item =   JSON.parse(JSON.stringify(this.formValue))
        this.searchForm.controls[this.formFieldName].setValue(this.formValue);
        console.log('set form value', this.formValue)
      }
    }
  }

  updateResults(event) {
    this.selectionChange.emit(event.value.id)
    this.updateResultsValue(event)
  }

  updateResultsValue(event) {
    this.selectionChangeValue.emit(event.value)
    this.formValue = event.value;
  }
}

