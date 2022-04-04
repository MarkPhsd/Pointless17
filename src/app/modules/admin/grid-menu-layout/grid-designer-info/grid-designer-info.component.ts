import { Component, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { EventEmitter } from 'stream';
import { GridComponentPropertiesComponent } from '../grid-component-properties/grid-component-properties.component';

@Component({
  selector: 'app-grid-designer-info',
  templateUrl: './grid-designer-info.component.html',
  styleUrls: ['./grid-designer-info.component.scss']
})
export class GridDesignerInfoComponent implements OnInit {

  @Output() outPutSwap = new EventEmitter();
  @Input()  swap : boolean;

  constructor(
    private siteService        : SitesService,
    private dialogRef          : MatDialogRef<GridComponentPropertiesComponent>,
    public layoutService       : GridsterLayoutService,
   ) { }

  ngOnInit(): void {
    const i = 0
  }



}
