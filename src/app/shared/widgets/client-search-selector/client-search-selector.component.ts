import { Component,  Inject,  Input, Output, OnInit, Optional, ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl} from '@angular/forms';
import { ISite } from 'src/app/_interfaces/site';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Subject, fromEvent } from 'rxjs';
import { ContactsService, IItemBasic } from 'src/app/_services';
import { IUserProfile } from 'src/app/_interfaces';

@Component({
  selector: 'app-client-search-selector',
  templateUrl: './client-search-selector.component.html',
  styleUrls: ['./client-search-selector.component.scss']
})
export class ClientSearchSelectorComponent implements OnInit, AfterViewInit  {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  // @Input()  wideOrderBar      : boolean;
  @Input()  searchForm:       FormGroup;
  @Input()  itemType:         number; //removed default 1
  @Input()  searchField:      FormControl;
  @Input()  searchEntry:      string;

  searchPhrase:               Subject<any> = new Subject();
  item:                       IItemBasic;
  site:                       ISite;

  results$ = this.searchPhrase.pipe(
    debounceTime(150),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
        this.contactsService.getContactBySearch(this.site,  searchPhrase, 1, 50)
    )
  )

  constructor(
    public route: ActivatedRoute,
    private contactsService: ContactsService,
    private fb: FormBuilder,
    private siteService: SitesService,
    )
  {
    this.site = this.siteService.getAssignedSite();
  }

  ngOnInit() {
    this.searchForm = this.fb.group({
      searchEntry: this.searchEntry,
    })
  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement,'keyup')
      .pipe(
          filter(Boolean),
          debounceTime(225),
          distinctUntilChanged(),
          tap((event:KeyboardEvent) => {
            if (this.input.nativeElement) {
              const search  = this.input.nativeElement.value
              this.refreshSearch(search);
            }
          })
      )
    .subscribe();
  }

  refreshSearch(search: any){
    if (search) {this.searchPhrase.next( search )}
  }

  searchItems(name: string) {
    if (name) { this.searchPhrase.next(name); }
  }

  selectItem(item: IUserProfile){
    if (item) { this.itemSelect.emit(item) }
  }

  displayFn(item) {
    if (item) {
      this.selectItem(item)
      this.item = item
      return item.name;
    }
  }

}
