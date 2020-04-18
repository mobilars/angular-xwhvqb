import { Component, OnInit } from "@angular/core";
import * as L from "leaflet";
import "leaflet.markercluster";
import { HttpClient } from "@angular/common/http";
import { Papa } from "ngx-papaparse";

var acc = 10;

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements OnInit {
  map: L.Map;
  geojsonFeature;

  constructor(private http: HttpClient, private papa: Papa) {}

  ngOnInit() {
    this.initMap();
  }

  // Download and convert CSV format
  private downloadShowCSV(url) {
    var innArr = [];
    this.papa.parse(url, {
      download: true,
      header: true,
      step: function(row) {
        //console.log("Row:", row.data);
        if (parseFloat(row.data.longitude) && parseFloat(row.data.latitude)) {
          innArr.push([
            parseFloat(row.data.longitude),
            parseFloat(row.data.latitude)
          ]);
        }
      },
      complete: result => {
        //console.log("Parsed: ", result);
        //console.log("Parsed: ", innArr);
        var dataToDisplay = {
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
        //console.log("dataToDisplay: ", JSON.stringify(dataToDisplay));
        L.geoJSON(dataToDisplay, {
          style: {
            color: "#0000ff",
            weight: 5,
            opacity: 1
          }
        }).addTo(this.map);
      }
    });
  }

  // Download and convert CSV format
  // Got a problem with CORS on the function above, so implemented like this instead
  // Maybe not optimal
  private downloadShowCSV2(url, color) {
    //console.log("Url:", url);
    var innArr = [];
    this.http.get(url, {responseType: 'text'}).subscribe(data => {
      //console.log("Data:", data);
      this.papa.parse(data, {
        //download: true,
        header: true,
        step: function(row) {
          //console.log("Row:", row.data);
          if (parseFloat(row.data.longitude) && parseFloat(row.data.latitude) && parseFloat(row.data.accuracy) < acc) {
            //console.log(parseFloat(row.data.accuracy)+ " --- " + parseFloat(row.data.longitude)+ ", "+parseFloat(row.data.latitude));
            innArr.push([
              parseFloat(row.data.longitude),
              parseFloat(row.data.latitude)
            ]);
          } else {
            //console.log("Data excluded"+ parseFloat(row.data.accuracy)+ " --- " + parseFloat(row.data.longitude)+ ", "+parseFloat(row.data.latitude));
          }
        },
        complete: result => {
          //console.log("Parsed: ", result);
          //console.log("Parsed: ", innArr);
          var dataToDisplay = {
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
          //console.log("dataToDisplay: ", JSON.stringify(dataToDisplay));
          L.geoJSON(dataToDisplay, {
            style: {
              color: color,
              weight: 5,
              opacity: 1
            }
          }).addTo(this.map);
        }
      });
    });
  }

  // Convert from innsyns-format to geojson
  private convertFormat(inputJSON) {
    var innArr = [];
    for (var i = 0; i < inputJSON.events.length; i++) {
      innArr[innArr.length] = [
        inputJSON.events[i].longitude,
        inputJSON.events[i].latitude
      ];
    }
    //console.log(JSON.stringify(innArr));

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

    //console.log(JSON.stringify(result));

    return result;
  }

  // Set up map
  private initMap(): void {
    // Create map with center in Oslo
    this.map = L.map("map", {
      center: [59.846695, 10.80497],
      zoom: 9
    });

    // Add the map layer and attribution
    const tiles = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }
    );
    tiles.addTo(this.map);

    // Download a track formatted as geojson and display on map
    this.http
      .get<any>(
        "https://raw.githubusercontent.com/mobilars/angular-xwhvqb/master/src/geo/track.json"
      )
      .subscribe(data => {
        this.geojsonFeature = data;
        //console.log(this.geojsonFeature);

        L.geoJSON(this.geojsonFeature, {
          style: {
            color: "#ff0000",
            weight: 5,
            opacity: 1
          }
        }).addTo(this.map);
      });

    // Download a track formatted as innsyns-format and display on map
    this.http
      .get<any>(
        "https://raw.githubusercontent.com/mobilars/angular-xwhvqb/master/src/geo/innsyn.json"
      )
      .subscribe(data => {
        var drawPoints = this.convertFormat(data);
        //console.log(this.geojsonFeature);
        L.geoJSON(drawPoints, {
          style: {
            color: "#00ffff",
            weight: 5,
            opacity: 1
          }
        }).addTo(this.map);
      });

    // Download and show CSV-based data (tur til Nesodden)
    this.downloadShowCSV2(
      "https://raw.githubusercontent.com/mobilars/angular-xwhvqb/master/src/geo/GPS-sample.csv", 
      "#0000ff"
    );

    // Download and show CSV-based 
    this.downloadShowCSV2(
      "https://raw.githubusercontent.com/mobilars/angular-xwhvqb/master/src/geo/40ea8878728e11ea86d7ee3617b084b4.csv",
      "#ff0000"
    );

    // Download and show CSV-based 
    this.downloadShowCSV2(
      "https://raw.githubusercontent.com/mobilars/angular-xwhvqb/master/src/geo/7b0aae906eb811eab2dbf2c0332c0ef9.csv",
      "#00ff00"
    );
  }
}
