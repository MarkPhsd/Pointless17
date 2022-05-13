import { Injectable } from '@angular/core';
import { IInventoryAssignment } from '../inventory/inventory-assignment.service';
import { faker } from '@faker-js/faker';

@Injectable({
  providedIn: 'root'
})
export class FakeInventoryService {

  constructor() { }

  getRecords(count: number) { 
    const items = [] as IInventoryAssignment[];
    for (var i = 1; i < count; i +=1){
       const item = this.addInventoryItem();
       items.push(item)
    }
    return items
  }

  addInventoryItem(): IInventoryAssignment {
    const item = {} as IInventoryAssignment;
    item.baseQuantity = +faker.random.numeric(3);
    item.baseQuantityRemaining =    item.baseQuantity  * 75
    item.batchDate = faker.date.future().toDateString();
    item.thc = +faker.random.numeric(2)/100
    item.cbd = +faker.random.numeric(2)/100
    item.thca = +faker.random.numeric(2)/100
    item.thc2 = +faker.random.numeric(2)/100
    item.cbd = +faker.random.numeric(2)/100
    item.cbd2 = +faker.random.numeric(2)/100
    item.dateCreated = faker.date.future().toDateString();
    item.price  = +faker.random.numeric(2)/100
    item.cost =    item.price * .3;
    item.productName =  faker.animal.bird();
    item.sku = faker.random.alphaNumeric(10)
    item.unitMulitplier  = 1;
    item.unitOfMeasureName = "gram";

    item.manifestID             = 0
    item.packageType            = ''
    item.productCategoryName    = ''
    item.itemStrainName         =  item.productName
    item.label                  =  faker.random.alphaNumeric(10)
    item.metrcPackageID         = 0
    item.locationID             = 1
    item.location               = 'Retail'
    item.packageQuantity        = 0
    item.productID              = 0
    item.packageCountRemaining  = 0
    item.expiration             = faker.date.future().toDateString();
    item.facilityLicenseNumber  = ''
    item.notAvalibleForSale     = false;
    item.employeeID             = 0
    item.employeeName           = faker.name.firstName();
    item.requiresAttention      = false;
    item.jointWeight            = 0
    item.beginDate              = faker.date.future(1).toDateString();
    item.endDate                = faker.date.future(2).toDateString();
    item.intakeUOM              = 'GRAM'
    item.intakeConversionValue  = 0
    item.adjustmentType         = ''
    item.adjustmentDate         = ''
    item.adjustmentNote         = ''
    item.invoice                = faker.random.alphaNumeric(10)
    item.packagedOrBulk         = 0
    item.priceScheduleID        = 0
    item.invoiceCode            = ''
    item.thcContent             = 0
    item.productionBatchNumber  = ''
    item.sourceSiteID          = 0
    item.sourceSiteURL         = ''
    item.sourceSiteName        = ''
    item.destinationSiteID     = 0
    item.destinationSiteURL    = ''
    item.destinationSiteName   = ''
    item.rejected              = ''
  
    return item
  }
}
