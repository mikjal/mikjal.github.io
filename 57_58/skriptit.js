
let omaPaikka, 
    locatePaalla = false, 
    valittu, 
    vanhaPaikka, 
    pyoritysPaalla = false, 
    haluttuSuunta, 
    nykyinenSuunta, 
    ajastin, 
    debug = false,
    nykyinenReitti = null,
    triggeripiste = null,
    seuraavaReitti = 0,
    seuraavaPiste = 0,
    viiva = null,
    markerit = [];

let kartta = new L.map('map', {
    center: [61.84219846733061, 28.97324323654175],
    zoom: 16,
    rotate: true,
    rotateControl: {
        closeOnZeroBearing: false
    }
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { 
    maxZoom: 18, 
    attribution: '&copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(kartta);

/*
kartta.on('click', (evnt) => {
    console.log('['+evnt.latlng.lat+', '+evnt.latlng.lng+'],');
    navigator.clipboard.writeText('['+evnt.latlng.lat+', '+evnt.latlng.lng+'],');
});
*/

paikat.forEach((itm,cnt) => {
    let markeri = L.marker([itm[0],itm[1]], {opacity: 0.8, title: cnt.toString()}).addTo(kartta);
    if (itm[2] == 1) markeri._icon.classList.add('vihrea');
    markeri.on('click', (evnt) => { 
        if (valittu) poistaValinta();
        if (markeri._icon.classList.contains('vihrea'))  {
            markeri._icon.classList.remove('vihrea');
            markeri._icon.classList.add('punvihr'); 
        } else {
            markeri._icon.classList.add('punainen'); 
        }
        valittu=markeri; 
        infotekstit(evnt.latlng,true); 
    })
    markerit.push(markeri);
})

/*
document.onkeyup = (e) => {
    if (e.key == 'a') kartta.setBearing(kartta.getBearing()-5);
}
*/

function paivitaReitti() {
    if (nykyinenReitti) nykyinenReitti.removeFrom(kartta);
    if (seuraavaReitti <= reitit.length-1) {
        nykyinenReitti = L.polyline(reitit[seuraavaReitti], {color: 'black', opacity: 0.6, weight: 4}).addTo(kartta);
        triggeripiste = reitit[seuraavaReitti].at(-1);
        seuraavaReitti += 1;
    } else {
        if (!document.querySelector('#seuraavareitti').classList.contains('leaflet-disabled')) document.querySelector('#seuraavareitti').classList.add('leaflet-disabled');
        triggeripiste = null;
    }
}

function poistaValinta() {
    if (valittu._icon.classList.contains('punvihr')) {
        valittu._icon.classList.replace('punvihr','vihrea')
    } else {
        valittu._icon.classList.remove('punainen');
    }
    valittu = null;

}

function infotekstit(laln,pun) {
    if (laln) {
        if (pun) {
            document.querySelector('#lat').innerHTML = "Merkki: ";  
            document.querySelector('#long').innerHTML = laln.lat+', '+laln.lng;
            document.querySelector('#lat').classList.add('textpun');
            document.querySelector('#long').classList.add('textpun');
        } else {
            document.querySelector('#lat').innerHTML = "Lat: " + laln.lat;
            document.querySelector('#long').innerHTML = "Long: " + laln.lng;
                if (document.querySelector('#lat').classList.contains('textpun')) {
                document.querySelector('#lat').classList.remove('textpun');
                document.querySelector('#long').classList.remove('textpun');    
            }
        }
        document.querySelector('#textDiv').style.display = 'block';
    } else {
        if (document.querySelector('#lat').classList.contains('textpun')) {
            poistaValinta();
        }
        document.querySelector('#textDiv').style.display = 'none';

    }
}

// fullscreen
const omaButton1 = L.control({ position: 'topleft'});
omaButton1.onAdd = () => {
    const buttonDiv = L.DomUtil.create('div','leaflet-bar');
    buttonDiv.innerHTML = '<a class="leaflet-interactive" style="padding-top: 6px;"><span class="material-symbols-outlined" id="fullscreen">fullscreen</span></a>';
    buttonDiv.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            document.querySelector('#fullscreen').innerHTML = 'fullscreen_exit';
        } else {
            document.exitFullscreen();
            document.querySelector('#fullscreen').innerHTML = 'fullscreen';
        }
    })
    return buttonDiv;
}
omaButton1.addTo(kartta);

// locate
const omaButton2 = L.control({ position: 'topleft'});
omaButton2.onAdd = () => {
    const buttonDiv = L.DomUtil.create('div','leaflet-bar');
    buttonDiv.innerHTML = '<a class="leaflet-interactive" style="padding-top: 6px;"><span class="material-symbols-outlined" id="track">location_searching</span></a>';
    buttonDiv.addEventListener('click', () => {
        if (!locatePaalla) {
            haePaikka();
            locateButton(true);
            paivitaReitti();
        } else {
            locateButton(false);
            kartta.stopLocate();
            if (viiva) { 
                viiva.removeFrom(kartta); 
                viiva=null; 
                document.querySelector('#debug1').innerHTML = '';
                //document.querySelector('#debug2').innerHTML = '';
            }
        }
    })
    return buttonDiv;
}
omaButton2.addTo(kartta);

// info
const omaButton3 = L.control({position: 'topleft'});
omaButton3.onAdd = () => {
    const buttonDiv = L.DomUtil.create('div','leaflet-bar');
    buttonDiv.innerHTML = '<a class="leaflet-interactive leaflet-disabled" id="info" style="padding-top: 6px;"><span class="material-symbols-outlined">info_i</span></a>';
    buttonDiv.addEventListener('click', () => {
        if (!document.querySelector('#info').classList.contains('leaflet-disabled')) infotekstit(omaPaikka.getLatLng(),false);
    })
    return buttonDiv;
}
omaButton3.addTo(kartta);

// rotate
const omaButton4 = L.control({position: 'topleft'});
omaButton4.onAdd = () => {
    const buttonDiv = L.DomUtil.create('div','leaflet-bar');
    buttonDiv.innerHTML = '<a class="leaflet-interactive leaflet-disabled" id="pyoritys" style="padding-top: 6px;"><span class="material-symbols-outlined">flip_camera_android</span></a>';
    buttonDiv.addEventListener('click', () => {
        if (!document.querySelector('#pyoritys').classList.contains('leaflet-disabled')) {
            if (pyoritysPaalla) {
                pyoritysPaalla = false;
                kartta.setBearing(0);
                document.querySelector('#pyoritys').style.color = 'red';
                clearInterval(ajastin);
                ajastin = null;
            } else {
                pyoritysPaalla = true;
                vanhaPaikka = omaPaikka.getLatLng();
                document.querySelector('#pyoritys').style.color = '';
                // init timed rotate
                haluttuSuunta = 0; nykyinenSuunta = 0;
                ajastin = setInterval(ajastettuKaanto,500);
            }
        }
    })
    return buttonDiv;
}
omaButton4.addTo(kartta);

// seuraava reittiopaste
const omaButton5 = L.control({position: 'topleft'});
omaButton5.onAdd = () => {
    const buttonDiv = L.DomUtil.create('div','leaflet-bar');
    buttonDiv.innerHTML = '<a class="leaflet-interactive leaflet-disabled" id="seuraavareitti" style="padding-top: 6px;"><span class="material-symbols-outlined">skip_next</span></a>';
    buttonDiv.addEventListener('click', () => {
        if (!document.querySelector('#seuraavareitti').classList.contains('leaflet-disabled')) paivitaReitti();
    })
    return buttonDiv;
}
omaButton5.addTo(kartta);

function ajastettuKaanto() {
    if (pyoritysPaalla) {
       
        let nykyinen = nykyinenSuunta, haluttu = haluttuSuunta;
        if (nykyinen >= 270 && haluttu < 90) haluttu += 360;
        if (haluttu >= 270 && nykyinen < 90) nykyinen += 360;
        let ero = haluttu - nykyinen;

        if (ero != 0) { // haluttuSuunta != nykyinenSuunta
            if (Math.abs(ero) <= 3) { // alle 3 asteen ero --> nykyinenSuunta = haluttuSuunta
                kartta.setBearing(haluttu);
                nykyinenSuunta = haluttu;
            } else { // ero on suurempi kuin 3 astetta
                ero = Math.round(ero / 2);
                nykyinen += ero;                
            }    
        }

        nykyinenSuunta = (nykyinen < 0) ? 360 + nykyinen : (nykyinen >= 360) ? nykyinen - 360 : nykyinen;

        kartta.setBearing(nykyinenSuunta);

        //if (debug) document.querySelector('#debug2').innerHTML = 'Nykyinen = ' + nykyinenSuunta;
    
    }
}

function locateButton(paalle) {
    if (paalle) {
        locatePaalla = true;
        document.querySelector('#track').innerHTML = 'my_location';
        document.querySelector('#info').classList.remove('leaflet-disabled');
        document.querySelector('#pyoritys').classList.remove('leaflet-disabled');
        document.querySelector('#pyoritys').style.color = 'red';
        document.querySelector('#debugDiv').style.visibility = 'visible';
        //document.querySelector('#seuraavareitti').classList.remove('leaflet-disabled');
    } else {
        locatePaalla = false;
        omaPaikka.removeFrom(kartta);
        omaPaikka = null;
        document.querySelector('#track').innerHTML = 'location_searching';
        document.querySelector('#info').classList.add('leaflet-disabled');
        document.querySelector('#pyoritys').classList.add('leaflet-disabled');
        document.querySelector('#pyoritys').style.color = '';
        document.querySelector('#debugDiv').style.visibility = 'hidden';
        //document.querySelector('#seuraavareitti').classList.add('leaflet-disabled');
        pyoritysPaalla = false;
        if (nykyinenReitti) nykyinenReitti.removeFrom(kartta);
        if (ajastin) clearInterval(ajastin);
        kartta.setBearing(0);
    }
}

function paikkaVirhe(evnt) {
    if (!omaPaikka) {
        locateButton(false);
        alert(evnt.message);
        document.querySelector('#debug1').innerHTML = 'Virhe paikannuksessa.';
    }
}

function liikkuuko(vanha, uusi) {
    if (vanha.lat.toString().slice(0,7) != uusi.lat.toString().slice(0,7)) return true;
    if (vanha.lng.toString().slice(0,7) != uusi.lng.toString().slice(0,7)) return true;
    return false;
}

function matka(paikka) {
    let lat1 = omaPaikka.getLatLng().lat, lon1 = omaPaikka.getLatLng().lng;
    let lat2 = paikka[0], lon2 = paikka[1];
    let R = 6371e3;
    let lat1rad = lat1 * Math.PI/180, lat2rad = lat2 * Math.PI/180;
    let deltalatrad = (lat2-lat1) * Math.PI/180;
    let deltalonrad = (lon2-lon1) * Math.PI/180;

    let a = Math.sin(deltalatrad/2) * Math.sin(deltalatrad/2) +
            Math.cos(lat1rad) * Math.cos(lat2rad) *
            Math.sin(deltalonrad/2) * Math.sin(deltalonrad/2);
    let c = 2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function paivitaOmaPaikka(latlng) {
    if (omaPaikka) {
        omaPaikka.setLatLng(latlng);
        kartta.setView(latlng);

        // tarkistetaan onko reitin triggeripiste asetettu ja ollaanko sen lähellä
        if (triggeripiste) {
            // ollaanko enintään n. 10 metrin päässä triggeripisteeltä?
            if (kartta.distance(latlng,triggeripiste) <= 10) {
                // etäisyys n. 10m tai alle, päivitetään seuraavaan reittiin
                paivitaReitti();
            }
        }

        // etäisyys
        if (seuraavaPiste <= paikat.length-1) {
            let etaisyys = kartta.distance(latlng,paikat[seuraavaPiste]);
            let etastr;
            if (etaisyys >= 1000) {
                //etaisyys /= 1000;
                etastr = (etaisyys / 1000).toString();
                etastr = etastr.slice(0,etastr.indexOf('.')+2);
                etastr += ' km';
            } else {
                etastr = etaisyys.toString();
                if (etastr.length > 5) etastr = etastr.slice(0,5);
                etastr += ' m';
            }

            //document.querySelector('#debug1').innerHTML = etastr;
            
            if (viiva) viiva.removeFrom(kartta);
            viiva = L.polyline([latlng,paikat[seuraavaPiste]], {color: 'red', opacity: 0.3}).addTo(kartta);

            if (seuraavaPiste>0) {
                markerit[seuraavaPiste]._icon.classList.remove('punainen');    
                markerit[seuraavaPiste-1]._icon.classList.add('harmaa');
            }

            if (markerit[seuraavaPiste]._icon.classList.contains('vihrea')) markerit[seuraavaPiste]._icon.classList.remove('vihrea');
            markerit[seuraavaPiste]._icon.classList.add('punainen');

            if (etaisyys <= 10) seuraavaPiste += 1;
            document.querySelector('#debug1').innerHTML = etastr + ' ('+ seuraavaPiste.toString() + '/'+(paikat.length-1).toString()+')';
        } else {
            document.querySelector('#debug1').innerHTML = '';
            //document.querySelector('#debug2').innerHTML = '';
            if (viiva) viiva.removeFrom(kartta);
        }
        
        

        //if (debug) document.querySelector('#debug3').innerHTML = liikkuuko(vanhaPaikka,omaPaikka.getLatLng());

        if (pyoritysPaalla) {
            if (liikkuuko(vanhaPaikka,omaPaikka.getLatLng())) {
                let su = Math.round(suunta(vanhaPaikka,latlng));
                haluttuSuunta = 360-su;

                if (debug) document.querySelector('#debug1').innerHTML = 'Haluttu =' + haluttuSuunta;

            }
        }
        vanhaPaikka = latlng;    

    } else {
        let omaKuvake = L.icon({
            iconUrl: 'radio_button_checked.png',
            iconSize: [24,24],
            iconAnchor: [12,12],
            shadowUrl: 'radio_button_checked_shadow.png',
            shadowSize: [24,24],
            shadowAnchor: [12,12]
        });

        vanhaPaikka = latlng;
        omaPaikka = L.marker(latlng, { icon: omaKuvake, zIndexOffset: 1000}).addTo(kartta);

    }
}

function paikkaLoytyi(evnt) {
    paivitaOmaPaikka(evnt.latlng);
}

kartta.on('locationerror', paikkaVirhe)
kartta.on('locationfound', paikkaLoytyi)


function haePaikka() {
    kartta.locate({setView: false, watch: true, enableHighAccuracy: true});
}


function rad(asteet) {
    return asteet * Math.PI / 180;
}

function deg(radiaanit) {
    return radiaanit * 180 / Math.PI;
}

function suunta(alkuLatLng, loppuLatLng) {
    let alkuLatRad = rad(alkuLatLng.lat), alkuLngRad = rad(alkuLatLng.lng), loppuLatRad = rad(loppuLatLng.lat), loppuLngRad = rad(loppuLatLng.lng);

    let y = Math.sin(loppuLngRad - alkuLngRad) * Math.cos(loppuLatRad);
    let x = Math.cos(alkuLatRad) * Math.sin(loppuLatRad) - Math.sin(alkuLatRad) * Math.cos(loppuLatRad) * Math.cos(loppuLngRad - alkuLngRad);
    let suunta = Math.atan2(y,x);
    suunta = deg(suunta);

    return (suunta + 360) % 360;
}

// Estä ruudun "sammuminen" mobiililaitteella
let wakelock = null;

if (navigator.wakeLock) {
    const requestWakeLock = async () => {
        try {
            wakelock = await navigator.wakeLock.request();
        } catch(err) {
            console.error(err.name, err.message);
        }
    }
    
    requestWakeLock();
    
}
