import { Component, EventEmitter, Input, OnInit, Output , OnChanges, ViewChild, TemplateRef} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
@Component({
  selector: 'form-select-list',
  templateUrl: './form-select-list.component.html',
  styleUrls: ['./form-select-list.component.scss']
})
export class FormSelectListComponent implements OnInit , OnChanges{

  @ViewChild('listTypeString') listTypeString: TemplateRef<any>;
  @ViewChild('listTypeColumn') listTypeColumn: TemplateRef<any>;

  @Input()  list            : any[];
  @Input()  list$           : Observable<any[]>;
  @Input()  formFieldName   : string;
  @Input()  searchForm      : UntypedFormGroup;
  @Input()  showActiveInactive: boolean;
  @Input()  formValue       : any;
  @Output() selectionChange       = new EventEmitter();
  @Output() selectionChangeValue = new EventEmitter();

  @Input() stringList : boolean;

  inputField: UntypedFormControl;

  itemList: any[];
  constructor() { }

  ngOnInit(): void {
    const i = 0
    if (this.searchForm) {
      this.inputField = this.searchForm.controls[this.formFieldName] as UntypedFormControl;
    }
  }

  get listType() { 
    if (this.stringList) { 
      return this.listTypeString
    }
    return this.listTypeColumn
  }

  ngOnChanges(): void {
    if (this.list) {
      this.itemList = this.list;
      this.setSelectValue()
      return;
    }
    if (!this.list$) { return }
    this.list$.subscribe(data => {
      if (!data) { return }
      this.itemList = data.map( ({ name, id, active }) =>   ({name: name, id: id,active: active })  );
      this.setSelectValue()
    })

  }

  setSelectValue() {
    if (this.formValue) {
      if (this.searchForm) {
        const item =   JSON.parse(JSON.stringify(this.formValue))
        this.searchForm.controls[this.formFieldName].setValue(this.formValue);
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

