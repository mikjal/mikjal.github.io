// Määritellään globbalit vakiot/muuttujat ensin
const nimenkysely = document.getElementById('nimenkysely');
const nimilista = document.getElementById('nimilista');
const nimilomake = document.getElementById('nimiformi');
const tekstikentta = document.getElementById('nimen-input');
const nimet = [];
let nimenSaaLisata = true;

// Alustetaan kyselylomakkeelle korkeus että animointi toimii oikein
nimenkysely.style.maxHeight = nimenkysely.scrollHeight + "px";

// Tarkkaillaan lomakkeen tekstikentän muuttumista
tekstikentta.addEventListener('input', tarkistaButton);

// Funktio: Tarkistetaan onko tekstikentässä tekstiä ja disabloidaan tai enabloidaan nappula sen mukaan
function tarkistaButton() {
    const nimibtnclasses = document.getElementById('nimen-button').classList;
    if (tekstikentta.value.length == 0) {
        nimibtnclasses.replace('enabled','disabled');
    } else if (nimibtnclasses.contains('disabled')) {
        nimibtnclasses.replace('disabled','enabled');
    }    
};

// Toiminto lomakkeen submitin käsittely
nimilomake.addEventListener('submit', (event) => {
    event.preventDefault();
    const sbmtButton = document.getElementById('nimen-button');
    // Tarkistetaan onko Lisää nimi nappula aktiivinen eli voidaanko nimi lisätä
    if (sbmtButton.classList.contains('enabled')) {
        nimet.push(tekstikentta.value);
        if (nimet.length < 10) {
            pikkuteksti(nimet.length);
            tekstikentta.value = '';
            tarkistaButton();
            tekstikentta.focus();
        } else if (nimenSaaLisata == true) {
            nimenSaaLisata = false;
            const listaryhma = document.getElementById('listaryhma').children;
            for (let i=0;i<nimet.length;i++) {
                listaryhma[i].textContent = nimet[i];
            }
            // Kyselylomake piiloon
            nimenkysely.style.maxHeight = 0;
            // Nimilista näkyville
            nimilista.style.maxHeight = nimilista.scrollHeight + "px";
        }
    }
});

// Funktio: tekstikentän alapuolella olevan pikkutekstin muuttaja
function pikkuteksti(luku) {
    const numerot = ['ensimmäistä', 'toista', 'kolmatta', 'neljättä', 'viidettä', 'kuudetta', 'seitsemättä', 'kahdeksatta', 'yhdeksättä','kymmenettä'];
    document.getElementById('aputeksti').innerHTML = 'Lisäät ' + numerot[luku] + ' nimeä';
}

// Toiminnot listan alapuolella oleva nappulan painamiseen
document.getElementById('uudelleen-button').addEventListener('click', () => {
    // Nollataan tilanne
    nimet.length = 0;
    pikkuteksti(nimet.length);
    tekstikentta.value = '';
    tarkistaButton();
    nimenSaaLisata = true;
    tekstikentta.focus();
    // Kyselylomake näkyville
    nimenkysely.style.maxHeight = nimenkysely.scrollHeight + "px";
    // Nimilista piiloon
    nimilista.style.maxHeight = 0;
    
});

// Asetetaan focus tekstikenttään
tekstikentta.focus();
