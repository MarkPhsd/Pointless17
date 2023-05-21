import { Component,   Input, Output, OnInit, Optional, ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { ActivatedRoute,  } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup,  UntypedFormControl} from '@angular/forms';
import { ISite } from 'src/app/_interfaces/site';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { Subject } from 'rxjs';
import { IItemBasic } from 'src/app/_services';
import { MetrcPackagesService } from 'src/app/_services/metrc/metrc-packages.service';
import { METRCPackage, PackageFilter }  from 'src/app/_interfaces/metrcs/packages';

@Component({
  selector: 'app-package-search-selector',
  templateUrl: './package-search-selector.component.html',
  styleUrls: ['./package-search-selector.component.scss']
})
export class PackageSearchSelectorComponent implements OnInit {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Input()  searchForm:  UntypedFormGroup;
  @Input()  itemType     =1;
  @Output() itemSelect   = new EventEmitter();
  searchField        : UntypedFormControl;

  ProductName        :  string;
  searchFilter       :  Subject<any> = new Subject();
  productSearchModel =  {} as ProductSearchModel;
  item               :  IItemBasic;
  site               :  ISite;
  results$           :  any;

  constructor(
    public route: ActivatedRoute,
    private metrcPackagesService: MetrcPackagesService,
    private fb: UntypedFormBuilder,
    private siteService: SitesService,
    )
  {
    this.getItemType()
  }

  ngOnInit() {
    this.site = this.siteService.getAssignedSite();
    if (this.searchForm){
      this.searchForm = this.fb.group({
        ProductName: '',
      })
    }
  }

  getItemType(): number {
    if ( this.itemType) {this.itemType = 1}
    return this.itemType
  }

  refreshSearch(search: any){
    if (search) {
      this.searchFilter.next( search )
    }
  }

  searchItems(name: string) {
    const packageFilter = {} as PackageFilter;
    packageFilter.productName = name
    packageFilter.label = name
    packageFilter.pageSize = 50
    packageFilter.pageNumber = 1
    this.searchFilter.next(packageFilter);
  }

  selectItem(item: METRCPackage){
    this.itemSelect.emit(item)
  }

  displayFn(item) {
    this.selectItem(item)
    this.item = item
    return item.name;
  }

}
