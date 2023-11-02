const arvot = [0,0,0,0];
let ekaKierros = true, rahat = 50, panos, voitot = 0;

function pelaa() {
    panos = document.querySelector('#panos').value;

    if (rahat-panos >= 0) { /* riittääkö rahat pelaamiseen nykyisellä panoksella? */
        /* vähennetään panos rahoista ja päivitetään rahamäärä */
        rahat -= panos;
        document.querySelector('#rahamaara').innerText = rahat + ' €';

        /* poistetaan nappulat käytöstä rullien pyörimisen ajaksi */
        document.querySelectorAll('.pelialue button').forEach((bu) => {
            bu.disabled = true;
        });

        /* haetaan viimeinen pyoriva rulla ja lisätään siihen eventlistener */
        let viimeinen = '';
        for(let i=1;i<5;i++) {
            if (!document.querySelector('#rulla'+i+'button').classList.contains('active')) {
                viimeinen = '#rulla'+i;
            }
        }
        
        if (!viimeinen == '') {
            document.querySelector(viimeinen).addEventListener('transitionend',siirtyminenPaattyy);
        }
        
        /* pyöritetään rullia */
        document.querySelectorAll('.rulla').forEach((ele, ndx) => {
            arvot[ndx] = pyoritaRullaa(ele, ndx);
        });

        paivitaInfo('Pelataan '+panos+'€ panoksella','alert-primary');

    } else {
        /* panos on liian suuri jäljellä olevaan rahamäärään verrattuna  */
        paivitaInfo('Panos on suurempi kuin jäljellä olevat rahat!','alert-danger');
    }
}

function pyoritaRullaa(rulla, ndx) {

    /* haetaan rullan edellinen pysähtymiskohta */
    let yPaikka = parseInt(getComputedStyle(rulla).backgroundPositionY);

    let lisays = 0;

    if (!document.querySelector('#rulla'+(ndx+1)+'button').classList.contains('active')) {
        const aikaPerKuva = 100;
    
        /* kaksi kokonaista pyöräytystä + rullan numeron mukainen pyöräytys (--> rullat pysähtyvät järjestyksessä vasemmalta oikealle) */
        /* + arvottu rulla kohta (yksi viidestä) */
        lisays = (2 + ndx) * 5 + Math.round(Math.random() * 5);
    
        rulla.style.transition = 'background-position-y '+ (8 + lisays)*aikaPerKuva + 'ms';
        rulla.style.backgroundPositionY = yPaikka + lisays * 80 + 'px';
    }

    /* palautetaan tieto, minkä kuvan kohdalle rulla pysähtyy */
    return (yPaikka/80+lisays)%5;
}

function siirtyminenPaattyy(evnt) {

    /* poistetaan tämä eventlistener */
    evnt.target.removeEventListener('transitionend',siirtyminenPaattyy);

    /* sallitaan pelaa-napin käyttö */
    document.querySelector('#pelaabutton').disabled = false;

    /*  tarkasta tuliko voittoa */
    let lkm = 0, voitto = 0, voittotaulukko = [6,4,3,10,5];
    for (let i=0;i<5;i++) { /* käydään läpi rullan eri kuvat */
        lkm = 0;
        for (luku of arvot) { /* käydään läpi kaikki rullat */
            lkm = (luku == i) ? lkm + 1 : lkm;
        }
        /* määritellään voitto: onko kolme seiskaa tai neljä samaa kuvaa, jos ei niin voitto=0 */
        voitto = (i == 3 && lkm == 3) ? 5 : (lkm == 4) ? voittotaulukko[i] : 0;
        if (voitto != 0) { break; }
        
    }

    /*
    0 = omena
    1 = rypale
    2 = kirsikka
    3 = seiska
    4 = meloni
    */

    if (voitto != 0) {
        paivitaInfo('Voitit <strong>'+(voitto*panos)+'€</strong>!','alert-success');
        rahat += voitto*panos;
        document.querySelector('#rahamaara').innerText = rahat + ' €';
        voitot += voitto*panos;
    } else {
        paivitaInfo('Ei voittoa, yritä uudelleen!', 'alert-light');
    }

    if (ekaKierros && voitto == 0) {
        /* ensimmäinen pelaus ja ei voittoa --> sallitaan lukitukset */
        ekaKierros = false;
        document.querySelectorAll('.rullatjanappulat button').forEach((ele) => {
            ele.disabled = false;
        });
        paivitaInfo('Ei voittoa, yritä uudelleen! Voit myös käyttää lukitusta', 'alert-light');
    
    } else {
        ekaKierros = true;
        /* lukitse-nappulat pois käytöstä */
        document.querySelectorAll('.rullatjanappulat button').forEach((ele) => {
            ele.disabled = true;
            ele.classList.remove('active');
            ele.innerText = 'Lukitse';
        });

    }

    if (rahat == 0) {
        document.querySelectorAll('.pelialue button').forEach((bu) => {
            bu.disabled = true;
        });
        paivitaInfo('Peli päättyi, kiitos pelaamisesta', 'alert-primary');
        document.querySelector('#lopputeksti').innerHTML = (voitot == 0) ? 'Et voittanut pelin aikana yhtään kertaa' : 'Voitit pelissä yhteensä <strong>'+voitot+'€</strong>!';
        document.querySelector('#loppualert').style.display = 'initial';
    }
}

function tarkistaLukot(src) {
    let lukitut = [];

    document.querySelectorAll('.rullatjanappulat button').forEach((ele) => {
        if (ele.classList.contains('active')) {
            lukitut.push(ele.id);
        }
    });
    
    if (lukitut.length<3 || lukitut.includes(src.id)) {
        src.classList.toggle('active');
        src.innerText = (src.innerText == 'Lukitse') ? 'Lukittu' : 'Lukitse';
    } else {
        paivitaInfo('Kaikkia rullia ei voi lukita yhtäaikaa!','alert-danger');
    }
    

}

function paivitaInfo(teksti, tyyppi) {
    const alertDiv = document.querySelector('#alrt');

    /* poistetaan tällä hetkellä käytössä oleva luokka */
    for (let ln of alertDiv.classList.values()) {
        if (ln.indexOf('alert-') >= 0) {
            alertDiv.classList.remove(ln);
        }
    }
    /* ja asetetaan uudet teksti ja uusi luokka */
    document.querySelector('#alrtteksti').innerHTML = teksti;
    alertDiv.classList.add(tyyppi);
    
    /* animoidaan voittoteksti */
    if (tyyppi == 'alert-success') {
        document.querySelector('#alrtteksti').classList.add('voittoanim');
        setTimeout(() => {
            document.querySelector('#alrtteksti').classList.remove('voittoanim');
        }, 2500 );
    }
}

/* kuvien copyright-ilmoituksen paikka: jos selainikkuna on tarpeeksi korkea, siirretään ilmoitus alalaitaan */
if (document.querySelector('.container').scrollHeight < window.innerHeight-document.querySelector('nav').scrollHeight) {
    document.querySelector('#copyright').classList.add('position-fixed','start-50','translate-middle-x','bottom-0');
}
