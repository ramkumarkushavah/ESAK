import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewRef, AfterViewInit} from '@angular/core';
import { ICommunity } from '../interfaces/community.interface';

import { Location } from '@angular/common';
import { Community } from '../classes/community';

declare let electron: any;
declare let ol:any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  public ipc = electron.ipcRenderer;
  public community = new Community();
  divTrueFalseA: boolean = false;
  assetData: boolean = true;
  oildata:string = '';
  gasdata:string = '';
  A = [ ];
  B = [ ];
 

  i:number = 2;

  public communitiesList: Array<ICommunity>;

  
  constructor(private ref: ChangeDetectorRef, private location: Location) { }

  ngAfterViewInit(){
    this.openlayermap();
  }

  ngOnInit() {
    let me = this;
    me.ipc.send("mainWindowLoaded")
    me.ipc.on("CommunitiesListSent", function (evt, result) {
      me.communitiesList = result;
      console.log(result);
      // for (var i = 0; i < result.length; i++) {
      // me.communitiesList.push(result[i]);
      // }
      if (!(me.ref as ViewRef).destroyed) {
        me.ref.detectChanges();
        console.log(me.communitiesList);
      }
    });
  }

  ngOnDestroy() {
    this.ref.detach();
  }
  delete(){
    console.log("Deteting Data");
  }
  update(){
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
      image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
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
  ////////Vector Layer Finish////////////

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
      // renderer:'canvas'
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
  map.on('click', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
         

          me.divTrueFalseA = !me.divTrueFalseA;
          console.log("Marker click",  me.divTrueFalseA);
          me.ipc.send("mainWindowLoaded")
          me.ipc.on("CommunitiesListSent", function (evt, result) {
            me.communitiesList = result;
            console.log(result);
          
          // me.goBack();
          });
        //   me.i = me.i++;
        //   me.i = me.i %2;
        // console.log(me.i);

       

          ////////////////Sementic Modal///////////
        //   $('.ui.modal')
        //   .modal('show')
        // ;
          /////////////Sementic Modal Call////////
          return feature;
        });
    // if (feature) {
    //   popup.setPosition(evt.coordinate);
    //   $(element).popover({
    //     'placement': 'top',
    //     'html': true,
    //     'content': feature.get('name')
    //   });
    //   $(element).popover('show');
    // } else {
    //   $(element).popover('destroy');
    // }
  });
  map.on('click', function(evt) {
    console.log("Map Click event");
  });
  
  ///////////Overlay Popup & Event Binding Finish////////////
  }
  insert(){
    console.log(this.oildata);
    console.log(this.gasdata);

    this.A.push(this.oildata);
    this.B.push(this.gasdata);

    console.log(this.A);
    console.log(this.B);
    
    this.oildata = null;
    this.gasdata = null;
  }
  close(){
    this.divTrueFalseA = !this.divTrueFalseA;
    console.log("Closed the FDC Div", this.divTrueFalseA);
  }
  createCommunity() {
    let me = this;
    me.ipc.send("createCommunity", me.community);

    me.ipc.send("mainWindowLoaded")
    me.ipc.on("CommunitiesListSent", function (evt, result) {
      me.communitiesList = result;
      console.log(result);

      me.communitiesList = [ ]; 
    // me.goBack();
    });
  }

  goBack() {
    this.location.back();
  }
}
