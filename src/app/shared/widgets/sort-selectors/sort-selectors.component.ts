import { Component, OnInit,Input,Output ,EventEmitter} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subscription } from 'rxjs';
import { IPOSOrderSearchModel, IPaymentSearchModel } from 'src/app/_interfaces';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';

@Component({
  selector: 'app-sort-selectors',
  templateUrl: './sort-selectors.component.html',
  styleUrls: ['./sort-selectors.component.scss']
})
export class SortSelectorsComponent implements OnInit {

  @Output() outPutSort = new EventEmitter()
  @Input() sortByEmployee: boolean;
  @Input() sortByItem: boolean;
  @Input() sortByAmount: boolean;
  @Input() sortByService: boolean;
  @Input() sortByMethod : boolean;
  @Input() searchType: string;

  @Input() productSort : boolean;

  @Input() inputForm: FormGroup;
  @Input() style: string;
  @Input() class: string;

  search: IPOSOrderSearchModel | IPaymentSearchModel;
  _searchModel: Subscription;
  // list = []

  list = ['Employee', 'ServiceType', 'Amount', 'Item']; // Assuming these are your options
  initialList = [...this.list]; // Keep a copy of the initial list for resetting purposes
  ascDesc =  [ 'Ascending', 'Descending']

  setSortList() {

    if (this.productSort) {
      this.list = ['retail', 'barcode', 'department', 'category', 'subcategory', 'type', 'count', 'name' ]
      this.initialList = [...this.list];
      return  this.list
    }

    this.list = []
    if (this.sortByEmployee) {
      this.list.push('Employee')
    }
    if (this.sortByService) {
      this.list.push('ServiceType')
    }
    if (this.sortByAmount) {
      this.list.push('Amount')
    }
    if (this.sortByMethod) {
      this.list.push('Method')
    }
    if (this.sortByItem) {
      this.list.push('Item')
    }

    this.initialList = [...this.list]
    return this.list
  }

  initSearchOrderSubscriber() {
    this._searchModel =  this.orderMethodsService.posSearchModel$.subscribe(data => {
      this.search = data;
    });
  }

  initSearchPaySubscriber() {
    this._searchModel = this.paymentService.searchModel$.subscribe(data => {
      this.search = data;
    })
  }

  constructor(
    private paymentService: POSPaymentService,
    private orderMethodsService: OrderMethodsService,
    private fb: FormBuilder)
    { }

  ngOnInit(): void {
    this.setSortList()
    if (this.searchType === 'order') {
      this.initSearchOrderSubscriber();
    }
    if (this.searchType === 'payment') {
      this.initSearchPaySubscriber()
    }
    this.initForm()
    this.inputForm.valueChanges.subscribe(data =>{
      this.outPutSort.emit(data)
    })
  }

  ngOnDestroy() {
    if (this._searchModel) [this._searchModel.unsubscribe()]
  }

  initForm() {
    this.inputForm  = this.fb.group({
      sort1: [],
      sort1Asc: [],
      sort2: [],
      sort2Asc: [],
      sort3: [],
      sort3Asc: []
    })
  }

  getOptionsForSelector(excludeKey: string): string[] {
    // Dynamically filter options based on selections in other fields
    const selectedValues = Object.values(this.inputForm.value).filter(v => v);
    return this.initialList.filter(option => !selectedValues.includes(option) || this.inputForm.get(excludeKey).value === option);
  }

  reset() {
    this.initForm()
  }
  get optionsForSort1() {
    return this.list;
  }

  get optionsForSort2() {
    // Exclude the selection of sort1
    return this.list.filter(item => item !== this.inputForm.value.sort1);
  }

  get optionsForSort3() {
    // Exclude the selections of sort1 and sort2
    let selections = [this.inputForm.value.sort1, this.inputForm.value.sort2];
    return this.list.filter(item => !selections.includes(item));
  }

}
