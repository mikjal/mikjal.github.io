// Globaalit vakiot
let cels2Fahr = true;
let ekaKerta = true;

// Muunnostyypin vaihto
document.getElementById('selectCF').addEventListener('change', () => {
    const selectArvo = document.getElementById('selectCF').value;
    document.getElementById('yksikko').innerHTML = '&deg' + selectArvo;
    cels2Fahr = (selectArvo == 'C') ? true : false;
});

// Lomakkeen submit
document.getElementById('lomake').addEventListener('submit', (event) => {
    event.preventDefault();
    const tulosKortti = document.getElementById('tuloskortti');
    const tekstikentta = document.getElementById('inputaste');
    let arvo = tekstikentta.value.replace(',','.');

    if (isNaN(arvo) || arvo == '') {
        tekstikentta.classList.add('is-invalid');
    } else {
        document.getElementById('vastausotsikko').innerText = tekstikentta.value + ' ' + document.getElementById('yksikko').innerText + ' on';
        let vastaus, nollapiste;

        if (cels2Fahr) {
            vastaus = (arvo * 1.8 + 32).toFixed(document.getElementById('selectDes').value) + ' &degF';
            nollapiste = arvo;
        } else {
            vastaus = ((arvo - 32) / 1.8).toFixed(document.getElementById('selectDes').value);
            nollapiste = vastaus;
            vastaus += ' &degC';
        }
        
        document.querySelector('#nollapiste').style.opacity = (nollapiste < -273.15) ? 1 : 0;
        document.querySelector('#vastaus').innerHTML = vastaus;

        if (ekaKerta == true) {
            tulosKortti.classList.add('mt-3');
            tulosKortti.style.opacity = 1;
            tulosKortti.style.maxHeight = 'initial';
            ekaKerta = false;
        } else {
            document.querySelector('#vastaus').style.animation = 'zoom 1s';
            setTimeout(() => {
                document.querySelector('#vastaus').style.animation = 'none';
            },1010)
        }

    }
});

// tekstikentän muutos
document.getElementById('inputaste').addEventListener('input',() => {
    if (document.querySelector('#inputaste').classList.contains('is-invalid')) {
        document.getElementById('inputaste').classList.remove('is-invalid');
    }
});

document.getElementById('inputaste').focus();
