import '../sass/style.scss';

import { $, $$ } from './modules/bling';

import autocomplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

//
autocomplete( $('#address'), $('#lat'), $('#lng') );


typeAhead( $('.search') );


makeMap( $('#map'));

// ajaxHeart( )
const heartForms = $$('form.heart');
//console.log(heartForm);
heartForms.on('submit',ajaxHeart);