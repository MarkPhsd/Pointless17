import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { Observable, interval, of, startWith, switchMap } from 'rxjs';
import { EmployeeClock } from 'src/app/_interfaces/people/employeeClock';
import { EmployeeClockService } from 'src/app/_services/employeeClock/employee-clock.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'employees-on-clock-list',
  standalone: true,
  imports: [
    CommonModule,
    MatLegacyCardModule,
    MatIconModule,
    MatLegacyButtonModule
  ],
  templateUrl: './employees-on-clock-list.component.html',
  styleUrls: ['./employees-on-clock-list.component.scss']
})
export class EmployeesOnClockListComponent implements OnInit{

  clocks = [] as EmployeeClock[];
  clocks$ = this.employeeClocksService.listEmployeesOnClock(this.siteService.getAssignedSite())

  constructor( public employeeClocksService : EmployeeClockService,
                private siteService: SitesService,
  ) {
    this.refreshManual();
  }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    const site                = this.siteService.getAssignedSite()
    this.clocks$ = interval(60000).pipe(
      startWith(0), // 60000 milliseconds = 60 seconds
      switchMap(() => this.employeeClocksService.listEmployeesOnClock(site).pipe(switchMap(data => {
        return of(data)
      })))
    );
    // this.clocks$ = interval(60000).pipe( // 60000 milliseconds = 60 seconds
    // startWith(0), // Emit an initial value immediately
    // switchMap(() => this.employeeClocksService.listEmployeesOnClock(site))
    //   );
    // }
  }




  refreshManual() {
    const site                = this.siteService.getAssignedSite()
    this.clocks$  = this.employeeClocksService.listEmployeesOnClock(site)
  }

  // initGridColumns() {
  //   this.frameworkComponents = { btnCellRenderer: ButtonRendererComponent  };
  //   this.defaultColDef = { flex: 2, };
  //   this.columnDefs = [];

  //   let item
  //   const site = this.siteService.getAssignedSite();

  //   item =   {headerName: 'Employee',     field: 'employeeName', sortable: true,
  //     width   : 150,
  //     minWidth: 150,
  //     maxWidth: 150,
  //     flex    : 2,
  //   } as any
  //   this.columnDefs.push(item);

  //   item =   {headerName: 'Login',     field: 'logInTime', sortable: true,
  //       cellRenderer: this.agGridService.dateCellRendererUSD,
  //       width   : 220,
  //       minWidth: 220,
  //       maxWidth: 220,
  //       flex    : 2,
  //   } as any
  //   this.columnDefs.push(item);

  // }

  onFirstDataRendered (params) {
    try {
      // params.api.sizeColumnsToFit()
      window.setTimeout(() => {
        // if (params.columnApi.getAllColumns()) {
        //   const colIds = params.columnApi.getAllColumns().map(c => c.colId)
        //   params.columnApi.autoSizeColumns(colIds)
        // // }
      }, 50)
      } catch (error) {
      console.log(error)
    }
  }

  // autoSizeAll(skipHeader) {
  //   try {
  //     var allColumnIds = [];
  //     this.gridOptions.columnApi.getAllColumns().forEach(function (column) {
  //       allColumnIds.push(column.colId);
  //     });
  //     this.gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  //ag-grid standard method
  // async onGridReady(params: any) {

  //   if (params)  {
  //     this.params  = params
  //     this.gridApi = params.api;
  //     params.api.sizeColumnsToFit();
  //     this.autoSizeAll(false)
  //   }

  //   this.onFirstDataRendered(this.params)
  //   if (!params.startRow ||  !params.endRow) {
  //     params.startRow = 1
  //     params.endRow = this.pageSize;
  //   }

  //   params.startRow = 1;
  //   params.endRow = 500;
  //   let datasource =  {
  //     getRows: (params: IGetRowsParams) => {
  //     const items$ =  this.getRowData(params, params.startRow, params.endRow)
  //     items$.subscribe(data =>
  //       {
  //           if (data) {
  //             params.successCallback(data)
  //             this.rowData = data
  //           }
  //         }
  //       );
  //     }
  //   };

  //   this.gridAPI.setDatasource(datasource);
  //   this.autoSizeAll(true)
  // }

  refreshImages(any) {}

  getRowData(params, startRow: number, endRow: number):  Observable<EmployeeClock[]>  {
    const site                = this.siteService.getAssignedSite()
    return this.employeeClocksService.listEmployeesOnClock(site)
  }

}
