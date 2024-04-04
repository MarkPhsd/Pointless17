import { Injectable } from '@angular/core';
export interface IToolTips {
  id: number;
  name: string;
  value: string;
}
@Injectable({
  providedIn: 'root'
})
export class LabelingService {

  //  {id:0, name:'', value:''},
 homePageToolTips = [
    {id:0,name:'storeNav', value:'This feature establishes a hierarchy.  Navigation moves from Department, to Category to Subcategory to Items '}
  ] as IToolTips[];

  productFieldTips  = [
    {id:0, name:'perUnitQuantity', value:'Gram Count; Setting this value will be the quantity removed from inventory. Default is 1.'},
    {id:1, name: 'sortValue', value: 'Sorting: Enter a negative value to show at the front.Larger values show up at the end.'},
    {id:2, name: 'materialIcon', value: 'Use material icons from fonts.google.com.'},
    {id:3, name: 'managerRequired', value: 'When this is enabled, the user must be a manager or admin or requires authorization in User types be enabled.'},
  ] as IToolTips[];

  employeeInfo = [
    {id:0, name: 'password', value: 'The password can be used for both Apps and WebBrowser Login. If you do not wish your staff to be able to access your system off premise, only provide them a PIN.'},
    {id:1 , name: 'name', value: 'Username, this is the username for this user to login, with their password or pin code; it can be a name, email, phone. Regular staff should just have their own name as the username.'},
    {id:2 , name: 'type', value: 'You may set features for the type by going back to the employee list, then Authorizations on the right side panel.'},
    {id:3 , name: 'role', value: 'There are only four Roles. They are primary features for the servers APi. Employees should be Admin, Manager,or Employee, all customers will be user or guest.'},
    {id:4 , name: 'termination', value: 'Termination, is the date the employee stopped working. However, you should remove their username, and pin code to disable their acess. You can also disable their account if you press View As User.'},
    {id:5, name: 'pincode', value: 'PIN should be greater than 4 characters, and less than 10. The pin code is used in the Windows App and Android Apps only. This is not the primary password, and can be changed later.'},
  ]
  contactInfo =  [
    {id:0,name:'scanning', value:' Enable to not save customer info on ID Scanning (driver license, id etc.).'},
  ]

  transactionInfo =  [
    {id:0,name:'scanning', value:'Grace value allows a budtender to weigh out more than the specified amount, like 3.56 grams, but charge exactly for 3.5 grams..'},
    {id:1,name:'expo', value:'Name of printer for Windows Expo Printer'},
    {id:2, name:'appyToTable', value:'Not Recommended'},
    {id:3, name:'searchOrderHistory', value:'Searches on dates closed.'},
    {id:4, name:'numberPad', value:'Allows quantity entry prior to scan or button press.'},
    {id:5, name:'splitEntry', value:'This makes split checks easier. Allows servers to select the customer / group they are entering the item to, prior to payment. '},
    {id:6, name:'reward', value:'This is the value of each loyalty point. .05 would be 5 cents, etc. '},
    {id:6, name:'resaleCostRatio', value:'This will help determine the price based on cost you are buying an item for. '},
  ]

  terminalSettingsInfo =  [
    {id:0,name:'scanning', value:'Use this button when physically present at the terminal. This will generate a windows folder with print settings for the label.'},
    {id:2,name:'triPOSMarketCode', value:'Tripos market codes are 4 for Retail, 7 for Food Service.'},
  ]

  profile = [
    {id:0,name:'scanning', value:'Accounts that are disabled can not have new orders added. ' },
    {id:1,name:'scanning', value:'Accounts that are locked are when the account has failed to log in too many times. ' },
    {id:2,name:'scanning', value:'Price level indicates the price column that will be default. This can improve pricing for the customer. '},
  ]

  boltCardPoint =  [
    {id:0,name:'hsn', value:'The ID located on the device, on the screen after the device loads.'},
    {id:1,name:'APIURL', value:'The processor site'},
    {id:2,name:'boltURL', value:'Should be your Comapny Domain'},
    {id:3,name:'MerchantID', value:'Provided by your vendor.'},
    {id:4,name:'MerchantID', value:'Apply the merchant info in the Credit Card Processing Section in the lower expansion ribbon (outisde of this section).'},
  ]

  //  <mat-label></mat-label>

  triPOSCard =  [
    {id:0,name:'hsn', value:'Its recommended you set this feature at the terminal physically. However, you may setup the terminal from any computer provided you have the activation code.'},
  ]

  messagingService = [
    {id:0,name:'balanceZero', value:'Used for templates when the order is paid for.'},
    {id:1,name:'template', value:'Used for communications between customers and staff and staff and staff.'},
    {id:2,name:'types', value:'Types of communications.'},

  ]

  constructor() { }
}
