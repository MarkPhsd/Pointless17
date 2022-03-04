import { Component, OnInit, Input, OnChanges} from '@angular/core';
import { IPOSOrder, }  from 'src/app/_interfaces/transactions/posorder';
import { ActivatedRoute, } from '@angular/router';
import { clientType } from 'src/app/_interfaces';

@Component({
  selector: 'limit-values-progress-bars',
  templateUrl: './limit-values-progress-bars.component.html',
  styleUrls: ['./limit-values-progress-bars.component.scss']
})
export class LimitValuesProgressBarsComponent implements OnInit,OnChanges {

  @Input() order           : IPOSOrder;
  mainPanel                : boolean;
  gramCountProgress        : any;
  seedCountProgress        : any;
  solidCountProgress       : any;
  concentrateCountProgress : any;
  plantCountProgress       : any;
  extractCountProgress     : any;
  liquidCountProgress      : any;

  constructor(    public route: ActivatedRoute,) {
    const outPut = this.route.snapshot.paramMap.get('mainPanel');
    if (outPut) {
      this.mainPanel = true
    }
  }

  ngOnInit(): void {
    const i  =0
  }

  ngOnChanges() {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.refreshLimitProgress(this.order)
  }
  validateType(order:IPOSOrder): clientType {
    if (this.order) {
      if (this.order.clients_POSOrders) {
        if (this.order.clients_POSOrders.client_Type) {
          const type = this.order.clients_POSOrders.client_Type
          return type
        }
      }
    }
    return null
  }


  refreshLimitProgress(order: IPOSOrder) {
    if (order) {

      const type = this.validateType(order)

      if (!type) {
        const order = this.order
        const gramRatio = 28
        if (order?.gramCount != 0) {
          this.gramCountProgress         = ((order.gramCount / gramRatio ) * 100).toFixed(0)
        }
        if (order?.seedCount != 0){
          this.seedCountProgress         = ((order.seedCount / gramRatio ) * 100).toFixed(0)
        }
        if (order?.concentrateCount != 0) {
          this.concentrateCountProgress  = ((order.concentrateCount / gramRatio ) * 100).toFixed(0)
        }
        if (order?.extractCount != 0) {
          this.extractCountProgress      = ((order.extractCount / gramRatio ) * 100).toFixed(0)
        }
        if (order?.liquidCount  != 0) {
          this.liquidCountProgress       = ((order.liquidCount / gramRatio ) * 100).toFixed(0)
        }
      }

      if (type) {
        const order = this.order
        if (order?.gramCount != 0) {
          this.gramCountProgress         = ((order.gramCount / type.limitGram ) * 100).toFixed(0)
        }
        if (order.seedCount != 0){
          this.seedCountProgress         = ((order.seedCount / type.limitSeeds ) * 100).toFixed(0)
        }
        if (order.concentrateCount != 0) {
          this.concentrateCountProgress  = ((order.concentrateCount / type.limitConcentrate ) * 100).toFixed(0)
        }
        if (order.extractCount != 0) {
          this.extractCountProgress      = ((order.extractCount / type.limitExtract ) * 100).toFixed(0)
        }
        if (order.liquidCount  != 0) {
          this.liquidCountProgress       = ((order.liquidCount / type.limitLiquid ) * 100).toFixed(0)
        }
      }
    }
  }

}
