let paikat = [
    [61.87421, 29.07023],
    [61.87532, 29.08011]
]

let omaPaikka;

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

kartta.locate({setView: true});

function paikkaVirhe(evnt) {
    alert(evnt.message);
}

function paivitaOmaPaikka(latlng) {
    if (omaPaikka) {
        omaPaikka.setLatLng(latlng);
    } else {
        omaPaikka = L.marker(latlng).addTo(kartta);
        omaPaikka._icon.classList.add('punainen');
    }
}

function paikkaLoytyi(evnt) {
    paivitaOmaPaikka(evnt.latlng);
}

kartta.on('locationerror', paikkaVirhe)
kartta.on('locationfound', paikkaLoytyi)
