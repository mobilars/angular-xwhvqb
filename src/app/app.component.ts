import { Component, OnInit } from "@angular/core";
import * as L from "leaflet";
import "leaflet.markercluster";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  map: L.Map;
  geojsonFeature;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    //this.init();
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map("map", {
      center: [59.96051, 10.639229],
      zoom: 12
    });

    const tiles = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }
    );
    tiles.addTo(this.map);


    this.http.get<any>('https://jsonplaceholder.typicode.com/users').subscribe(data => {
            this.geojsonFeature = data;
        })



    L.geoJSON(this.geojsonFeature, {
      style: {
        color: '#ff0000',
        weight: 5,
        opacity: 1
      }
    }).addTo(this.map);



  }
}
