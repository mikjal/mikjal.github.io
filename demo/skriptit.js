
let omaPaikka, locatePaalla = false, valittu;

let kartta = new L.map('map', {
    center: [61.873259139911866, 29.090251922607425],
    zoom: 15,
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
    } else {
        let omaKuvake = L.icon({
            iconUrl: 'radio_button_checked.png',
            iconSize: [24,24],
            iconAnchor: [12,12],
            shadowUrl: 'radio_button_checked_shadow.png',
            shadowSize: [24,24],
            shadowAnchor: [12,12]
        });
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


// Estä ruudun "sammuminen" Chromessa
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
