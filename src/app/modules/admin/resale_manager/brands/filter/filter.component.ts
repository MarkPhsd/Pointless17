import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, switchMap, of } from 'rxjs';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BrandClassSearch, BrandsResaleService } from 'src/app/_services/resale/brands-resale.service';
import { ClassClothingSearch, ClassesResaleService } from 'src/app/_services/resale/classes-resale.service';

@Component({
  selector: 'brand-class-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class BrandFilterComponent implements OnInit {

  advanced: boolean = true;
  sortList: boolean = false;
  pageSize: number;
  currentPage: number;
  brandID: number;
  searchForm: FormGroup;
  @Input() pagingForm: FormGroup;
  @Input() parent: string;
  @Input() disableName: boolean;

  search = {} as any; // BrandClassSearch | ClassClothingSearch
  genderList = [{id:0, name:'Male'}, {id:1, name:'Female'}, {id: null, name: 'Any'}]
  departmentsList  : IMenuItem[]
  departments$     : Observable<IMenuItem[]>;
  attributes$: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private classesResaleService: ClassesResaleService,
    private menuService: MenuService,
    private siteService: SitesService,
    private brandsResaleService: BrandsResaleService) { }

  ngOnInit() {
    this.initSearchForm()
    if (this.parent == 'class') {
      this.refreshDepartments()
      this.refreshAttributes()
    }
  }

  refreshAttributes() {
    const site          = this.siteService.getAssignedSite()
    this.departments$   = this.menuService.getListOfDepartmentsAll(site)
  }

  refreshDepartments() {
    const site          = this.siteService.getAssignedSite()
    this.attributes$    = this.classesResaleService.getAttributeList(site)
  }

  initSearchForm() {
    this.searchForm =  this.fb.group({
      name        : [],
      gender      : [],
      departmentID: [],
     })

     this.searchForm.valueChanges.subscribe(data => {
      this.refreshSearch()
     })
  }

  refreshDepartmentChange(event) {
    this.search.pageNumber  =1;
    this.currentPage = 1;
    this.searchForm.controls['departmentID'].setValue(event)
  }

  refreshAttributeChange(event) {
    this.search.pageNumber  = 1;
    this.currentPage = 1;
    this.searchForm.controls['name'].setValue(event)
    this.refreshSearch()
  }

  setBrandID(event) {
    if (event && event.id) {
      this.brandID = event.id
      this.refreshSearch();
    }
  }

  resetSearch() {
    this.brandID = 0;
    this.search.pageNumber  = 1
    this.initSearchModel();
  }

  initSearchModel(): BrandClassSearch {

    if (!this.search) {
      this.search        = {} as BrandClassSearch;
    }

    this.search.attributeDesc = null
    this.search.name = null;
    this.search.department = null;
    this.search.departmentID = null;
    this.search.classValue = 0;
    this.search.brandTypeID = 0;
    if (this.pageSize = 0) { this.pageSize = 25}
    if (this.pageSize = 0) { this.pageSize = 1}
    this.search.pageSize   = this.pageSize
    this.search.pageNumber = 1;

    if (this.parent == 'class') {
      this.classesResaleService.updateSearchModel(this.search )
    }
    if (this.parent == 'brand') {
      this.brandsResaleService.updateSearchModel(this.search )
    }
    return this.search;
  }


  refreshSearch() {
    if (!this.search) {
      this.search        = {} as any;
    }

    this.search.name = '';
    this.search.gender = null;

    if (this.searchForm) {
      this.search.name = this.searchForm.controls['name'].value
      this.search.gender  = this.searchForm.controls['gender'].value
      this.search.departmentID  = this.searchForm.controls['departmentID'].value
    }

    if (!this.pageSize || this.pageSize == 0) { this.pageSize = 25};
    this.search.pageSize   = this.pageSize;
    if (this.search.pageSize == 0 ) { this.search.pageSize = 25};

    this.search.pageNumber = 1

    if (this.parent === 'class') {
      const search = this.search as unknown as ClassClothingSearch
      this.classesResaleService.updateSearchModel( search )
    }

    if (this.parent === 'brand') {
      const search = this.search as unknown as BrandClassSearch
      this.brandsResaleService.updateSearchModel( this.search )
    }

    return this.search;
  }
}
