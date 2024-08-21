let paikat = [
    [61.87421, 29.07023],
    [61.87532, 29.08011],
    [61.87720, 29.08968],
    [61.87692, 29.09287],
    [61.87729, 29.09409],
    [61.87426, 29.09401],
    [61.86960, 29.10024],
    [61.87111, 29.10224],
    [61.87154, 29.10546],
    [61.87352, 29.11048],
    [61.87502, 29.11244],
    [61.87297, 29.12104],
    [61.86944, 29.12715],
    [61.86828, 29.13209],
    [61.86879, 29.13566],
    [61.87080, 29.13997],
    [61.87429, 29.14956],
    [61.86679, 29.13490],
    [61.86559, 29.13803],
    [61.86266, 29.14608],
    [61.86052, 29.15287],
    [61.85268, 29.17020],
    [61.85167, 29.17259],
    [61.85054, 29.17574],
    [61.86197, 29.11404],
    [61.86304, 29.11374],
    [61.86424, 29.11131],
    [61.86531, 29.10779],
    [61.86789, 29.10036],
    [61.86571, 29.09820],
    [61.86125, 29.09947],
    [61.86210, 29.09429],
    [61.86317, 29.09190],
    [61.86344, 29.08944],
    [61.86478, 29.08295],
    [61.86688, 29.07660],
    [61.86386, 29.06863],
    [61.86154, 29.06331],
    [61.85213, 29.11174],
    [61.85965, 29.12116],
    [61.85731, 29.12937],
    [61.85010, 29.13205],
    [61.85158, 29.13283],
    [61.84655, 29.12803],
    [61.84363, 29.12687],
    [61.84410, 29.15249],
    [61.84824, 29.14171],
    [61.84284, 29.12206],
    [61.83526, 29.12728],
    [61.83801, 29.14909]

], omatpaikat = [
    [61.87878, 29.09498],
    [61.87623, 29.09375],
    [61.86963, 29.09852],
    [61.84851, 29.12954],
    [61.86462, 29.09838],
    [61.86419, 29.08451],
    [61.86551, 29.08138],
    [61.86551, 29.08097],
    [61.87457, 29.11125],
    [61.87112, 29.10382],
    [61.86431, 29.14069],
    [61.85487, 29.16476],
    [61.84886, 29.17854]
]

let omaPaikka, locatePaalla = false, valittu, vanhaPaikka;

let kartta = new L.map('map', {
    center: [61.873259139911866, 29.090251922607425],
    zoom: 15,
    rotate: true,
    rotateControl: {
        closeOnZeroBearing: false
    }
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { 
    maxZoom: 18, 
    attribution: '&copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(kartta);

paikat.forEach((itm) => {
    let markeri = L.marker([itm[0],itm[1]]).addTo(kartta);
    markeri.on('click', (evnt) => { 
        if (valittu) poistaValinta();
        markeri._icon.classList.add('punainen'); 
        valittu=markeri; 
        infotekstit(evnt.latlng,true); 
    })
})

omatpaikat.forEach((itm) => {
    let markeri = L.marker([itm[0],itm[1]]).addTo(kartta);
    markeri.on('click', (evnt) => { 
        if (valittu) poistaValinta();
        markeri._icon.classList.replace('vihrea','punainen'); 
        valittu=markeri; 
        infotekstit(evnt.latlng,true); 
    })
    markeri._icon.classList.add('vihrea');
})

document.onkeyup = (e) => {
    kartta.setBearing(kartta.getBearing()+5);
}

function poistaValinta() {
    let onkoVihrea = false;
    omatpaikat.forEach((oma) => {
        if (oma[0] == valittu._latlng.lat && oma[1] == valittu._latlng.lng) {
            onkoVihrea = true;
        }
    });
    if (onkoVihrea) {
        valittu._icon.classList.replace('punainen','vihrea')
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

const omaButton2 = L.control({ position: 'topleft'});
omaButton2.onAdd = () => {
    const buttonDiv = L.DomUtil.create('div','leaflet-bar');
    buttonDiv.innerHTML = '<a class="leaflet-interactive" style="padding-top: 6px;"><span class="material-symbols-outlined" id="track">location_searching</span></a>';
    buttonDiv.addEventListener('click', () => {
        if (!locatePaalla) {
            haePaikka();
            locateButton(true);
        } else {
            locateButton(false);
            kartta.stopLocate();
        }
    })
    return buttonDiv;
}
omaButton2.addTo(kartta);

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

function locateButton(paalle) {
    if (paalle) {
        locatePaalla = true;
        document.querySelector('#track').innerHTML = 'my_location';
        document.querySelector('#info').classList.remove('leaflet-disabled');
    } else {
        locatePaalla = false;
        omaPaikka.removeFrom(kartta);
        omaPaikka = null;
        document.querySelector('#track').innerHTML = 'location_searching';
        document.querySelector('#info').classList.add('leaflet-disabled');
    }
}

function paikkaVirhe(evnt) {
    if (!omaPaikka) {
        locateButton(false);
        alert(evnt.message);
    }
}

function paivitaOmaPaikka(latlng) {
    if (omaPaikka) {
        omaPaikka.setLatLng(latlng);
        kartta.setView(latlng);
        
        console.log(vanhaPaikka, latlng);
        
        document.querySelector('#bearing').innerHTML = suunta(vanhaPaikka,latlng);
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
        omaPaikka = L.marker(latlng, { icon: omaKuvake}).addTo(kartta);

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
