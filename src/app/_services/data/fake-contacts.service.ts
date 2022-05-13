import { Injectable } from '@angular/core';
import { IUserProfile } from 'src/app/_interfaces';
import { faker } from '@faker-js/faker';

@Injectable({
  providedIn: 'root'
})
export class FakeContactsService {

  contacts: IUserProfile[];
  constructor() { }

  getRecords(count: number) { 

    const contacts = [] as IUserProfile[];
    
    for (var i = 1; i < count; i +=1){
       const item = this.addContact();
       contacts.push(item)
    }

    return contacts
  }

  addContact(): IUserProfile {
    const contact = {} as IUserProfile;
    contact.userName = `${faker.name.prefix()} ${contact.lastName} ${contact.firstName}`


    contact.totalPurchases = +faker.random.numeric().toString()
    contact.age = +faker.random.numeric().toString();
 
    contact.firstName = faker.name.firstName();
    contact.lastName  = faker.name.lastName();
    contact.phone     = faker.phone.phoneNumber('501-###-###');
    contact.zip       = faker.address.zipCode() //('501-###-###');
    contact.state     = faker.address.stateAbbr()
    contact.city      = faker.address.cityName()
    contact.address   = faker.address.streetAddress()
    contact.email     = `${contact.userName}@pointlesspos.com`
    contact.notes     = 'notes'
    contact.loyaltyPoints         = +faker.random.numeric(10)
    contact.loyaltyPurchaseCount  = +faker.random.numeric(10)
    contact.clientUUID            = '0';
    contact.uid                   = '0';
    contact.clientTypeID          = 1;
    contact.totalPurchases        = +faker.random.numeric(10)
    contact.initialDate           = faker.date.past(+faker.random.numeric(1)).toLocaleDateString();
    contact.lastAccessedDate      = faker.date.past(+faker.random.numeric(1)).toLocaleDateString();
    contact.company               = faker.company.companyName()
    contact.accountNumber         = faker.random.alphaNumeric(10)
    contact.userName              = faker.name.firstName() + '@pointlesspos.com';
    contact.cellPhone             = faker.phone.phoneNumber('501-###-###');
   
    contact.roles                  = 'user';
    contact.onlineDescription      = 'description';
    contact.onlineDescriptionImage = 'image name.jpg';;
    contact.onlineDescriptionTag  = 'meta tag, meta tag 2';;
    contact.dob                   = faker.date.past(+faker.random.numeric(35)).toLocaleDateString();

    let gender = 1
    if (faker.name.gender(faker.random.boolean())) {
      gender = 2
    }
    contact.gender                = gender

    contact.followUpdateDate           = faker.date.future(+faker.random.numeric(1)).toLocaleDateString();

    contact.statusname                = 'active'
    contact.lasModifiedDate           = faker.date.past (+faker.random.numeric(1)).toLocaleDateString();
    contact.employeeID                
    contact.loyaltyPointValue =         +faker.random.alphaNumeric(10)
    contact.careGiverCode =             'careGiverCode';
    contact.contact       = contact.firstName 
    contact.taxSales  =                  0;
    contact.priceColumn =               0;
    contact.defaultPercentageDiscount = 0;
    contact.openOrderCount =            0;
    contact.age            =            21;
    contact.metrcKey       =            'key';
    contact.metrcUser      =            'iser';
    contact.dlNumber       =            'string';
    contact.accountDisabled        =    false;
    contact.accountLocked  =            false;
    contact.medTempLicense =    'license';
    contact.medPhysicianApproved  =     false;
    contact.medLicenseNumber =          'license';
    contact.medPlantLimit =             10;
    contact.medGramLimit =              28;
    contact.medPrescriptionExpiration  ='01/01/2030';
    contact.medConcentrateLimit        =  '25';
    contact.patientRecOption           = false;

    return contact
  }
}
