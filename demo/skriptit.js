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
    [61.87462, 29.11369],
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
    [61.86517, 29.08233],
    [61.86688, 29.07660],
    [61.86386, 29.06863],
    [61.86101, 29.06303],
    [61.85213, 29.11174],
    [61.85965, 29.12116],
    [61.85731, 29.12937],
    [61.84976, 29.13148],
    [61.85158, 29.13283],
    [61.84655, 29.12803],
    [61.84371, 29.12697],
    [61.84410, 29.15249],
    [61.84824, 29.14171],
    [61.84284, 29.12206],
    [61.83526, 29.12728],
    [61.83801, 29.14909]

], omatpaikat = [
    [61.87878, 29.09498],
    [61.87623, 29.09375],
    [61.86963, 29.09852]
]

let omaPaikka, locatePaalla = false;

let kartta = new L.map('map', {
    center: [61.873259139911866, 29.090251922607425],
    zoom: 15,
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { 
    maxZoom: 18, 
    attribution: '&copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(kartta);

paikat.forEach((itm) => {
    L.marker([itm[0],itm[1]]).addTo(kartta);
})

omatpaikat.forEach((itm) => {
    let markeri = L.marker([itm[0],itm[1]]).addTo(kartta);
    markeri._icon.classList.add('vihrea');
    //markeri.on('click', (e) => { infotekstit(e.latlng);} );
    //console.log(markeri.getLatLng().lat, markeri.getLatLng().lng);
})

//kartta.locate({setView: true, watch: true});

function infotekstit(laln) {

    document.querySelector('#textDiv').classList.remove('piilossa');
    /*
    if (laln) {
        document.querySelector('#lat').innerHTML = "Lat: " + laln.lat;
        document.querySelector('#long').innerHTML = "Long: " + laln.lng;
        document.querySelector('#textDiv').style.display = 'block';
    } else {
        //document.querySelector('#textDiv').style.display = 'none';
    }
        */
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
        infotekstit(omaPaikka.getLatLng());
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

        omaPaikka = L.marker(latlng, { icon: omaKuvake}).addTo(kartta);
        //omaPaikka._icon.classList.add('punainen');
    }
}

function paikkaLoytyi(evnt) {
    paivitaOmaPaikka(evnt.latlng);
}

kartta.on('locationerror', paikkaVirhe)
kartta.on('locationfound', paikkaLoytyi)

//kartta.locate({setView: true, watch: true});

function haePaikka() {
    kartta.locate({setView: false, watch: true, enableHighAccuracy: true});
}

//haePaikka();

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
