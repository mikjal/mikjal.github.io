// HTML Form to Google Sheet (c) Levi Nunnink
// https://nunn.ink/


function tarkistaFormi() {
    const elementit = document.querySelector('#lomake').elements;
    let okCount = eleCount = 0;
    let firstFail;

    for (let i=0; i<elementit.length; i++) {
        if (elementit[i].type != 'textarea' && elementit[i].type != 'submit') {
            eleCount += 1;
            let e = elementit[i];
            switch (e.id) {
                case 'kaid': // käyttäjä ID
                    if (e.value.length == 0) {
                        document.querySelector('#kaid_emsg').innerHTML = 'Kirjoita käyttäjä ID!'
                        asetaTila(e,'is-invalid');
                    } else if (e.value.length < 6) {
                        document.querySelector('#kaid_emsg').innerHTML = 'Minimipituus on 6 merkkiä!'
                        asetaTila(e,'is-invalid');
                    } else if (!Boolean(e.value.match(/^[A-Öa-ö0-9-]*$/))) {
                        document.querySelector('#kaid_emsg').innerHTML = 'Sisältää kiellettyjä merkkejä!'
                        asetaTila(e,'is-invalid');
                    } else {
                        asetaTila(e, 'is-valid');
                        okCount += 1;
                    }
                    break;
                case 'ponu': // postinumero
                    if (e.value.length == 0) {
                        document.querySelector('#ponu_emsg').innerHTML = 'Kirjoita postinumero!'
                        asetaTila(e,'is-invalid');
                    } else if (e.value.length != 5 || isNaN(e.value)) {
                        document.querySelector('#ponu_emsg').innerHTML = 'Pitää olla 5 numeroa!'
                        asetaTila(e,'is-invalid');
                    } else {
                        asetaTila(e,'is-valid');
                        okCount += 1;
                    }
                    break;
                case 'maa': // maa
                    if (e.value == 'none') {
                        asetaTila(e, 'is-invalid');
                    } else {
                        asetaTila(e, 'is-valid')
                        okCount += 1;
                    }
                    break;
                case 'mies': // sukupuoli
                case 'nainen':
                    if (!document.querySelector('#mies').checked && !document.querySelector('#nainen').checked) {
                        const kohteet = document.getElementsByName('sukupuoli');
                        for (let i=0; i<kohteet.length; i++) {
                            asetaTila(kohteet[i], 'is-invalid');
                        }
                    } else {
                        const kohteet = document.getElementsByName('sukupuoli');
                        for (let i=0; i<kohteet.length; i++) {
                            asetaTila(kohteet[i], 'is-valid');
                        }
                        okCount += 1;
                    }
                    break;
                case 'spos': // sähköposti
                    const sallittu = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    if (!sallittu.test(e.value)) {
                        asetaTila(e, 'is-invalid');
                    } else {
                        asetaTila(e, 'is-valid');
                        okCount += 1;
                    }
                    break;
                case 'kielisuomi': // kieli
                case 'kielimuu':
                    if (document.querySelector('#kielisuomi').checked || document.querySelector('#kielimuu').checked) {
                        const kohteet = document.getElementsByClassName('inpchk');
                        for (let i=0; i<kohteet.length; i++) {
                            asetaTila(kohteet[i], 'is-valid');
                        }
                        okCount += 1;
                    } else {
                        const kohteet = document.getElementsByClassName('inpchk');
                        for (let i=0; i<kohteet.length; i++) {
                            asetaTila(kohteet[i], 'is-invalid');
                        }
                    }
                    break;
                default: // kaikki muut
                    if (e.value.length < 2) {
                        asetaTila(e, 'is-invalid');
                    } else {
                        asetaTila(e, 'is-valid');
                        okCount += 1;
                    }
            } // End switch
            if (okCount < eleCount && typeof firstFail == 'undefined') {
                firstFail = e;
            }
        } // End if
    } // End for

    if (typeof firstFail != 'undefined') {
       firstFail.focus();
    }

    return (okCount == eleCount) ? true : false;
}

// SUBMIT
document.querySelector('#lomake').addEventListener('submit',(event) => {
    event.preventDefault();

    if (tarkistaFormi()) {
        const data = new FormData(document.querySelector('#lomake'));
        const action = event.target.action;
        fetch(action, {
            method: 'POST',
            body: data,
        });

        document.querySelector('div.alert').style.opacity = 1;

        setTimeout(() => {
            document.querySelector('div.alert').style.opacity = 0;
        }, 3000);
        nollaa();
    }
});

function nollaa() {
    document.querySelector('#kaid').focus();
    const elementit = document.querySelector('#lomake').elements;
    for (let i=0; i<elementit.length; i++) {
        if (elementit[i].type != 'textarea' && elementit[i].type != 'submit') {
            if (elementit[i].classList.contains('is-valid')) {
                elementit[i].classList.remove('is-valid');
            }
        }
    }
    document.querySelector('#lomake').reset();
}


function asetaTila(kohde, luokka) {
    if (luokka == 'is-valid' || luokka == 'is-invalid') {
        let poistettava = (luokka == 'is-valid') ? 'is-invalid' : 'is-valid';
        if (kohde.classList.contains(poistettava)) {
            kohde.classList.remove(poistettava);
        }
        kohde.classList.add(luokka);

    }
}

document.querySelector('#kaid').focus();