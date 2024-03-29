function autocomplete(input, latInput, lngInput){
    //console.log(imput, latInput, lngInput);

    if (!input) return;

    const dropdown = new google.maps.places.Autocomplete(input);

    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        //console.log(place);
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    });
// enter field dn't submit field
    input.on('keydown', (e) => {
        if(e.keyCode === 13) e.preventDefault();
    })

}


export default autocomplete;