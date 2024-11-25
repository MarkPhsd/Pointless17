import { Component, ViewChild, ViewChildren, QueryList, ChangeDetectorRef, OnInit, Input, SimpleChange, OnChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ReportingService } from 'src/app/_services';
import { MatLegacyTableDataSource as MatTableDataSource, MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator, LegacyPageEvent as PageEvent} from '@angular/material/legacy-paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { ISalesPayments, ISite }  from 'src/app/_interfaces';
import { Subject,Observable } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-widget-chart-table',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    HighchartsChartModule,
  ],
  templateUrl: './chart-table.component.html',
  styleUrls: ['./chart-table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class ChartTableComponent implements OnInit,OnChanges {

  //onchange notifier
  @Input() notifier: Subject<boolean>

  value: boolean;
  tempVal: boolean;

  //table constructors
  @ViewChild('outerSort', { static: true }) sort: MatSort;
  @ViewChildren('innerSort') innerSort: QueryList<MatSort>;
  @ViewChildren('innerTables') innerTables: QueryList<MatTable<ISalesPayments>>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) paginatorSites: MatPaginator;

  //filters inputs for charts and tables
  @Input() dateFrom: string;
  @Input() dateTo: string;
  @Input() data: any[];
  @Input() sites: ISite[]  = [];

  site: ISite;
  dataSource: MatTableDataSource<ISite>;
  sales: MatTableDataSource<ISalesPayments>;
  salesPayment: ISalesPayments;
  siteName: string|null;

  //instance of highchart
  chartOptions: {};
  chartData: any[];
  chartCategories: any[];
  dataSeriesValues: any[];

  columnsToDisplay = ['Name', 'Status'];
  innerDisplayedColumns = ['dateCompleted', 'amountPaid'];

  expandedElement: ISite | null;

  constructor( private  reportingService: ReportingService,
               private sitesService: SitesService,
               private cd: ChangeDetectorRef ) { }

  ngOnInit(): void {

    this.sitesService.getSites().subscribe(
      data => this.dataSource = new MatTableDataSource<ISite>(data)  );

    this.notifier.subscribe(data => this.value = data);

    if (this.value === !this.tempVal) {
      this.tempVal = this.value
    }

    this.refreshTable();

  };

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.refreshTable();
  }

  refreshSites(){
    {
      this.sitesService.getSites().subscribe(data =>
        {
          this.sites = data
          for (let site of this.sites) {

            this.reportingService.getSiteStatus(site).subscribe(
              values => {
                          site.status = "ok"
                      },
              error => {
                  site.status = error
                }
              )
            }
          }
        )
        //we need to get the sites.
        this.dataSource = new MatTableDataSource<ISite>(this.sites);
        this.dataSource.paginator = this.paginatorSites
    }
  }

  refreshTable(): void {
    this.dateFrom  = this.reportingService.dateFrom
    this.dateTo = this.reportingService.dateTo
    // this.updateTableSites(this.dateFrom,this.dateTo)
  };

  toggleRow(element: ISite) {
    this.reportingService.getSales(element, this.dateFrom,this.dateTo, "Date").subscribe(
      sales => {
        this.sales = new MatTableDataSource<ISalesPayments>(sales)
        this.sales.paginator = this.paginator
        this.siteName =  element.name
      }
    )
  }

  updateTableSites(dateFrom: string, dateTo: string) {
    //loop the sites, add the series data to the second column of the array.
    this.sitesService.getSites().subscribe(data =>
      {
        this.sites  = data
        for (let site of this.sites) {
          this.reportingService.getSales(site, dateFrom, dateTo, "Date").subscribe(
              sales => {
                this.sales = new MatTableDataSource<ISalesPayments>(sales)
                this.sales.paginator = this.paginator
              }
            )
            .unsubscribe
          }
      }
    ).unsubscribe
  }

}
