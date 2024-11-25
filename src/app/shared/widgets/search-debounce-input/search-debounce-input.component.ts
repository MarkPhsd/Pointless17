import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldControl, MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { IProductSearchResults } from 'src/app/_services';

@Component({
  selector: 'search-debounce-input',
  standalone:true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,
          MatLegacyButtonModule,MatIconModule,
          MatLegacyFormFieldModule,MatLegacyInputModule],
  templateUrl: './search-debounce-input.component.html',
  styleUrls: ['./search-debounce-input.component.scss']
})
export class SearchDebounceInputComponent implements AfterViewInit,OnInit {

  @ViewChild('searchFormView') searchFormView: TemplateRef<any>;
  @ViewChild('input', {static: true}) input: ElementRef;
  get itemName() { return this.searchForm.get(this.itemNameControl) as FormControl;}

  @Input()  itemNameInput: string;
  @Output() outPutMethod   = new EventEmitter();
  @Output() itemSelect     = new EventEmitter();
  @Input()  searchForm:    FormGroup;
  @Input()  itemNameControl : string;

  searchPhrase:      Subject<any> = new Subject();

  private readonly onDestroy = new Subject<void>();
  // //search with debounce
  searchItems$  : Subject<IProductSearchResults[]> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
      {
        this.outPutMethod.emit(searchPhrase)
        return searchPhrase
      }
    )
  )

  constructor() { }

  ngOnInit(): void {
    if (!this.itemNameControl) { this.itemNameControl = 'itemName'}
  }

  ngAfterViewInit() {
    // try {
      if (!this.searchForm) { console.log('something') }

      if (this.searchForm) {
        // console.log('seach form exists')
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

  get isSearchFormOn() {
    if (this.searchForm)  {
      return this.searchFormView
    }
    return null;
  }

  selectItem(search){
    if (search) {
      this.outPutMethod.emit(search)
    }
  }

  clearInput() {
    this.outPutMethod.emit('')
    const item =  this.itemName
    if (!item) {return}
    item.setValue('')
  }

}
