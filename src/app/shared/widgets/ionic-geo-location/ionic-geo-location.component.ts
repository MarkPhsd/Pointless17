import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
// import { Plugins } from '@capacitor/core';
// import { Geolocation} from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
// const {  Geolocation } = Plugins;
import { google } from "google-maps";

// https://positionstack.com/product
// https://developer.here.com/pricing#plan-details

@Component({
  selector: 'app-ionic-geo-location',
  standalone: true,
  imports: [CommonModule,MatDividerModule,MatLegacyButtonModule],
  templateUrl: './ionic-geo-location.component.html',
  styleUrls: ['./ionic-geo-location.component.scss']
})

export class IonicGeoLocationComponent {

  //https://github.com/capacitor-community/background-geolocation
  // https://ionicframework.com/docs/native/geolocation
  // https://www.positronx.io/ionic-cordova-geolocation-and-geocoder-tutorial-with-examples/

  // https://developers.google.com/maps/documentation/geocoding/overview
  // https://developer.android.com/training/maps?


  // https://enappd.com/blog/use-geolocation-geocoding-and-reverse-geocoding-in-ionic-capacitor/131/

  // https://www.positronx.io/ionic-cordova-geolocation-and-geocoder-tutorial-with-examples/

  // https://github.com/capacitor-community/background-geolocation

  latitude: number;
  longitude: number;
  currentCoordinates : any;
  result:   string;
  constructor() {

  }


  async getCurrentPosition() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      this.currentCoordinates = coordinates;
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
      console.log('position', coordinates)
      this.initMap(this.latitude, this.longitude )
    } catch (error) {
      console.log(error)
      this.result  = error
    }
  }

  watchPosition() {
    const wait = Geolocation.watchPosition({}, (position, err) => {
    })
  }

  initMap(lat: number, long: number): void {

    const map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        zoom: 8,
        center: { lat: lat, lng: long },
      }
    );

    try {
      const geocoder = new google.maps.Geocoder();
      const infowindow = new google.maps.InfoWindow();
      this.geocodeLatLng(geocoder, map, infowindow);
    } catch (error) {
      console.log(error)
      this.result = error
    }

  }

  geocodeLatLng(
    geocoder: google.maps.Geocoder,
    map: google.maps.Map,
    infowindow: google.maps.InfoWindow
    )
    {
      const input = (document.getElementById("latlng") as HTMLInputElement).value;
      const latlngStr = input.split(",", 2);
      const latlng = {
      lat: parseFloat(this.latitude.toString()), // parseFloat(latlngStr[0]),
      lng: parseFloat(this.longitude.toString()), // parseFloat(latlngStr[1]),

    };

    geocoder.geocode( { location: latlng },
        (
          results: google.maps.GeocoderResult[],
          status:  google.maps.GeocoderStatus
        ) => {
          if (status === "OK") {
            if (results[0]) {
              map.setZoom(11);
              const marker = new google.maps.Marker({
                position: latlng,
                map: map,
              });
              infowindow.setContent(results[0].formatted_address);
              infowindow.open(map, marker);
            } else {
              window.alert("No results found");
              this.result = "No results found"
            }
          } else {
            window.alert("Geocoder failed due to: " + status);
            this.result ="Geocoder failed due to: " + status
          }
        }
  );

  }


}
