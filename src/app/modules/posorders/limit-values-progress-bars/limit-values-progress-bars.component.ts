import { Component, OnInit, Input, OnChanges} from '@angular/core';
import { IPOSOrder, }  from 'src/app/_interfaces/transactions/posorder';
import { ActivatedRoute, } from '@angular/router';
import { clientType, Last30DaysSales } from 'src/app/_interfaces';
import { Observable, of, switchMap } from 'rxjs';
import { ContactsService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ProgressBarComponent } from 'src/app/shared/widgets/progress-bar/progress-bar.component';
@Component({

  selector: 'limit-values-progress-bars',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    ProgressBarComponent,
  ],
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
  combinedCateogryProgress : any;
  metrcGroup1Progress: number =0;
  metrcGroup2Progress: number =0;

  gramRatio: number;
  extractRatio: number;
  liquidCountRatio: number;
  seedCountRatio: number;
  concentrateCountRatio: number;
  solidCountRatio: number;
  combinedCategoryRatio: number;
  metrcGroup1Ratio: number;
  metrcGroup2Ratio: number;

  last30Days$ : Observable<Last30DaysSales>;
  clientTypeName: string;
  clientType$: Observable<clientType>;
  clientType: clientType;

  constructor(
    private contactService: ContactsService,
    private clientTypeService: ClientTypeService,
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
    // this.clientType$ = this.getClientType();
  }

  getLast30DayRatio() {
    if (this.order &&
      this.order.clients_POSOrders &&
      this.order.clients_POSOrders.client_Type &&
       ( this.order.clients_POSOrders.client_Type.name.toLowerCase() === 'patient' ||
         this.order.clients_POSOrders.client_Type.name.toLowerCase() === 'caregiver' )
       ) {
       const customLimit = this.order.clients_POSOrders?.medGramLimit;
       const standardLimit = this.order.clients_POSOrders.client_Type?.limitGram;
       let currentLimit: number;
       currentLimit = standardLimit
       if (!customLimit || customLimit == 0) { currentLimit = customLimit }
       const site = this.siteService.getAssignedSite()
       this.last30Days$ = this.contactService.last30DayValues(site, this.order?.clientID).pipe(
        switchMap(data => {
          if (!data || !data.gramTotal) return of(null)
          data.thirtyDayProgress  = ((data.gramTotal / standardLimit ) * 100)
          return of(data)
       })
      )
    }
  }

  ngOnChanges() {
    this.clientType$ = this.getClientType()
  }

  getClientType() {
    const site = this.siteService.getAssignedSite();
    if (this.order && this.order.clients_POSOrders && this.order.clients_POSOrders.client_Type) {
      return of(this.order.clients_POSOrders.client_Type).pipe(switchMap(data => {
        this.clientType = data;
        this.refreshLimitProgress(this.order);
        return of(data)
      }));
    }

    if (this.clientType?.name === 'Consumer') {
      return of(this.clientType);
    }

    return this.clientTypeService.getClientTypeByNameCached(site, 'consumer').pipe(switchMap(data => {
      this.clientType = data;
      this.refreshLimitProgress(this.order);
      return of(data);
    }));
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

    let type = {} as clientType;

    let gramRatio = 28;
    let concentrateCountRatio = 1;
    let extractRatio = 1;
    let seedCountRatio = 1;
    let liquidCountRatio = 1;
    let plantCountratio = 1
    let combinedCateogryRatio = 1;
    let solidCountRatio = 1;
    let metrcGroup1Ratio = 1;
    let metrcGroup2Ratio = 1

    if (this.clientType) {
      const type = this.clientType;
      gramRatio = type?.limitGram | 56;
      concentrateCountRatio = type?.limitConcentrate;
      extractRatio = type?.limitExtract;
      seedCountRatio = type?.limitSeeds;
      liquidCountRatio = type?.limitLiquid;
      plantCountratio = type?.limitPlants
      combinedCateogryRatio = type?.limitCombinedCategory;
      solidCountRatio = type?.limitSolid ;
      metrcGroup1Ratio = type?.metrcGroup1;
      metrcGroup2Ratio = type?.metrcGroup2;
    }

    if (order) {
      const type = this.validateType(order)
      if (type) {
        console.log('type', type)
        const order           = this.order
        gramRatio             = type?.limitGram;
        concentrateCountRatio = type?.limitConcentrate
        extractRatio          = type?.limitExtract;
        seedCountRatio        = type?.limitSeeds;
        liquidCountRatio      = type?.limitLiquid;
        solidCountRatio       = type?.limitSolid;
        plantCountratio       = 28
        combinedCateogryRatio = type?.limitCombinedCategory | 5;
        metrcGroup1Ratio      = type?.metrcGroup1;
        metrcGroup2Ratio      = type?.metrcGroup2;

        const  client         = this.order?.clients_POSOrders;

        if (client && client.client_Type) {

          console.log('type', client.client_Type)

          if (client.client_Type.name.toLowerCase() === 'patient' ||
              client.client_Type.name.toLowerCase() === 'caregiver' ) {

            if (client.metrcGroup1 && client.metrcGroup1 != 0){
              metrcGroup1Ratio =   client.metrcGroup1
            }

            if (client.metrcGroup2 && client.metrcGroup2 != 0){
              metrcGroup2Ratio =   client.metrcGroup2
            }

            if (client.medGramLimit && client.medGramLimit != 0){
              gramRatio = client.medGramLimit
            }

            if (client.medConcentrateLimit && client.medConcentrateLimit != 0){
              concentrateCountRatio = client.medConcentrateLimit
            }

            if (client.medPlantLimit && client.medPlantLimit != 0){
              plantCountratio =   client.medPlantLimit
            }

            if (client.combinedCategoryLimit && client.combinedCategoryLimit != 0){
              combinedCateogryRatio = client.combinedCategoryLimit
            }

            if (client.solidCountLimit && client.solidCountLimit != 0){
              solidCountRatio =  client.solidCountLimit
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
        this.concentrateCountProgress  = ((order.concentrateCount / concentrateCountRatio ) * 100 ).toFixed(0)
      }
      if (order.extractCount != 0) {
        this.extractCountProgress      = ((order.extractCount / extractRatio ) * 100).toFixed(0)
      }
      if (order.liquidCount  != 0) {
        this.liquidCountProgress       = ((order.liquidCount / liquidCountRatio ) * 100).toFixed(0)
      }
      if (order.combinedCategory  != 0) {
        this.combinedCateogryProgress       = ((order.combinedCategory / combinedCateogryRatio ) * 100).toFixed(0)
      }
      if (order.solidCount  != 0) {
        this.solidCountProgress       = ((order.solidCount / solidCountRatio ) * 100).toFixed(0)
      }
      if (order.metrcGroup1  != 0 && metrcGroup1Ratio != 0) {
        this.metrcGroup1Progress       = +((order.metrcGroup1 / metrcGroup1Ratio ) * 100).toFixed(0)
      }
      if (order.metrcGroup2  != 0 && metrcGroup2Ratio != 0) {
        this.metrcGroup2Progress       = +((order.metrcGroup2 / metrcGroup2Ratio ) * 100).toFixed(0)
      }

      this.metrcGroup1Ratio = metrcGroup1Ratio;
      this.metrcGroup2Ratio = metrcGroup2Ratio;
      this.combinedCategoryRatio = combinedCateogryRatio;
      this.gramRatio = gramRatio;
      this.solidCountRatio = solidCountRatio;
      this.extractRatio = extractRatio;//: number;
      this.liquidCountRatio = liquidCountRatio;//: number;
      this.seedCountRatio = seedCountRatio;//: number;
      this.concentrateCountRatio = concentrateCountRatio;

    }
  }



}
