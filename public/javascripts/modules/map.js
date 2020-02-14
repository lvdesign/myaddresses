import axios from 'axios';
import { $} from './bling';


const mapOptions = {
    center:{ lat:43.2,lng:-79.8 },
    zoom: 10
}


function loadPlaces(map, lat=43.2,lng=-79.8){
    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
    .then(res => {
        const places = res.data;
        if(!places.length){
            alert('No places');
            return;
        }
        //console.log(places);
        // Bounds
        const bounds = new google.maps.LatLngBounds();
        // Infos
        const infoWindow = new google.maps.InfoWindow();


        // Markers
        const markers = places.map(place => {
            const[placeLng, placeLat] = place.location.coordinates;
            const position= { lat:placeLat, lng: placeLng};
            bounds.extend(position); // 
            const marker = new google.maps.Marker({map, position});
            marker.place = place;
            return marker;
        });

        
      // Clic Info when someone clicks on a marker, show the details of that place
      markers.forEach(marker => marker.addListener('click', function() {
        //console.log(this.place);
        const html = `
          <div class="popup">
            <a href="/store/${this.place.slug}">
              <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
              <p>${this.place.name} - ${this.place.location.address}</p>
            </a>
          </div>
        `;
        infoWindow.setContent(html);
        infoWindow.open(map, this);
      }));

        //console.log(markers)
        //zoom
        map.setCenter(bounds.getCenter());
        map.fitBounds(bounds);
    });
}

function makeMap(mapDiv){
    //console.log(mapDiv);
    if(!mapDiv) return;
    // make map
    const map = new google.maps.Map(mapDiv, mapOptions);
    loadPlaces(map); // bouge la carte
   

    const input = $('[name="geolocate"]');
    //console.log(input);
    const autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        loadPlaces(map, place.geometry.location.lat(),place.geometry.location.lng() );
    })

}
//navigator.geolocation.getCurrentPosition

export default makeMap;