import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { IProductSearchResults } from 'src/app/_services';

@Component({
  selector: 'search-inventory-input',
  templateUrl: './search-inventory-input.component.html',
  styleUrls: ['./search-inventory-input.component.scss']
})
export class SearchInventoryInputComponent implements OnInit,AfterViewInit {

  itemNameInput: string;
  @Output() outPutMethod   = new EventEmitter();
  @Output() itemSelect     = new EventEmitter();
  @Input()  searchForm:    UntypedFormGroup;
  @Input()  itemNameControl : string;
  
  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;

  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  
  private readonly onDestroy = new Subject<void>();
  // //search with debounce
  searchItems$  : Subject<IProductSearchResults[]> = new Subject();
  
  searchPhrase:      Subject<any> = new Subject();

  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
      {
        this.outPutMethod.emit(searchPhrase)
        return null
      }
    )
  )

  constructor() { }

  ngOnInit() {
    console.log('')
  }

  ngAfterViewInit() {
    if (this.input) {
      fromEvent(this.input.nativeElement,'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(500),
        distinctUntilChanged(),
        tap((event:KeyboardEvent) => {
          const search  = this.input.nativeElement.value
          this.outPutMethod.emit(search)
        })
      ).subscribe();
    }
  }

  selectItem(search){
    if (search) {
      this.outPutMethod.emit(search)
    }
  }

  clearInput() {
    const item =  this.itemName
    item.setValue('')
  }
}
