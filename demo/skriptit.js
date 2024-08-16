let paikat = [
    [61.87421, 29.07023],
    [61.87532, 29.08011],
    [61.87720, 29.08968],
    [61.87692, 29.09287]
], omatpaikat = [
    [61.87878, 29.09498]
]

let omaPaikka, ajastin;

let kartta = new L.map('map', {
    center: [61.8628, 29.1157],
    zoom: 14,
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
})

//kartta.locate({setView: true, watch: true});

const omaButton1 = L.control({ position: 'topleft'});
omaButton1.onAdd = () => {
    const buttonDiv = L.DomUtil.create('div','leaflet-bar buttonwrapper');
    buttonDiv.innerHTML = '<a class="leaflet-interactive">[]</a>';
    buttonDiv.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    })
    return buttonDiv;
}
omaButton1.addTo(kartta);

function paikkaVirhe(evnt) {
    if (!omaPaikka) alert(evnt.message);
}

function paivitaOmaPaikka(latlng) {
    if (omaPaikka) {
        omaPaikka.setLatLng(latlng);
        kartta.setView(latlng);
    } else {
        omaPaikka = L.marker(latlng).addTo(kartta);
        omaPaikka._icon.classList.add('punainen');
    }
}

function paikkaLoytyi(evnt) {
    paivitaOmaPaikka(evnt.latlng);
    if (!ajastin) ajastin = setInterval(haePaikka,2000);
}

kartta.on('locationerror', paikkaVirhe)
kartta.on('locationfound', paikkaLoytyi)

function haePaikka() {
    kartta.locate();
}

haePaikka();

let wakelock = null;

const requestWakeLock = async () => {
    try {
        wakelock = await navigator.wakeLock.request();
    } catch(err) {
        console.error(err.name, err.message);
    }
}

requestWakeLock();
