import { AfterViewInit,Component, QueryList, ViewChildren } from '@angular/core';
import { SchemaUpdateResults, SystemService } from 'src/app/_services/system/system.service';
import { forkJoin, Observable } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';

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
    // console.log('')
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


}
