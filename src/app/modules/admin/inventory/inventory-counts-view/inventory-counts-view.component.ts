import { Component, OnInit, Input, Output, SimpleChanges, OnChanges, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { AvalibleInventoryResults, IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'inventory-counts-view',
  templateUrl: './inventory-counts-view.component.html',
  styleUrls: ['./inventory-counts-view.component.scss']
})
export class InventoryCountsViewComponent implements OnInit {

  @Input() productID: number;
  @Input() active   = true;
  @Input() showAddButton: boolean;
  @Input() showList = true;

  @Output() outPutAddItem :   EventEmitter<IInventoryAssignment> = new EventEmitter();

  results$ : Observable<AvalibleInventoryResults>;
  results : AvalibleInventoryResults;

  constructor(private InventoryAssignmentService: InventoryAssignmentService,
              private siteService: SitesService) { }


  ngOnInit() {
    console.log('invenory count init', this.productID, this.active)
    const site = this.siteService.getAssignedSite();
    if (this.productID && this.active) {
      this.results$ = this.InventoryAssignmentService.getAvalibleInventory(site,this.productID, this.active)
      this.results$.subscribe(data => {
        this.results = data;
      })
    }
  }

  addItem(){
    if (this.results && this.results.results.length > 0) {
      const item = this.results.results[0]
      this.outPutAddItem.emit(item)
    }
  }

}
