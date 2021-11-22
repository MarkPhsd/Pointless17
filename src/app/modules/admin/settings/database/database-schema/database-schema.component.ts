import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SchemaUpdateResults, SystemService } from 'src/app/_services/system/system.service';
import { Observable } from 'rxjs';
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
      })
    } catch (error) {
      console.log(error)
    }

  }



}
