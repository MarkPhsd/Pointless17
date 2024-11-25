import { Component} from '@angular/core';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx'

// import { Plugins } from '@capacitor/core';
// import 'ionic-zebra-label-printer';
// const { ZebraLabelPrinter } = Plugins;

// import { ZebraLabelPrinterPlugin } from 'ionic-zebra-label-printer';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { NavController, Platform, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

// https://ionicframework.com/docs/native/printer

// http://labelary.com/viewer.html -- editor to create ZPL Files.

// http://labelary.com/service.html
// https://www.neodynamic.com/products/zpl-printer-emulator-sdk/download/
// http://www.jcgonzalez.com/img-to-zpl-online
// https://jsfiddle.net/lakerfield/8jtL87n7/4/


//blue tooth printer
//https://levelup.gitconnected.com/how-to-print-on-a-bluetooth-printer-using-your-ionic-application-ceabc45abf75

// https://github.com/katzer/cordova-plugin-printer

// getProductTypeList


// https://stackoverflow.com/questions/45576727/could-i-use-javascripts-window-print-to-print-zpl-to-a-zebra-printer-that-is-hoo

//create zpl commands
//https://www.npmjs.com/package/jszpl


// https://www.zebra.com/us/en/products/software/barcode-printers/link-os/browser-print.html

@Component({
  selector: 'app-label1by8',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './label1by8.component.html',
  styleUrls: ['./label1by8.component.scss'],
})

export class Label1by8Component  {
  // implements OnInit

  constructor(
    private  printer: Printer,
    private  platform: Platform,
      )
  { }

  async print() {

    // this.printer.isAvailable().then((onSuccess: any) => {
    //   let content = this.getZPL(); /// document.getElementById('printer').innerHTML;
    //   let options: PrintOptions = {
    //     name: 'MyDocument',
    //     duplex: true,
    //     orientation: "portrait",
    //     monochrome: true
    //   };
    //     this.printer.print(content, options).then((value: any) => {
    //     console.log('value:', value);
    //   }, (error) => {
    //     console.log('eror:', error);
    //   });
    //   }, (err) => {
    //     console.log('err:', err);
    //   });
    if (this.platform.is('capacitor')) {
      console.log('platform is cordova, capacitor')
    }

    if (this.platform.is('cordova')) {
      console.log('platform is cordova, capacitor')
    }

    try {

      await this.printer.isAvailable().then( onSuccess => {
        this.printer.print("https://www.google.com").then(onSuccess =>{
        alert("printing done successfully !");})
      })

    } catch (error) {
      console.log(error)
    }


  }


  getZPL(): string {

    const item = {} as  IInventoryAssignment

    item.sku         = 'MTA1234567';
    item.productName = 'Rec The Clear  OG Elite 1G C CEll';
    item.price       = 55.00;
    item.label       = '1A4FFFB303D5721000000112';
    const metrcLabel = `METRC ${item.label}`;

    const zpl = `^XA ^FO 15, 10^BY2 ^A0, 30^BCN,100,Y,N,N ^FD
              ${item.sku}
              ^FS ^CFA,20 ^FO15, 145^FD ^FB345, 6^FD
              ${item.productName}
              ^FS ^CFA,20 ^FO15,190^FD ^FB350, 6^FD
              $ ${item.price}
              ^FS ^CFA,20 ^FO15,235^FD ^FB350, 6^FD
              ${metrcLabel}
              ^FS ^XZ`

      return zpl
  }



}
