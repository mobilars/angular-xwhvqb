import { Component, OnInit } from "@angular/core";
import * as L from "leaflet";
import "leaflet.markercluster";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  map: L.Map;
  geojsonFeature;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.initMap();
  }

  testData = {
    phone_number: "+4790733036",
    total: 900,
    offset: 0,
    per_page: 30,
    events: [
      {
        time_from: "2020-04-07T13:39:21Z",
        time_to: "2020-04-07T13:40:24Z",
        latitude: 59.846695,
        longitude: 10.80497,
        accuracy: 8.00100040435791,
        speed: -1.0,
        speed_accuracy: 0.0,
        altitude: 76.84500122070312,
        altitude_accuracy: 3.0
      },
      {
        time_from: "2020-04-07T13:39:10Z",
        time_to: "2020-04-07T13:39:20Z",
        latitude: 59.846771,
        longitude: 10.804977,
        accuracy: 8.00100040435791,
        speed: 0.6449999809265137,
        speed_accuracy: 0.0,
        altitude: 76.48200225830078,
        altitude_accuracy: 3.0
      }
    ],
    next: {
      offset: 30,
      per_page: 30
    }
  };

  private convertFormat(inputJSON) {
    var innArr = [];
    for (var i = 0; i < inputJSON.events.length; i++) {
      innArr[innArr.length] = [
        inputJSON.events[i].longitude,
        inputJSON.events[i].latitude
      ];
    }
    console.log(JSON.stringify(innArr));

    var result = {
      type: "FeatureCollection",
      name: "tracks",
      crs: {
        type: "name",
        properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" }
      },
      features: [
        {
          type: "Feature",
          properties: { name: "20200410_143443.gpx" },
          geometry: {
            type: "MultiLineString",
            coordinates: [innArr]
          }
        }
      ]
    };

    console.log(JSON.stringify(result));

    return result;
  }
  private initMap(): void {
    this.map = L.map("map", {
      //center: [59.96051, 10.639229],
      center: [59.846695, 10.80497],
      zoom: 9
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

    // Download a track formatted as geojson and show
    this.http
      .get<any>(
        "https://raw.githubusercontent.com/mobilars/angular-xwhvqb/master/src/geo/track.js"
      )
      .subscribe(data => {
        this.geojsonFeature = data;
        console.log(this.geojsonFeature);

        L.geoJSON(this.geojsonFeature, {
          style: {
            color: "#ff0000",
            weight: 5,
            opacity: 1
          }
        }).addTo(this.map);
      });

    var drawPoints = this.convertFormat(this.testData);
    L.geoJSON(drawPoints, {
      style: {
        color: "#ff0000",
        weight: 5,
        opacity: 1
      }
    }).addTo(this.map);
  }
}
