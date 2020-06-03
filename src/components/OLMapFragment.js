import React from 'react'
import error from '../assets/img/icons/error.png'
import blueMarker from '../assets/img/icons/blue-marker.png'
import blackMarker from '../assets/img/icons/black-marker.png'
// Start Openlayers imports
import { 
    Map,
    View,
    Feature
 } from 'ol'
import {
    Tile as TileLayer,
    Vector as VectorLayer
} from 'ol/layer'
import {
    Vector as VectorSource,
    XYZ as XYZSource,
} from 'ol/source'

import { Zoom } from 'ol/control'

import {fromLonLat} from 'ol/proj'

import {Style, Icon} from 'ol/style'

import {Point} from 'ol/geom'

import 'ol/css'
import 'ol/ol.css'
// End Openlayers imports

class OLMapFragment extends React.Component {
    constructor(props) {
        super(props)
        this.state = {loc: [], height:0, error: 0}
        this.updateDimensions = this.updateDimensions.bind(this)
        this.getRecentLocations = this.getRecentLocations.bind(this)
    }
    getRecentLocations(callback){
        let search = window.location.search;
        let params = new URLSearchParams(search);
        let devId = params.get('id');
        if (devId == null || devId == ''){
            this.setState({error: 1})
        }
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        fetch(proxyurl+'http://iottracker.herokuapp.com/footprint?id='+devId)
        .then(res => res.json())
        .then((data) => {
          this.setState({ loc: data },callback)
          if (data.length == 0){
            this.setState({error: 1})
          }
        })
        .catch( error => {
            this.setState({error: 1})
            console.log(error);
        } )
    }
    updateDimensions(){
        let h = window.innerWidth >= 992 ? window.innerHeight : 400
        h  = h>800 ? 800: h
        this.setState({height: h})
    }
    componentWillMount(){
        window.addEventListener('resize', this.updateDimensions)
        this.updateDimensions()        
    }
    componentDidMount(){
        // Create an Openlayer Map instance with two tile layers
        this.getRecentLocations( () => {
            let iconFeatures = []
            let points = []
            for (let i = 0; i < this.state.loc.length; i++) {
                let point = this.state.loc[i]
                let marker =  [point.y, point.x].toString()
                if ((points.indexOf(marker) > -1)) { continue }
                points.push(marker)
                let iconFeature = new Feature({
                    geometry: new Point(fromLonLat([point.y, point.x])),
                    name: point.time,
                });
                iconFeatures.push(iconFeature)
            }
            if (iconFeatures.length===0) {return 1}
            const map = new Map({
                //  Display the map in the div with the id of map
                target: 'map',
                controls: [new Zoom()],
                layers: [
                    new TileLayer({
                        source: new XYZSource({
                            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            projection: 'EPSG:3857'
                        })
                    }),
                    new VectorLayer({
                        source: new VectorSource({
                          features: [iconFeatures[0]]
                        }),
                        style: new Style({
                          image: new Icon({
                            anchor: [0.5, 46],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            src: blueMarker,
                            scale: 0.08
                          })
                        })
                    }),
                    new VectorLayer({
                        source: new VectorSource({
                          features: iconFeatures.slice(1)
                        }),
                        style: new Style({
                          image: new Icon({
                            anchor: [0.5, 46],
                            anchorXUnits: 'fraction',
                            anchorYUnits: 'pixels',
                            src: blackMarker,
                            scale: 0.05
                          })
                        })
                    })
                ],
                // Render the tile layers in a map view with a Mercator projection
                view: new View({
                    projection: 'EPSG:3857',
                    center: fromLonLat([this.state.loc[0].y,this.state.loc[0].x]),
                    zoom: 14
                })
            })
        })
    }
    componentWillUnmount(){
        window.removeEventListener('resize', this.updateDimensions)
    }
    render(){
        const style = {
            alignItems:'center',
            justifyContent: 'center',
            width: '80%',
            margin:'0 auto',
            padding: '0',
            height: this.state.height,
            backgroundColor: '#cccccc',
        }
        const devlink = "https://www.google.com/maps/search/?api=1&query="
        let latlon = (this.state.loc.length>0) ? `${this.state.loc[0].x},${this.state.loc[0].y}` : "0,0"
        if (this.state.error == 1){
            return (
                <div style={{alignItems:'center', margin:'0 auto', width: '80%', justifyContent:'center', paddingTop: '3%'}}>
                <br/>
                <br/>
                <img src={error} style={style} />
                </div>
            )
        }
        return (
            <div class="center" style={{alignItems:'center', margin:'0 auto', width: '80%', justifyContent:'center', paddingTop: '3%'}}>
            <p style={{alignItems:'center', justifyContent: 'center', width: '80%',paddingLeft: '10%'}}>
                <a href={devlink+latlon}>Get direction to your device</a><br/>
                Locate your device in the map. Blue marker indicates latest location<br/>
                <br/>
                <br/>
            </p>
            <div id='map' style={style}>
            </div >
            </div>
        )
    }
}
export default OLMapFragment