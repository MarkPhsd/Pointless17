import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SchemaUpdateResults, SystemService } from 'src/app/_services/system/system.service';
import { forkJoin, Observable } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormBuilder } from '@angular/forms';
import { FbSettingsService } from 'src/app/_form-builder/fb-settings.service';

@Component({
  selector: 'app-database-schema',
  templateUrl: './database-schema.component.html',
  styleUrls: ['./database-schema.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabaseSchemaComponent implements AfterViewInit {

  updateSections = ['GetSyncDatabaseSchema', 'CreateAPIViews', 'CreateViews', 'CreateTablesA', 'CreateTablesB', 'createAPIReportviews']
  schemaResults : any[] ;
  schema$:              Observable<SchemaUpdateResults[]>;
  schema:               SchemaUpdateResults[];
  completed:            string;
  @ViewChildren('allTheseThings') things: QueryList<any>;

  processingVisible :    boolean;
  databaseMessage   :    string;

  constructor(
              private systemService:     SystemService,
              private sitesService:      SitesService,
             )
  {
    console.log('')
  }

  async  ngAfterViewInit() {
    this.things.changes.subscribe(t => {
      this.ngForRendred();
    })
  }


  ngForRendred() {
    this.processingVisible   =  false
    if (this.schema){
      this.databaseMessage   = `Database updated,  ${this.schema[0].errorCount} errors.`
    }
  }

  updateSchema() {
    this.processingVisible = true
    try {
      const site = this.sitesService.getAssignedSite();
      this.schema$ = this.systemService.getSyncDatabaseSchema(site)
      this.schema$.subscribe(data=> {
        this.schema = data
        this.processingVisible   =  false
      })
    } catch (error) {
      console.log(error)
    }

  }

  updateSchemArray() {
    this.processingVisible = true
    const site = this.sitesService.getAssignedSite();
    let observables  = this.updateSections.map( section =>  this.systemService.updateDatabase(site, section) )

    let source = forkJoin(observables);

    source.subscribe(data => {
      console.log(data)
      this.schemaResults.push(data)
    });

  }

  //   let carNumbers = [1, 2, 3];
  // let observables = carNumbers.map(carNumber => this.carService.getCarByNumerator(carNumber));

  // // forkJoin the array/collection of observables
  // let source = Rx.Observable.forkJoin(observables);

  // // subscribe and sort combined array/collection prior to additional processing
  // source.subscribe(x => console.log(x.sort((a, b) => a - b));

}
