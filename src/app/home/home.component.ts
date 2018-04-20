import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewRef, AfterViewInit } from '@angular/core';
import { Http, Response, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';
import 'rxjs/operator/delay';
import 'rxjs/operator/mergeMap';
import 'rxjs/operator/switchMap';
import * as Rx from "rxjs/Rx"

import { ICommunity } from '../interfaces/community.interface';
import { Location } from '@angular/common';
import { Community } from '../classes/community';



declare let electron: any;
declare let ol: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  public connectionstatus: string;
  public onlineOffline: boolean = navigator.onLine;
  public ipc = electron.ipcRenderer;
  public community = new Community();
  divTrueFalseA: boolean = false;
  assetData: boolean = true;
  public communitiesList: Array<ICommunity>;


  constructor(private ref: ChangeDetectorRef, private location: Location, private http: Http) {
    window.addEventListener('online', () => {
      this.connectionstatus = " ";
      this.onlineOffline = true;

      if (this.onlineOffline = true) {
        var self = this;
        this.connectionstatus = "Online";
        console.log("Internet Connection Status is :", this.onlineOffline);
        this.ipc.send("mainWindowLoaded")
        this.ipc.on("CommunitiesListSent", function (evt, result) {
          console.log("Sending Offline Data To The MS SQL Server : ", result);
          self.insertdata(result);
        });
      }

    });
    window.addEventListener('offline', () => {
      this.connectionstatus = " ";
      this.onlineOffline = false;
      this.connectionstatus = "Offline";
      console.log("Internet Connection Status is :", this.onlineOffline);
    });

  }

  ngAfterViewInit() {
    this.openlayermap();
    this.getdetafromdatabase();
  }
  getdetafromdatabase() {

    this.http.get('http://localhost:64985/api/Employees/').subscribe((res: any) => {
      var a = res._body;
      console.log("Data From Database : ", a);
    });
  }
  insertdata(resulta) {
  
    let val = { "ID": 33, "FirstName": "Santanu", "LastName": "Jat", "Gender": "Male", "Salary": 700000 };
    let body = JSON.stringify(val);

    let url = "http://localhost:64985/api/Employees/";
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    this.http.post(url, body, options).map(res => res).
      subscribe((response) => { },
        (error) => { console.log(error); },
        () => { console.log("Insert document completed."); });
        console.log("Inserted Data is : ",resulta);
  }
  ngOnInit() {
    let me = this;
    me.ipc.send("mainWindowLoaded");
    me.ipc.on("CommunitiesListSent", function (evt, result) {
      me.communitiesList = result;
      console.log("ngOnInit data : ", result);
      // for (var i = 0; i < result.length; i++) {
      // me.communitiesList.push(result[i]);
      // }
      if (!(me.ref as ViewRef).destroyed) {
        me.ref.detectChanges();
        //console.log(me.communitiesList);
      }
    });
  }

  ngOnDestroy() {
    this.ref.detach();
  }
  delete() {
    console.log("Deteting Data");
  }
  update() {
    console.log("Updating Data");
  }
  openlayermap() {
    this.assetData = !this.assetData;


    /////////////Vector Layer//////////////
    var iconFeature = new ol.Feature({
      geometry: new ol.geom.Point([0, 0]),
      name: 'Null Island',
      population: 4000,
      rainfall: 500
    });

    var iconStyle = new ol.style.Style({
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        opacity: 0.75,
        src: './favicon.ico'
      }))
    });

    iconFeature.setStyle(iconStyle);

    var vectorSource = new ol.source.Vector({
      features: [iconFeature]
    });

    var vectorLayer = new ol.layer.Vector({
      source: vectorSource
    });
    ////////Vector Layer Finish//////

    ////////Raster Layar/////////////

    var rasterLayer = new ol.layer.Tile({
      source: new ol.source.OSM()
    })
    /////////Raster Layer Finish/////////////
    var map = new ol.Map({
      target: 'map',
      layers: [rasterLayer, vectorLayer],
      view: new ol.View({
        center: ol.proj.fromLonLat([37.41, 8.82]),
        zoom: 4
      }),
    });

    ////////////Overlay Popup & Event Binding Start//////////// 

    var element = document.getElementById('popup');

    var popup = new ol.Overlay({
      element: element,
      positioning: 'bottom-center',
      stopEvent: false
    });
    map.addOverlay(popup);

    let me = this;

    // display popup on click
    map.on('click', function (evt) {
      var feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature, layer) {

          me.divTrueFalseA = !me.divTrueFalseA;
          console.log("Marker click", me.divTrueFalseA);

          me.ipc.send("mainWindowLoaded")
          me.ipc.on("CommunitiesListSent", function (evt, result) {
            me.communitiesList = result;
            console.log("Data On Map Click Event :", result);

          });
          return feature;
        });
    });
    map.on('click', function (evt) {
      console.log("Map Click event");
    });
  }

  close() {
    this.divTrueFalseA = !this.divTrueFalseA;
  }
  createCommunity() {
    let me = this;
    me.ipc.send("createCommunity", me.community);
    me.ipc.send("mainWindowLoaded")
    me.ipc.on("CommunitiesListSent", function (evt, result) {
      me.communitiesList = result;
    });
  }
}
