import { Component,  Inject,  Input, Output, OnInit, Optional,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { IPriceCategories, IPriceCategoryPaged, PriceCategorySearchModel } from 'src/app/_interfaces/menu/price-categories';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

@Component({
  selector: 'app-price-tiers',
  templateUrl: './price-tiers.component.html',
  styleUrls: ['./price-tiers.component.scss']
})
export class PriceTiersComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
