import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

@Component({
  selector: 'form-select-list',
  templateUrl: './form-select-list.component.html',
  styleUrls: ['./form-select-list.component.scss']
})
export class FormSelectListComponent implements OnInit {

  @Input()  list$           : Observable<any>;
  @Input()  formFieldName   : string;
  @Input()  searchForm      : FormGroup;
  @Input()  showActiveInactive: boolean;
  @Output() selectionChange = new EventEmitter();
  inputField: FormControl;

  constructor() { }

  ngOnInit(): void {

    if (this.searchForm) {
      this.inputField = this.searchForm.controls[this.formFieldName] as FormControl;
    }
  }

  updateResults(event) {
    this.selectionChange.emit(event.value.id)
    console.log(event.value.id)
  }

}

