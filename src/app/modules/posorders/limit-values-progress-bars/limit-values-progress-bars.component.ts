import { Component, OnInit, Input, OnChanges} from '@angular/core';
import { IPOSOrder, }  from 'src/app/_interfaces/transactions/posorder';
import { ActivatedRoute, } from '@angular/router';
import { clientType, Last30DaysSales } from 'src/app/_interfaces';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { Observable, of, switchMap } from 'rxjs';
import { ContactsService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';

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


  gramRatio: number;
  extractRatio: number;
  liquidCountRatio: number;
  seedCountRatio: number;
  concentrateCountRatio: number;
  last30Days$ : Observable<Last30DaysSales>;


  constructor(
    private contactService: ContactsService,
    private siteService: SitesService,
    public route: ActivatedRoute,) {
    const outPut = this.route.snapshot.paramMap.get('mainPanel');
    if (outPut) {
      this.mainPanel = true
    }
  }

  ngOnInit(): void {
    const i  =0
    this.getLast30DayRatio();

  }

  getLast30DayRatio() {
    // console.log('dramatic')
    if (this.order &&
      this.order.clients_POSOrders &&
      this.order.clients_POSOrders.client_Type &&
       ( this.order.clients_POSOrders.client_Type.name.toLowerCase() === 'patient' ||
         this.order.clients_POSOrders.client_Type.name.toLowerCase() === 'caregiver'
        )
      ) {
      // console.log('azula')
       const customLimit = this.order.clients_POSOrders.medGramLimit;
       const standardLimit = this.order.clients_POSOrders.client_Type.limitGram;

       let currentLimit: number;
       currentLimit = standardLimit
       if (!customLimit || customLimit == 0) {
        currentLimit = customLimit
       }

       const site = this.siteService.getAssignedSite()
       this.last30Days$ = this.contactService.last30DayValues(site, this.order.clientID).pipe(
        switchMap(data => {
         if (!data || !data.gramTotal) return of(null)
         data.thirtyDayProgress  = ((data.gramTotal / standardLimit ) * 100)
         return of(data)
       }))
   }
  }

  ngOnChanges() {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.refreshLimitProgress(this.order)
  }
  validateType(order:IPOSOrder): clientType {
    if (order) {
      if (order.clients_POSOrders) {
        if (order.clients_POSOrders.client_Type) {
          const type =order.clients_POSOrders.client_Type
          return type
        }
      }
    }
    return null
  }


  refreshLimitProgress(order: IPOSOrder) {
    let gramRatio = 28;
    let concentrateCountRatio = 28;
    let extractRatio = 28;
    let seedCountRatio = 28;
    let liquidCountRatio = 28;
    let plantCountratio = 28
    if (order) {
      const type = this.validateType(order)
      if (type) {
        const order = this.order
        gramRatio = type.limitGram;
        concentrateCountRatio = type.limitConcentrate
        extractRatio = type.limitExtract;
        seedCountRatio = type.limitSeeds;
        liquidCountRatio = type.limitLiquid;
        plantCountratio = 28
        const  client = this.order.clients_POSOrders;

        if (client && client.client_Type) {

          // console.log('client.mEDGramLimit', client);
          // console.log('medGramLimit', client.medGramLimit, client.medGramLimit && client.medGramLimit != 0);
          // console.log('isPatient', client.client_Type.name.toLowerCase() === 'patient')

          if (client.client_Type.name.toLowerCase() === 'patient' ||
              client.client_Type.name.toLowerCase() === 'caregiver' ) {

            if (client.medGramLimit && client.medGramLimit != 0){
              gramRatio = client.medGramLimit
            }

            if (client.medConcentrateLimit && client.medConcentrateLimit != 0){
              concentrateCountRatio = client.medConcentrateLimit
            }

            if (client.medPlantLimit && client.medPlantLimit != 0){
              plantCountratio = client.medPlantLimit
            }

            if (client.medConcentrateLimit && client.medConcentrateLimit != 0){
              concentrateCountRatio = client.medConcentrateLimit
            }

          }
        }
      }

      if (order?.gramCount != 0) {
        this.gramCountProgress         = ((order.gramCount / gramRatio ) * 100).toFixed(0)
      }
      if (order.seedCount != 0){
        this.seedCountProgress         = ((order.seedCount / seedCountRatio  ) * 100).toFixed(0)
      }
      if (order.concentrateCount != 0) {
        this.concentrateCountProgress  = ((order.concentrateCount / concentrateCountRatio ) * 100).toFixed(0)
      }
      if (order.extractCount != 0) {
        this.extractCountProgress      = ((order.extractCount / extractRatio ) * 100).toFixed(0)
      }
      if (order.liquidCount  != 0) {
        this.liquidCountProgress       = ((order.liquidCount / liquidCountRatio ) * 100).toFixed(0)
      }
      this.gramRatio = gramRatio;
      this.extractRatio = extractRatio//: number;
      this.liquidCountRatio = liquidCountRatio//: number;
      this.seedCountRatio = seedCountRatio//: number;
      this.concentrateCountRatio  = this.concentrateCountProgress //: number;
      console.log('end value gramRatio', gramRatio)
    }
  }



}
