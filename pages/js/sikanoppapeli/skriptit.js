let pelaajienlkm = noppienlkm = pisteraja = nykyinenpelaaja = tuplienlkm = vuoronpisteet = luku1 = luku2 = 0;

class pelaaja {
    constructor() {
        this.nimi = '';
        this.pistemaara = 0;
    }
}
const pelaajalista = [];

function tarkistaArvo(src,cond,chng) { /* src = source element, cond = ehto, chng = mihin src:n arvo päivitetään, jos ehto on totta */
    let check = src.value + cond;
    if (check == cond) { check = '0' + cond }
    if (!eval(check)) {
        /* jos ehto ei toteudu, lisätään luokka is-invalid ja estetään Aloita-napin käyttö*/
        src.classList.add('is-invalid');
        document.querySelector('#aloitabtn').classList.add('disabled');
    } else { 
        /* jos ehto toteutuu, poistetaan is-invalid-luokka jos se oli käytössä ja tarkistetaan voidaanko Aloita-napin käyttö sallia */
        if (src.classList.contains('is-invalid')) {
            src.classList.remove('is-invalid');
        }
        if (chng != '') { 
            /* kentän arvo pitää päivittää tekstiin */
            document.querySelector(chng).innerHTML = src.value;
        }
        /* tarkistetaan voidaanko Aloita-napin käyttö sallia */
        let ck = 0;
        document.querySelectorAll('.tarkistettava').forEach(ele => {
            if (ele.classList.contains('is-invalid')) { ck += 1 }
        });
        if (ck == 0) {
            document.querySelector('#aloitabtn').classList.remove('disabled');
        } else {
            document.querySelector('#aloitabtn').classList.add('disabled');
        }
    }
}

function paivitaSaannot(nlkm) {
    if (nlkm == 1) {
        document.querySelector('#noppasana').innerHTML = 'nopan';
        document.querySelector('#muuttuvateksti').innerHTML = 'Pelaajat pyörittävät noppaa vuorotellen. Jos pelaaja pyörittää numeron väliltä 2-6, se lisätään kierroksen pistemäärään. Mikäli pelaaja pyörittää numeron 1, kierroksen pistemäärä nollataan ja vuoro siirtyy seuraavalle.';
    } else {
        document.querySelector('#noppasana').innerHTML = 'noppien';
        document.querySelector('#muuttuvateksti').innerHTML = 'Pelaajat pyörittävät kahta noppaa vuorotellen. Jos pelaaja pyörittää nopilla eri luvut ja toinen luvuista ei ole 1, lisätään lukujen summa kierroksen pistemäärään.<br><br>Jos pelaaja pyörittää tuplan eli samat luvut molemmilla nopilla väliltä 2-6, saa hän pistemäärän kaksinkertaisena. Mikäli pelaaja pyörittää tuplan numerolla 1, saa hän 25 pistettä.<br><br>Jos pelaaja pyörittää numeron 1 vain toisella nopalla tai jos hän pyörittää tuplan kolme kertaa peräkkäin, kierroksen pisteet nollataan ja vuoro siirtyy seuraavalle.';
    }
}


/* tarkistetaan painetaanko nimikentässä enteriä --> jos painetaan, "klikataan" nappulaa */
function tarkistaEnter(eve) {
    if (eve.key == 'Enter' || eve.keyCode == 13) {
        eve.preventDefault();
        document.querySelector('#'+eve.target.id+'button').click();
    }
}

function nimiButtonPress(src) {
    /* onko nimikentä nappula sallittuna? */
    let lahde = src.id;
    let alku = lahde.slice(0,lahde.indexOf('-'));

    if (!document.querySelector('#'+alku+'-nimikenttabutton').classList.contains('disabled')) {
        let numero = alku.replace('pelaaja','');
        let arvo = document.querySelector('#'+alku+'-nimikentta').value;

        /* tarkasta ensin onko arvo tyhjä! */
        if (arvo != '') {
            document.querySelector('#'+alku+'-nimi').innerText = arvo;
        } else {
            /* nimikenttä on tyhjä, pelajaan nimeksi tulee Pelaaja #numero */
            arvo = document.querySelector('#'+alku+'-nimikentta').value = document.querySelector('#'+alku+'-nimi').innerText = 'Pelaaja #'+numero;
        }

        pelaajalista[Number(numero)-1].nimi = arvo;

        /* onko viimeinen pelaaja? */
        if (!seuraavaNimi(numero)) {
            /* oli viimeinen pelaaja, odotetaan collapse loppuun ja aloitetaan peli */
            document.querySelector('#pelaaja'+numero+'-collapsebutton').addEventListener('hidden.bs.collapse', odotaCollapse());
        }
    }

}

function odotaCollapse() { /* jatketaan tästä kun nimensyöttöjen jälkeen viimeisen elementin collapse on tapahtunut */
    document.querySelector('#pelaaja'+pelaajienlkm+'-collapsebutton').removeEventListener('hidden.bs.collapse', odotaCollapse);
    /* pelikierroksen aloitus pienellä viiveellä */
    setTimeout(() => {
        document.querySelectorAll('.nimenkysely').forEach(ele  => {
            ele.classList.add('piilossa');
        });
        document.querySelectorAll('.pelikierros').forEach(ele  => {
            ele.classList.remove('piilossa');
        });
        
        /* poistetaan näkyvistä kaikkien pelaajien "kortit" */
        for(let i=1;i<=pelaajienlkm;i++) {
            document.querySelector('#pelaaja'+i+'-collapsetarget').classList.remove('show');
        }
        
        nykyinenpelaaja = 1;
        pelivuoro(true);
    }, 250);
}

function pelivuoro(pelaajavaihtui) { /* pelaajavahtui = true jos vuoro vaihtui seuraavalle pelaajalle */
    let noppasana = (noppienlkm == 1) ? 'noppaa' : 'noppia';
    document.querySelector('#statusrivi').innerText = 'Pyöritetään '+noppasana;

    luku1 = rnd();
    luku2 = (noppienlkm == 2) ? rnd() : 0;
    

    if (pelaajavaihtui) { /* pelaajan ensimmäinen pyöräytys */
        tuplienlkm = 0;
        vuoronpisteet = 0;

        /* ensimmäisellä heitolla ei tule ykköstä */
        const uusi = [4,2,5,3,6];
        luku1 = (luku1 == 1) ? uusi[Math.round(Math.random()*4)] : luku1;
        luku2 = (luku2 == 1) ? uusi[Math.round(Math.random()*4)] : luku2;

        if (!document.querySelector('#pelaaja'+nykyinenpelaaja+'-collapsebutton').classList.contains('show')) {
            document.querySelector('#pelaaja'+nykyinenpelaaja+'-collapsebutton').click();
        }

        for(let i=1;i<=pelaajienlkm;i++) {
            document.querySelector('#pelaaja'+i+'-kortti').classList.remove('border-primary');    
        }
        document.querySelector('#pelaaja'+nykyinenpelaaja+'-kortti').classList.add('border-primary');
        document.querySelector('#nykyinenpelaaja').innerText = pelaajalista[nykyinenpelaaja-1].nimi;
    }

    /* nappulat pois käytöstä noppien pyörimisen ajaksi */
    document.querySelectorAll('.napit button').forEach(itm => {
        itm.classList.add('disabled');
    });

    /* nopat pyörimään */
    paivitanoppa(luku1,1);
    if (luku2) {
        paivitanoppa(luku2,2);
    }

    /* alustetaan transitionend event jos sitä ei ole aiemmin tehty */
    if (document.querySelector('#noppa1').ontransitionend == null) {
        document.querySelector('#noppa1').ontransitionend = () => {
            /* kun ensimmäinen noppa pysähtyvät tehdään seuraavaa */
            let vuorosiirtyy = false;

            switch (noppienlkm) {
                case 1: /* yhden nopan säännöt */
                    if (luku1 == 1) {
                        /* ykkönen: kierroksen pisteet nollataan ja vuoro siirtyy seuraavalle */
                        document.querySelector('#statusrivi').innerText = 'Voi ei, pyöritit ykkösen. Menetät kierroksen pisteet!';
                        vuoronpisteet = 0;
                        vuorosiirtyy = true;
                    } else {
                        document.querySelector('#statusrivi').innerText = 'Pyöritit '+luku1+', haluatko jatkaa?';
                        vuoronpisteet += luku1;
                    }
                    break;
                case 2:
                    /* kahden nopan säännöt */
                    if (luku1 == luku2 ) { /* tupla */
                        /* tuliko kolmannet tuplat? */
                        tuplienlkm += 1;
                        if (tuplienlkm == 3) {
                            document.querySelector('#statusrivi').innerText = 'Voi ei, kolmet tuplat peräkkäin! Menetät pisteet!';
                            vuoronpisteet = 0;
                            vuorosiirtyy = true;
                        } else if (luku1 == 1) {
                            /* tupla ykkönen */
                            document.querySelector('#statusrivi').innerText = 'Mahtavaa! Pyöritit kaksi ykköstä, saat 25 pistettä!';
                            vuoronpisteet += 25;
                            } else {
                                /* tuplana muu kuin ykkönen */
                                document.querySelector('#statusrivi').innerText = 'Pyöritit tuplan! Saat pisteet tuplana eli '+luku1*4+' pistettä!';
                                vuoronpisteet += 4*luku1;
                            }
                    } else {
                        /* ei ainakaan tuplia */
                        tuplienlkm = 0;
                        if (luku1 == 1 || luku2 == 1) {
                            /* toisella nopalla ykkönen */
                            document.querySelector('#statusrivi').innerText = 'Voi ei, pyöritit ykkösen. Menetät kierroksen pisteet!';
                            vuoronpisteet = 0;
                            vuorosiirtyy = true;
                        } else {
                            /* kaksi eri lukua, joista kumpikaan ei ole ykkönen */
                            document.querySelector('#statusrivi').innerText = 'Pyöritit '+(luku1+luku2)+', haluatko jatkaa?';
                            vuoronpisteet += luku1 + luku2;
                            
                        }
                    }
                    break;
            }

            document.querySelector('#pelaaja'+nykyinenpelaaja+'-kierpisteet').innerText = vuoronpisteet;

            if (vuorosiirtyy) {
                setTimeout(pelivuoroSeuraavalle, 2000);
            } else {
                document.querySelectorAll('.napit button').forEach(itm => {
                    itm.classList.remove('disabled');
                });

                if (document.activeElement.type != 'button') {
                    document.querySelector('#jaabutton').focus();
                }
                

                if (vuoronpisteet + pelaajalista[nykyinenpelaaja-1].pistemaara >= pisteraja) {
                    document.querySelector('#statusrivi').innerText = 'Jää tähän, pisteesi riittävät jo voittoon!';
                }
            }
        } /* end transitionend*/
    }
}

function pelivuoroSeuraavalle() {
    const pist = pelaajalista[nykyinenpelaaja-1].pistemaara + vuoronpisteet;
    document.querySelector('#pelaaja'+nykyinenpelaaja+'-yhtpisteet').innerText = pist;
    document.querySelector('#pelaaja'+nykyinenpelaaja+'-pistebadge').innerText = pist + ' pistettä';
    document.querySelector('#pelaaja'+nykyinenpelaaja+'-kierpisteet').innerText = '0';

    pelaajalista[nykyinenpelaaja-1].pistemaara = pist;

    /* tarkistetaan onko pelaaja voittanut */
    if (pist >= pisteraja) {
        /* pelaaja voittaa, poistetaan nappulat käytöstä */
        document.querySelectorAll('.napit button').forEach(itm => {
            itm.classList.add('disabled');
        });
        document.querySelector('#voittajannimi').innerText = pelaajalista[nykyinenpelaaja-1].nimi;
        document.querySelector('#voittajanpisteet').innerText = pist;
        document.querySelector('#voittoviesti').style.display = 'initial';
        document.querySelector('#voittoviesti').style.zIndex = 100;
        document.querySelector('#voittajannimi').style.animation = 'zoomi 1s ease 1s 2 alternate';
        document.querySelector('#playagain').focus();

    } else {
        /* ei voittoa, pelivuoro siirtyy seuraavalle */
        if (document.querySelector('#pelaaja'+nykyinenpelaaja+'-collapsetarget').classList.contains('show')) {
            document.querySelector('#pelaaja'+nykyinenpelaaja+'-collapsebutton').click();
        }
    
        nykyinenpelaaja = (nykyinenpelaaja+1 <= pelaajienlkm) ? nykyinenpelaaja+1 : 1;
        
        if (!document.querySelector('#pelaaja'+nykyinenpelaaja+'-collapsetarget').classList.contains('show')) {
            document.querySelector('#pelaaja'+nykyinenpelaaja+'-collapsebutton').click();
        }
    
        pelivuoro(true);
    }

}

const sanat = ['','','Toinen','Kolmas','Neljäs','Viides','Kuudes','Seitsemäs','Kahdeksas','Yhdeksäs'];

function seuraavaNimi(nykyinen) {
    let onViimeinen = (nykyinen == pelaajienlkm) ? true : false;
    let seuraava = Number(nykyinen) + 1;

    document.querySelector('#pelaaja'+nykyinen+'-collapsebutton').click();
    document.querySelector('#pelaaja'+nykyinen+'-kortti').classList.remove('border-primary');

    if (!onViimeinen) {
        if (!document.querySelector('#pelaaja'+seuraava+'-collapsetarget').classList.contains('show')) {
            document.querySelector('#pelaaja'+seuraava+'-collapsebutton').click();
        }
        document.querySelector('#pelaaja'+seuraava+'-kortti').classList.add('border-primary');
        document.querySelector('#pelaaja'+seuraava+'-nimikenttabutton').classList.remove('disabled');
        if (seuraava < sanat.length) {
            document.querySelector('#nykyinenpelaaja').innerText = sanat[seuraava]+' pelaaja';
        } else {
            document.querySelector('#nykyinenpelaaja').innerText = seuraava + '. pelaaja';
        }

        document.querySelector('#pelaaja'+seuraava+'-nimikentta').focus();
    }

    return !onViimeinen; /* palautetaan true jos ei ollut viimeinen, false jos oli */
}


function aloita() {
    
    const aloitusDiv = document.querySelector('#aloitus');
    document.querySelector(':root').style.setProperty('--korkeus',getComputedStyle(aloitusDiv).height);


    pelaajienlkm = Number(document.querySelector('#pellkm').value);
    noppienlkm = Number(document.querySelector('#noplkm').value);
    pisteraja = Number(document.querySelector('#voittavapstm').value);
    
    aloitusDiv.classList.add('haipyy');

    for (let i = 0;i<pelaajienlkm;i++) {
        lisaaPelaaja(i+1);
    }

    if (noppienlkm == 1) {
        document.querySelector('#noppa2-alue').classList.add('piilossa');
    } else {
        document.querySelector('#noppa2-alue').classList.remove('piilossa');
        document.querySelector('#pyoritabutton').innerText = 'Pyöritä noppia';
    }

    document.querySelector('#toiminta-alue').classList.remove('piilossa');

}

function lisaaPelaaja(nro) { /* kloonataan templatesta jokaiselle pelaajalle oma "kortti" */

    const sijoituspaikka = document.querySelector('#pelaajalista');
    const kortti = document.querySelector('#korttitemplate');
    const klooni = kortti.content.cloneNode(true);

    /* päivitetään kloonin tiedot vastaamaan pelaajan numeron mukaisia tietoja */
    klooni.querySelector('#pelaajanimi').innerHTML = 'Pelaaja #'+nro;
    klooni.querySelector('#pelaajanimi').id = 'pelaaja'+nro+'-nimi';
    klooni.querySelector('#pelaajapisteet-badge').id = 'pelaaja'+nro+'-pistebadge';
    klooni.querySelector('.card-header').setAttribute('data-bs-target','#pelaaja'+nro+'-collapsetarget');
    klooni.querySelector('#collapsetarget').id = 'pelaaja'+nro+'-collapsetarget';
    klooni.querySelector('#pelaajanimikentta').id = 'pelaaja'+nro+'-nimikentta';
    klooni.querySelector('#pelaajanimikenttabutton').id = 'pelaaja'+nro+'-nimikenttabutton';
    klooni.querySelector('#pelaajayhtpisteet').id = 'pelaaja'+nro+'-yhtpisteet';
    klooni.querySelector('#pelaajakierpisteet').id = 'pelaaja'+nro+'-kierpisteet';
    klooni.querySelector('#pelaajakortti').id = 'pelaaja'+nro+'-kortti';
    klooni.querySelector('#pelaajacollapsebutton').id = 'pelaaja'+nro+'-collapsebutton';

    sijoituspaikka.appendChild(klooni);

    let pel = new pelaaja();
    pelaajalista.push(pel);

    /* lisätäänkö viimeistä? Jos lisätään, niin näytetään ensimmäisen pelaajan kortti */
    if (nro == pelaajienlkm) {
        document.querySelector('#pelaaja1-collapsetarget').classList.add('show');
        document.querySelector('#pelaaja1-kortti').classList.add('border-primary');
        document.querySelector('#pelaaja1-nimikenttabutton').classList.remove('disabled');
        document.querySelector('#pelaaja1-nimikentta').focus();
    }
    
}

function rnd() { /* palauttaa satunnaisluvun yhden ja kuuden väliltä */
    return Math.floor(Math.random() * 6) + 1;
}

const noppakaannot = [
    'rotate3d(1,1,1,360deg)',
    'rotate3d(0,1,0,-450deg)',
    'rotate3d(1,0,0,450deg)',
    'rotate3d(1,0,0,-810deg)',
    'rotate3d(0,1,0,810deg)',
    'rotate3d(0,-1,0,540deg)'
]

let edelliset = [0,0];

function paivitanoppa(numero,nopannro) { /* nopan pyöritykset, numero = numero jonka nopan tulee näyttää, nopannro = kumpi noppa näyttää numeron */
    if (numero > 0 && numero < 7) {
        const noppa = document.querySelector('#noppa'+nopannro);
        if (edelliset[nopannro-1] != numero) {
            noppa.style.transform = noppakaannot[numero-1];
        } else {
            /* sama numero kuin edellisellä heitolla, pyöritetään noppaa 360 astetta  */
            let kaanto = noppa.style.transform;
            let asteet = kaanto.split(',')[3].replace('deg)','');
            /* asteet = Number(asteet); */
            let uudet_asteet = Number(asteet) + 360;
            kaanto = kaanto.replace(String(asteet),uudet_asteet)
            noppa.style.transform = kaanto;
        }
        edelliset[nopannro-1] = numero;
    }
}

document.querySelector('#pellkm').focus();
