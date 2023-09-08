// Globaalit vakiot
const ikoniButton = document.getElementById('teemaikoni');
const nimikentta = document.getElementById('inputNimi');
const submitButton = document.getElementById('sbmtLisaa');
const poistaButton = document.getElementById('btnPoista');
const jarjestaButton = document.getElementById('btnJarjesta');
const lista = document.getElementById('lista');
const nimet = [];

// Tekstikentän muutos
nimikentta.addEventListener('input', () => {
    // Jos listalta oli jokin rivi valittuna, poistetaan valinta
    nollaaValinta();
    // Onko tekstikentässä tekstiä?
    if (nimikentta.value.length == 0) {
        // Ei ole tekstiä, kielletään 'Lisää nimi'-napin käyttö
        kiella(submitButton);
    } else {
        // tekstikentässä on tekstiä, sallitaan 'Lisää nimi'-nappi
        if (submitButton.classList.contains('disabled')) {
        salli(submitButton);
        }
        // tarkistetaan löytyykö tekstikenttään syötetty nimi jo listalta,
        // jos löytyy valitaan se (--> 'Poista nimi'-nappi menee päälle)
        // jos ei löydy, tarkistetaan onko 'Poista nimi' sallittu ja kielletään se
        if (nimet.includes(nimikentta.value)) {
            lista.children[nimet.indexOf(nimikentta.value)].click();
        } else if (poistaButton.classList.contains('enabled')) {
            kiella(poistaButton);
        }
    }
});

// Lomakkeen submit
document.getElementById('nimiForm').addEventListener('submit', (event) => {
    // kielletään oletustoiminta
    event.preventDefault();
    // onko 'Lisää nimi'-nappi käytössä?
    if (submitButton.classList.contains('enabled')) {
        // onko käytössä, mutta ei ole enää...
        kiella(submitButton);
        // lisätään tekstikentässä oleva nimi listaan
        lisaaListaan(nimikentta.value);
        // jos listalta on valittuna jokin nimi, poistetaan valinta
        nollaaValinta();
        // tekstikenttä tyhjäksi
        nimikentta.value = '';
        // Jos 'Poista nimi'-nappi oli sallittu, poistetaan se käytöstä
        // koska nimikenttä on nyt tyhjä
        if (poistaButton.classList.contains('enabled')) {
            kiella(poistaButton);
        }
        // focus tekstikenttään
        nimikentta.focus();
    }
});

// funktio joka lisää tekstikentän sisällön listaan
function lisaaListaan(nimi) {
    nimet.push(nimi);
    // Järjestä lista -napin salliminen/kieltäminen
    if (nimet.length <= 1) {
        kiella(jarjestaButton);
    } else if (jarjestaButton.classList.contains('disabled')) {
        salli(jarjestaButton);
    }
    
    // Luodaan lisättävälle nimelle uusi li-elementti
    let uusiListaItem = document.createElement('li');
    uusiListaItem.innerText = nimi;
    uusiListaItem.classList.add('list-group-item', 'list-group-item-action');
    uusiListaItem.style = 'opacity: 0; cursor: pointer;';
    uusiListaItem.onclick = valitseListalta;
    lista.appendChild(uusiListaItem);

    // Odotetaan 10ms ja triggeröidään fade in
    setTimeout(() => {
        uusiListaItem.style.transition = 'all 0.5s ease-out 0s';
        uusiListaItem.style.opacity = '1';
    }, 10);
}

function valitseListalta(event) {
    // Poistetaan valinta aiemmin valitulta riviltä, jos sellainen löytyy
    nollaaValinta();
    // Valittu listan rivi aktiiviseksi
    event.target.classList.add('active');
    // Sallitaan 'Poista nimi'-nappula
    salli(poistaButton);
}

function nollaaValinta() {
    // varmistetaan ettei yksikään listan riveistä ole valittuna
    for (let lapsi of lista.children) {
        if (lapsi.classList.contains('active')) {
            lapsi.classList.remove('active');
        }
    }
}

// sallitaan parametrinä annetun nappulan toiminta
function salli(kohde) {
    kohde.classList.replace('disabled','enabled');
}

// kielletään parametrinä annetun nappulan toiminta
function kiella(kohde) {
    kohde.classList.replace('enabled','disabled');
}

// Järjestä lista -napin toiminta
jarjestaButton.addEventListener('click', () => {
    // Kielletään Järjestä lista -napin toiminta päivittämisen ajaksi
    kiella(jarjestaButton);
    // Kielletään myös Lisää nimi -napin toiminta
    kiella(submitButton);

    // Poistetaan valinta listalta, jos sieltä on jotain valittuna
    nollaaValinta();
    // Kielletään Poista nimi -nappula, jos se on aiemmin enabloitu
    if (poistaButton.classList.contains('enabled')) {
        //poistaButton.classList.replace('enabled','disabled');
        kiella(poistaButton);
    }
    // Käännetään lista piiloon aakkostamista varten
    lista.style.opacity = '0';

    // Odotetaan 500ms että lista on piilossa
    setTimeout(() => {
        // Aakkostetaan pienillä kirjaimilla
        nimet.sort(function (a,b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        // Sijoitetaan nimet oikeille paikoille
        for (let i=0; i<nimet.length; i++) {
            lista.children[i].innerText = nimet[i];
        }
        // Käännetään lista näkyville
        lista.style.opacity = '1';
        // Odotetaan kääntö (500ms) ja sallitaan taas Järjestä lista -nappulan toiminta
        setTimeout(() => {
            salli(jarjestaButton);
            if (nimikentta.value.length > 0) {
                salli(submitButton);
            }
            nimikentta.focus();
        }, 500);
    }, 500);
    
});


// Poista nimi -napin toiminnot
poistaButton.addEventListener('click', () => {

    // Etsitään valittu rivi (= sisältää active-luokan)
    for (let i=0;i<lista.children.length;i++) {
        if (lista.children[i].classList.contains('active')) {
            nollaaValinta();
            // Visuaaliset kikkailut
            lista.children[i].style.opacity = 0;
            lista.children[i].style.maxHeight = 0;
            lista.children[i].style.padding = 0;
            setTimeout(() => {
                lista.removeChild(lista.children[i]);
            }, 400);
        // Poistetaan sama "rivi" nimet-arraysta
        nimet.splice(i,1);
        // Valittu rivi poistettu, lopetetaan for-silmukka
        break;
        }
    }   

    // tekstikenttä tyhjäksi ja Lisää nimi -nappi pois käytöstä
    nimikentta.value = '';
    kiella(submitButton);
    // Poista nimi -> disabled
    kiella(poistaButton);
    // Tarkistetaan poistetaanko Järjestä lista -nappula käytöstä
    if (nimet.length<2) {
        // Järjestä lista -> disabled
        kiella(jarjestaButton);
    }
    nimikentta.focus();
});

nimikentta.focus();