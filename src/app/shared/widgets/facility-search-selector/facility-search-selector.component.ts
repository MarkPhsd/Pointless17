import { Component,  Inject,  Input, Output, OnInit, Optional, ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl} from '@angular/forms';
import { ISite } from 'src/app/_interfaces/site';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject, fromEvent } from 'rxjs';
import { MetrcFacilitiesService, IItemFacilitiyBasic } from 'src/app/_services/metrc/metrc-facilities.service';



@Component({
  selector: 'app-facility-search-selector',
  templateUrl: './facility-search-selector.component.html',
  styleUrls: ['./facility-search-selector.component.scss']
})
export class FacilitySearchSelectorComponent implements OnInit, AfterViewInit  {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new               EventEmitter();
  @Input()  searchForm:                     FormGroup;
  @Input()  searchField:                    FormControl;
  @Input()  item:                           IItemFacilitiyBasic;
  searchPhrase:         Subject<any> = new Subject();
  site:                 ISite;

  results$ = this.searchPhrase.pipe(
    debounceTime(250),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
        this.metrcFacilitiesService.getItemsNameBySearch(this.site,  searchPhrase)
    )
  )

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private fb: FormBuilder,
    private siteService: SitesService,
    private metrcFacilitiesService: MetrcFacilitiesService
    )
  {
    this.site = this.siteService.getAssignedSite();
  }

  ngOnInit() {
    // try {
    //   if (this.item) {
    //     this.searchForm = this.fb.group({
    //         facilityLicenseNumber: `${this.item.displayName} ${this.item.metrcLicense}`
    //     })
    //   } else {
    //     this.searchForm = this.fb.group({
    //       facilityLicenseNumber: [''],
    //     })
    //   }
    // } catch (error) {
    //   console.log(error)
    // }
    console.log('')
  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement,'keyup')
            .pipe(
                filter(Boolean),
                debounceTime(500),
                distinctUntilChanged(),
                tap((event:KeyboardEvent) => {
                  const search  = this.input.nativeElement.value
                  this.refreshSearch(search);
                })
            )
          .subscribe();
  }

  refreshSearch(search: any){
    if (search) {
      this.searchPhrase.next( search )
    }
  }

  searchItems(name: string) {
    this.searchPhrase.next(name);
  }

  selectItem(item: IItemFacilitiyBasic){
    this.itemSelect.emit(item)
  }

  displayFn(item: IItemFacilitiyBasic) {
    if (item) {
      this.selectItem(item)
      this.item = item

      if (!item || !item.displayName){

        return ''

      }  else {

        return `${this.item.displayName} ${this.item.metrcLicense}`

      }

    }
  }

}
