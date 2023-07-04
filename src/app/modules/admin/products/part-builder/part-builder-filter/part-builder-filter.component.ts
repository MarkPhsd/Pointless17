import { Component, OnInit, Output, EventEmitter, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap } from 'rxjs';

@Component({
  selector: 'part-builder-filter',
  templateUrl: './part-builder-filter.component.html',
  styleUrls: ['./part-builder-filter.component.scss']
})
export class PartBuilderFilterComponent implements OnInit,AfterViewInit {
  @Output() outputRefreshSearch :   EventEmitter<any> = new EventEmitter();
  name: string;

  @ViewChild('input', {static: true}) input: ElementRef;

  value : string;
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  searchForm: UntypedFormGroup;

  constructor(     
    private fb  : UntypedFormBuilder,
    ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
      if (!this.searchForm) { 
        this.initSearchForm()
      }
      if (this.searchForm && this.input) {
        fromEvent(this.input.nativeElement,'keyup')
        .pipe(
          filter(Boolean),
          debounceTime(500),
          distinctUntilChanged(),
          tap((event:KeyboardEvent) => {
            const search  = this.input.nativeElement.value
            this.outputRefreshSearch.emit({name: search})
          })
        ).subscribe();
      }
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      itemName : ['']
    })
  }

}
