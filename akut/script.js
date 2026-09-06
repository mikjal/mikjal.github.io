// =========================================================
// AKU ANKAN TASKUKIRJAT
// script.js
// =========================================================


// =========================================================
// SUPABASE
// =========================================================

const SUPABASE_URL =
    "https://haiohgzdfusksjyesmun.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_m2M7-mHwydQvF42UUpA9WQ_kbvLJQG1";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =========================================================
// ASETUKSET
// =========================================================

//const QUICK_LINK_STEP = 50;

//const QUICK_LINK_MAX = 550;
//const QUICK_LINK_MAX = aa_nimet.length;


// =========================================================
// TILAMUUTTUJAT
// =========================================================

let ownedBooks = [];
let editMode = false;


// =========================================================
// DOM-ELEMENTIT
// =========================================================

const bookList = document.getElementById("book-list");
const quickLinks = document.getElementById("quick-links");
const editModeButton = document.getElementById("edit-mode-button");
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const stats = document.getElementById("stats");
const last_update = document.getElementById("last-update");

const dropdown = document.querySelector(".dropdown");
const dropdown_bookser = document.querySelector(".dropdown-bookser");

const dropdownButton = document.querySelector(".dropdown-button");
const dropdownButton2 = document.querySelector(".book-series-button");

let aa_data = [], rs_data = [], t2_data= [], tp_data = [], mr_data=[];

// Luodaan kaikki Aku Ankan taskukirjojen tiedot
aa_nimet.forEach(
    function (da, index) {
        let sn=(index+1).toString();
        while (sn.length<3) { sn = "+"+sn; }
        let ext = (index+1 == 534 || index+1 == 540) ? ".png" : ".jpg";
        let data = {
            id: "AATK"+sn,
            na: "Nro " + (index+1),
            ti: da[0],
            st: da[1],
            co: "aa-" + (index+1) + ext
        };
        aa_data.push(data);
    }
);

// Luodaan Roope-Setien tiedot
rs_partial_data.forEach(
    function (da, index) {
        let sn = "";
        if (da[0].length>0) {
            const snarr = da[0].split("-");
            sn = "("+snarr[1]+"/"+snarr[0]+")";
        }
        let data = {
            id: "RS" + da[0],
            na: "Nro " + (index+1) + " " + sn,
            ti: da[1],
            st: "",
            co: "rs-" + (index+1) + ".jpg"
        }
        rs_data.push(data);
    }
)

// Luodaan Aku Ankan Super-taskukirjojen tiedot
ts_partial_data.forEach(
    function(da, index) {
        let sn=(index+1).toString();
        while (sn.length<3) { sn = "+"+sn; }
        let data = {
            id: "AAST" + sn,
            na: "Supertaskari nro "+(index+1)+" ("+da[1]+")",
            ti: da[0],
            st: "",
            co: "aast-"+(index+1)+".jpg"
        }
        t2_data.push(data);
    }
)

// Luodaan Aku Ankan teema-taskukirjojen tiedot
tt_partial_data.forEach(
    function(da, index) {
        let sn=(index+1).toString();
        while (sn.length<3) { sn = "+"+sn; }
        let data = {
            id: "AATT"+sn,
            na: "Taskarin teemanumero " + (index+1) + " (" + da[1]+")",
            ti: da[0],
            st: "",
            co: "aatt-"+(index+1)+".jpg"
        }
        t2_data.push(data);
    }
)

tp_partial_data.forEach(
    function(da) {
        let ext = (da.id == "2024LT") ? ".png" : ".jpg";
        let data = {
            id: da.id,
            na: da.na + " (" + da.id.slice(0,4)+")",
            ti: da.ti,
            st: da.st,
            co: da.id.toLowerCase() + ext
        }
        tp_data.push(data);
    }
)

mr_partial_data.forEach(
    function(da) {
        let name = (da.st.toLowerCase().includes("lahja")) ? "Tilaajalahja" : 
                   (da.st.toLowerCase().includes("englanninoppia")) ? "Erikoispainos" :
                   (da.st.toLowerCase().includes("mukana")) ? "Liite" :
                   (da.st.toLowerCase().includes("vuosikerta")) ? "Vuosikerta" :
                   (da.st.toLowerCase().includes("näytelehti")) ? da.st :
                   (da.st.toLowerCase().includes("juhlistaa")) ? "Juhla-albumi":
                   "";
        let addtext = (da.id.includes("-") || da.id.at(4) == "E" || da.id.at(4) == "N") ? da.id.slice(0,4):
                      (da.id.at(4) == "A" || da.id.at(4) == "B") ? da.id.slice(-2).replace("0","") + da.id.at(4) + "/" + da.id.slice(0,4) :
                      da.id;
        let data = {
            id: da.id,
            na: name + " (" + addtext + ")",
            ti: da.ti,
            st: (da.st == "Tilaajalahja" || da.st == "Näytelehti") ? "" : da.st,
            co: "rs-"+da.id.toLowerCase() + ".jpg"
        }
        mr_data.push(data);
    }
)

function setTableName(tablename) {
    const bl = document.getElementById('book-list');
    bl.setAttribute('data-table',tablename);
}

function setTableMax(max) {
    const bl = document.getElementById('book-list');
    bl.setAttribute('data-max',max);
}

function getTableName() {
    const bl = document.getElementById('book-list');
    return bl.getAttribute('data-table');
}

function getTableMax() {
    const bl = document.getElementById('book-list');
    return bl.getAttribute('data-max');
}

// =========================================================
// SIVUN KÄYNNISTYS
// =========================================================

document.addEventListener("DOMContentLoaded", function() {
    // tarkista session storage
    if (sessionStorage.getItem('series')) {
        showSeries(sessionStorage.getItem('series'));
    } else {
        showSeries("aa");
    }
    //initializePage("aa",aa_data);
});

async function readLastUpdateTime(table) {
    const { data, error } = await supabaseClient
    .from('upd')
    .select('paivitetty')
    .eq('nimi', table)
    .single();

    if (error) {
        console.error('Virhe haettaessa viimeisintä päivtysaikaa: ', error);
    } else {
        const p_aika = new Date(data.paivitetty)
        const const_text = document.createElement("p");
        const_text.textContent = "Sivun tietoja on muokattu viimeksi";
        const update_text = document.createElement("p");
        const dows = ["sunnun","maanan","tiis","keskiviikko","tors","perjan","lauan"];
        const dow = p_aika.getDay();
        update_text.textContent = (dow == 3) ? dows[dow]+ "na " : dows[dow]+ "taina " + p_aika.toLocaleString();

        last_update.innerHTML = "";
        last_update.appendChild(const_text);
        last_update.appendChild(update_text);

       /*  console.log(table+'-taulun päivitysaika:', p_aika); */
}
}

dropdown_bookser.querySelectorAll(".series-link").forEach(
    function(itm) {
        itm.addEventListener("click", function(event) {
            event.stopPropagation();
            let ser = event.target.id.replace("menu-","");
            if (ser != sessionStorage.getItem("series")) {
                closedropdown_bookser();
                showSeries(ser);
            }

        })
});

function showSeries(nimi) {

    if (dropdown_bookser) {
        dropdown_bookser.querySelectorAll("a").forEach(
            function(itm) {
                itm.classList.remove('disabled');
            }
        )
    }

    selseries = nimi;
    switch(nimi) {
        default:
        case "aa":
            document.querySelector('#menu-aa').classList.add('disabled');
            document.querySelector('#seriestitle').innerHTML = "Akun Ankan taskukirjat";
            sessionStorage.setItem('series','aa');
            setTableName('aa');
            setTableMax(aa_data.length);
            initializePage("aa",aa_data);
            break;
        case "rs":
            document.querySelector('#menu-rs').classList.add('disabled');
            document.querySelector('#seriestitle').innerHTML = "Roope-Sedät";
            sessionStorage.setItem('series','rs');
            setTableName('rs');
            setTableMax(rs_data.length);
            initializePage("rs",rs_data);
            break;
        case "t2":
            document.querySelector('#menu-t2').classList.add('disabled');
            document.querySelector('#seriestitle').innerHTML = "Super ja Teema-taskukirjat";
            sessionStorage.setItem('series','t2');
            setTableName('t2');
            setTableMax(t2_data.length);
            initializePage("t2",t2_data);
            break;
        case "tp":
            document.querySelector('#menu-tp').classList.add('disabled');
            document.querySelector('#seriestitle').innerHTML = "Taskarispesiaalit";
            sessionStorage.setItem('series','tp');
            setTableName('tp');
            setTableMax(tp_data.length);
            initializePage("tp",tp_data);
            break;
        case "mr":
            document.querySelector('#menu-mr').classList.add('disabled');
            document.querySelector('#seriestitle').innerHTML = "Muut Roope-Sedät";
            sessionStorage.setItem('series','mr');
            setTableName('mr');
            setTableMax(mr_data.length);
            initializePage("mr",mr_data);
            break;
    }
}

function updateStats(cur,max) {
    if (cur > 0) {
        const owned_text = document.createElement("p");
        const pros = (cur/max*100);
        owned_text.innerHTML = "Omistan <b>"+ cur +"</b> kirjaa ("+ pros.toFixed(1).replace(".",",") +"%) tämän sivun <b>"+max+"</b> kirjasta.";

        const owned_bar = document.createElement("div");
        owned_bar.className = "owned-bar";

        const owned_fill = document.createElement("span");
        owned_fill.style = "width: "+pros.toFixed()+"%;";
        let cnames = (pros > 95) ? "owned-fill owned-fill-end" : "owned-fill";
        owned_fill.className = cnames;

        owned_bar.appendChild(owned_fill);

        stats.innerHTML = "";
        stats.appendChild(owned_text);
        stats.appendChild(owned_bar);
    } else {
        stats.innerHTML = "";
    }

}

async function initializePage(sername, data) {

    const max = data.length;
    let step = (max < 80) ? 10 : (max < 160) ? 20 : (max < 240) ? 40 : 50;
    // Luodaan pikavalinnat.
    createQuickLinks(step,data.length);

    document.getElementById('odota').classList.add('nayta');

    // Haetaan omistustiedot.
    await loadOwnership(sername);

    // Luodaan kirjalista.
    createBookList(sername, data);


    /*
     * Tarkistetaan, onko käyttäjällä
     * jo aktiivinen Supabase-istunto.
     */

    await checkExistingSession();
    await readLastUpdateTime(sername);

    document.getElementById('odota').classList.remove('nayta');

   updateStats(ownedBooks.length,data.length);
 
   document.querySelector('#stats').scrollIntoView('{ block: "start", behavior: "instant"}');
}


// =========================================================
// PIKAVALINNAT
// =========================================================

function createQuickLinks(step, max) {

    if (!quickLinks) {
        console.error("#quick-links puuttuu.");
        return;
    }


    quickLinks.innerHTML = "";

    let numu = [1];
//    for (let nunu= QUICK_LINK_STEP; nunu <= QUICK_LINK_MAX; nunu += QUICK_LINK_STEP) {
    for (let nunu= step; nunu < max; nunu += step) {
        numu.push(nunu);
    }
    if (numu.at(-1)<max) numu.push(max);


/*
    for (
        let number = QUICK_LINK_STEP;
        number <= QUICK_LINK_MAX;
        number += QUICK_LINK_STEP
    ) {
*/
    for (let i=0; i<numu.length; i++)
    {
        let number = numu[i];

        if (number > max) {
            continue;
        }

        const link = document.createElement("a");
        link.className = "quick-link";
        link.href = "#book-" + number;
        link.textContent = number;
        link.addEventListener("click", function () {
                closeDropdown();
                closeMobileMenu();
            }
        );

        quickLinks.appendChild(link);

    }

}


// =========================================================
// KIRJALISTA
// =========================================================

function createBookList(sername, data) {

    if (!bookList) {
        console.error("#book-list puuttuu.");
        return;
    }

    bookList.innerHTML = "";

    /*
     * Yksi kirja jokaista nimeä kohti.
     */

    data.forEach(
        function (itm, index) {
            createBook(itm, index+1, sername);
        }
    );

}

function fileExists(url) {
    let httpreq = new XMLHttpRequest();
    httpreq.open('HEAD',url,false);
    httpreq.send();

    return httpreq.status != 404;
}

// =========================================================
// YKSITTÄISEN KIRJAN LUOMINEN
// =========================================================

function createBook(itm,ndx,sername) {

    const book = document.createElement("article");

    book.className = "book";
    book.id = "book-" + ndx;
    // book.setAttribute("data-table",sername);

    // -----------------------------------------
    // Kansikuva
    // -----------------------------------------

    const image = document.createElement("img");

    image.className = "book-cover";
    image.alt = itm.ti;
    image.src = "images/" + itm.co;
    image.loading = 'lazy'; 
    image.width = 80;
    image.height = 121;

    let svg = (sername == "aa" || sername == "rs") ? 
        // kun kuvaa ei löydy, näytetään tilalla harmaa suorakulmio
        // jos kirjasarja on taskukirjat tai Roope-Sedät, näytetään numero
        "data:image/svg+xml," +
        "<svg xmlns='http://www.w3.org/2000/svg' " +
        "width='80' height='121'>" +
        "<rect width='80' height='121' " +
        "fill='%23dddddd'/>" +
        "<text x='40' y='60' " +
        "text-anchor='middle' " +
        "font-family='Arial' " +
        "font-size='12' " +
        "fill='%23666666'>" +
        + ndx +
        "</text>" +
        "</svg>" :
        // jos kirjasarja on jokin muu
        "data:image/svg+xml," +
        "<svg xmlns='http://www.w3.org/2000/svg' " +
        "width='80' height='121'>" +
        "<rect width='80' height='121' " +
        "fill='%23dddddd'/>" +
        "<text x='40' y='60' " +
        "text-anchor='middle' " +
        "font-family='Arial' " +
        "font-size='12' " +
        "fill='%23666666'>" +
        "<tspan>" + itm.id.replace("+","-").replace("+","") + "</tspan>" +
        "</text>" +
        "</svg>";

    /*
     * Jos kuvaa ei löydy,
     * piilotetaan rikkinäinen kuva.
     */

    image.onerror = function() {

        this.onerror = null;

/*
        let svg = (sername == "aa" || sername == "rs") ? 
            // kun kuvaa ei löydy, näytetään tilalla harmaa suorakulmio
            // jos kirjasarja on taskukirjat tai Roope-Sedät, näytetään numero
            "data:image/svg+xml," +
            "<svg xmlns='http://www.w3.org/2000/svg' " +
            "width='80' height='121'>" +
            "<rect width='80' height='121' " +
            "fill='%23dddddd'/>" +
            "<text x='40' y='60' " +
            "text-anchor='middle' " +
            "font-family='Arial' " +
            "font-size='12' " +
            "fill='%23666666'>" +
            + ndx +
            "</text>" +
            "</svg>" :
            // jos kirjasarja on jokin muu, ei näytetä numeroa
            "data:image/svg+xml," +
            "<svg xmlns='http://www.w3.org/2000/svg' " +
            "width='80' height='121'>" +
            "<rect width='80' height='121' " +
            "fill='%23dddddd'/>" +
            "</svg>";
*/            
            this.src = svg;
    };

/*
        this.src = 
            "data:image/svg+xml," +

            "<svg xmlns='http://www.w3.org/2000/svg' " +
            "width='80' height='121'>" +

            "<rect width='80' height='121' " +
            "fill='%23dddddd'/>" +

            "<text x='40' y='60' " +
            "text-anchor='middle' " +
            "font-family='Arial' " +
            "font-size='12' " +
            "fill='%23666666'>" +

            + svgtext +

            "</text>" +

            "</svg>";
    };
*/      

    // -----------------------------------------
    // Tiedot
    // -----------------------------------------

    const info = document.createElement("div");
    info.className = "book-info";

    // Numero
    const numberElement = document.createElement("div");
    numberElement.className = "book-number";
    numberElement.textContent =  itm.na;

    // Nimi
    const title = document.createElement("div");
    title.className = "book-title";
    title.textContent = itm.ti;

    // pikkuteksti
    const pikkuteksti = document.createElement("div");
    pikkuteksti.className = "book-pikkuteksti";
    pikkuteksti.textContent = itm.st;

    // Omistustieto
    const ownership = document.createElement("div");
    ownership.className = "ownership";

    updateOwnershipDisplay(ownership, ndx);

    // Kootaan
    info.appendChild(numberElement);
    info.appendChild(title);
    info.appendChild(pikkuteksti);
    
    const ownershipdiv = document.createElement("div");
    //info.appendChild(ownership);
    ownershipdiv.className = "ownershipdiv";
    ownershipdiv.appendChild(ownership);
    info.appendChild(ownershipdiv);

    book.appendChild(image);
    book.appendChild(info);

    bookList.appendChild(book);

}


// =========================================================
// OMISTUSTIEDON NÄYTTÄMINEN
// =========================================================

function updateOwnershipDisplay(element, number) {

    const owned = ownedBooks.includes(number);


    element.classList.remove("owned", "not-owned");

    if (owned) {    
        element.classList.add("owned");
        element.textContent = "✓ Omistan tämän";
    } else {
        element.classList.add("not-owned");
        element.textContent = "✗ En omista tätä";
    }

}


// =========================================================
// SUPABASE: OMISTUSTIEDOT
// =========================================================

async function loadOwnership(table) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from(table)
            .select(
                "numero, omistan"
            );


    if (error) {

        console.error(
            "Omistustietojen haku epäonnistui:",
            error
        );

        ownedBooks = [];

        return;
    }


    /*
     * Otetaan listaan vain ne kirjat,
     * joiden omistan-arvo on true.
     */

    ownedBooks =
        data
            .filter(
                function (row) {

                    return (
                        row.omistan === true
                    );

                }
            )
            .map(
                function (row) {

                    return Number(
                        row.numero
                    );

                }
            );

}


// =========================================================
// MUOKKAUSTILA
// =========================================================

if (editModeButton) {

    editModeButton.addEventListener("click", function () {
            if (editMode) {
                logoutAdmin();
                closeMobileMenu();
            } else {
                loginToEditMode();
                closeMobileMenu();                
            }

        }
    );

}


// =========================================================
// KIRJAUTUMINEN
// =========================================================

async function loginToEditMode() {

    const password =
        prompt(
            "Anna muokkaustilan salasana:"
        );

    document.getElementById('odota').classList.add('nayta');

        // Käyttäjä painoi Peruuta.
    if (password === null) {
        document.getElementById('odota').classList.remove('nayta');
        return;
    }


    // Tyhjä salasana.
    if (password.trim() === "") {
        document.getElementById('odota').classList.remove('nayta');
        alert("Anna salasana.");
        return;
    }


    // Kutsutaan Edge Functionia.

    const {data, error} =
        await supabaseClient.functions.invoke(
            "login-admin",
            {
                body: {
                    password:
                        password
                }
            }
        );


    if (error) {
        document.getElementById('odota').classList.remove('nayta');

        console.error("login-admin error:", error);
        alert("Virheellinen salasana tai kirjautumisessa tapahtui virhe.");

        return;
    }


    /*
     * Edge Functionin pitää palauttaa:
     *
     * access_token
     * refresh_token
     */

    if (!data || !data.access_token || !data.refresh_token) {
        document.getElementById('odota').classList.remove('nayta');

        console.error("Edge Function ei palauttanut session tietoja:", data);
        alert("Kirjautuminen epäonnistui.");

        return;
    }


    /*
     * Asetetaan Supabase Auth -session.
     */

    const {
        error: sessionError
    } =
        await supabaseClient.auth.setSession(
            {
                access_token:
                    data.access_token,

                refresh_token:
                    data.refresh_token
            }
        );


    if (sessionError) {

        document.getElementById('odota').classList.remove('nayta');

        console.error(
            "Session asettaminen epäonnistui:",
            sessionError
        );

        alert("Kirjautumista ei voitu viimeistellä.");

        return;
    }


    /*
     * Muokkaustila käyttöön.
     */

    
    editMode = true;

    updateEditButton();


    /*
     * Lisätään checkboxit.
     */

    addOwnershipEditors();

    document.getElementById('odota').classList.remove('nayta');

    console.log(
        "Muokkaustila käytössä."
    );

}


// =========================================================
// OLEMASSA OLEVAN SESSION TARKISTUS
// =========================================================

async function checkExistingSession() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();


    if (error) {

        document.getElementById('odota').classList.remove('nayta');
        console.error("Session tarkistus epäonnistui:", error);
        return;
    }


    if (
        data &&
        data.session
    ) {

        editMode = true;

        updateEditButton();

        addOwnershipEditors();

    }

}


// =========================================================
// MUOKKAUSTILAN PAINIKKEEN TEKSTI
// =========================================================

function updateEditButton() {

    if (!editModeButton) {
        return;
    }


    if (editMode) {

        editModeButton.textContent = "Poistu muokkaustilasta";
        editModeButton.classList.add("active");

    } else {

        editModeButton.textContent = "Muokkaustila";
        editModeButton.classList.remove("active");

    }

}


// =========================================================
// CHECKBOXIEN LISÄÄMINEN
// =========================================================

function addOwnershipEditors() {

    document
        .querySelectorAll(".book")
        .forEach(
            function (book) {

                addOwnershipEditor(book);

            }
        );

}


// =========================================================
// YHDEN CHECKBOXIN LISÄÄMINEN
// =========================================================

function addOwnershipEditor(book) {

    /*
     * Estetään saman editorin lisääminen
     * useita kertoja.
     */

    if (book.querySelector(".ownership-editor")) {
        return;
    }


    /*
     * Haetaan kirjan numero:
     *
     * book-123
     * ↓
     * 123
     */

    
    
    /* const tbl = book.getAttribute("data-table"); */
    const tbl = getTableName();

    const number = Number(book.id.replace("book-", ""));

    //const info = book.querySelector(".book-info");
    const info = book.querySelector(".ownershipdiv");

    if (!info) {
        return;
    }

    const editor = document.createElement("div");
    editor.className = "ownership-editor";

    const checkbox = document.createElement("input");
    checkbox.type ="checkbox";
    checkbox.id = "owned-" + number;
    checkbox.checked = ownedBooks.includes(number);

    const label = document.createElement("label");
    label.htmlFor = checkbox.id;
    label.textContent = "Omistan tämän kirjan";

    editor.appendChild(checkbox);
    editor.appendChild(label);

    info.appendChild(editor);

    book.classList.add("editing");


    /*
     * Tallennetaan muutos Supabaseen.
     */

    checkbox.addEventListener("change", async function () {

            document.getElementById('odota').classList.add('nayta');
            
            const newValue = checkbox.checked;
            checkbox.disabled = true;
            const success = await saveOwnership(number,newValue,tbl);

            /*
             * Jos tallennus epäonnistuu,
             * palautetaan vanha arvo.
             */

            if (!success) {
                checkbox.checked =
                    !newValue;
            }

            checkbox.disabled = false;

            document.getElementById('odota').classList.remove('nayta');

        }
    );

}


// =========================================================
// OMISTUSTIEDON TALLENTAMINEN
// =========================================================

async function saveOwnership(number,owned,table) {

    /*
     * Varmistetaan ensin, että käyttäjä
     * on edelleen kirjautuneena.
     */

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error || !data || !data.user) {
        alert("Kirjautuminen on päättynyt. Kirjaudu uudelleen.");
        await logoutAdmin();
        return false;
    }


    /*
     * Tarkistetaan, löytyykö rivi jo.
     */

    const {
        data: existing,
        error: findError
    } =
        await supabaseClient
            .from(table)
            .select("numero")
            .eq(
                "numero",
                number
            )
            .maybeSingle();


    if (findError) {

        console.error(
            "Tietokannan haku epäonnistui:",
            findError
        );


        alert(
            "Tietokantaa ei voitu lukea."
        );


        return false;
    }


    let saveError = null;


    // -----------------------------------------
    // Rivi löytyy → UPDATE
    // -----------------------------------------

    if (existing) {

        const {
            error
        } =
            await supabaseClient
                .from(table)
                .update({
                    omistan:
                        owned
                })
                .eq(
                    "numero",
                    number
                );


        saveError =
            error;

    }


    // -----------------------------------------
    // Riviä ei löydy → INSERT
    // -----------------------------------------

    else {

        const {
            error
        } =
            await supabaseClient
                .from(table)
                .insert({
                    numero:
                        number,

                    omistan:
                        owned
                });


        saveError =
            error;

    }


    /*
     * Tarkistetaan tallennus.
     */

    if (saveError) {

        console.error(
            "Omistustiedon tallennus epäonnistui:",
            saveError
        );


        if (
            saveError.code ===
            "42501"
        ) {

            alert(
                "Sinulla ei ole oikeutta muuttaa tietoja."
            );

        } else {

            alert(
                "Omistustiedon tallennus epäonnistui."
            );

        }


        return false;
    }


    /*
     * Päivitetään paikallinen lista.
     */

    if (owned) {

        if (
            !ownedBooks.includes(
                number
            )
        ) {

            ownedBooks.push(
                number
            );

        }

    } else {

        ownedBooks =
            ownedBooks.filter(
                function (bookNumber) {

                    return (
                        bookNumber !==
                        number
                    );

                }
            );

    }


    /*
     * Päivitetään näkyvä omistusteksti.
     */

    const book = document.getElementById("book-" + number);


    if (book) {

        const ownership =
            book.querySelector(".ownership");

        if (ownership) {

            updateOwnershipDisplay(ownership, number);

        }

    }


    /* console.log("Omistustieto tallennettu:", number, owned); */
    
    await readLastUpdateTime(getTableName());
  
    updateStats(ownedBooks.length,getTableMax());
    
    return true;

}


// =========================================================
// ULOSKIRJAUTUMINEN
// =========================================================

async function logoutAdmin() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {
        console.error("Uloskirjautuminen epäonnistui:",error);
    }

    editMode = false;
    updateEditButton();


    /*
     * Poistetaan checkboxit.
     */

    document.querySelectorAll(".ownership-editor").forEach(
            function (editor) {
                editor.remove();
            }
        );


    /*
     * Poistetaan muokkaustilan korostukset.
     */

    document.querySelectorAll(".book").forEach(
            function (book) {
                book.classList.remove("editing");
            }
        );


}


// =========================================================
// DROPDOWN
// =========================================================

if (dropdown && dropdownButton) {

    dropdownButton.addEventListener(
        "click",
        function (event) {
            closedropdown_bookser();
            event.stopPropagation();

            const isOpen = dropdown.classList.toggle("open");

            dropdownButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        }
    );

}

if (dropdown_bookser && dropdownButton2) {

    dropdownButton2.addEventListener("click", function (event) {
            closeDropdown();
            event.stopPropagation();

            const isOpen = dropdown_bookser.classList.toggle("open");

            dropdownButton2.setAttribute("aria-expanded", isOpen ? "true" : "false");
        }
    );

}


// =========================================================
// DROPDOWNIN SULKEMINEN
// =========================================================

function closeDropdown() {

    if (!dropdown) {
        return;
    }

    dropdown.classList.remove("open");

    if (dropdownButton) {
        dropdownButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}

function closedropdown_bookser() {

    if (!dropdown_bookser) {
        return;
    }

    dropdown_bookser.classList.remove("open");

    if (dropdownButton2) {
        dropdownButton2.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}

// Klikkaus valikon ulkopuolella sulkee valikot
document.addEventListener("click", function (event) {
     
        if (dropdown && !dropdown.contains(
                event.target
            )
        ) {
            closeDropdown();
        }

        if (
            dropdown_bookser &&
            !dropdown_bookser.contains(
                event.target
            )
        ) {
            closedropdown_bookser();

        }

    }
);


// =========================================================
// HAMBURGER
// =========================================================

if (hamburger && navLinks) {

    hamburger.addEventListener("click", function () {

            const isOpen = navLinks.classList.toggle("open");

            hamburger.classList.toggle("active", isOpen);

            hamburger.setAttribute("aria-expanded", isOpen ? "true" : "false");

        }
    );

}


// =========================================================
// MOBIILIVALIKON SULKEMINEN
// =========================================================

function closeMobileMenu() {

    if (navLinks) {
        navLinks.classList.remove("open");
    }


    if (hamburger) {
        hamburger.classList.remove("active");

        hamburger.setAttribute("aria-expanded", "false");

    }

}


// =========================================================
// SULJE MOBIILIVALIKKO, KUN LINKKIÄ PAINETAAN
// =========================================================

if (navLinks) {

    navLinks.querySelectorAll("a").forEach(function (link) {

                link.addEventListener("click", function () {
                        closeMobileMenu();
                    }
                );
        }
    );

}




// =========================================================
// SULJE MOBIILIVALIKKO, KUN KLIKATAAN SEN ULKOPUOLELLE
// =========================================================

document.addEventListener("click", function (event) {

        if (!navLinks || !hamburger) {
            return;
        }


        if (window.innerWidth > 700) {
            return;
        }


        const clickedMenu = navLinks.contains(event.target);
        const clickedButton = hamburger.contains(event.target);

        if (!clickedMenu && !clickedButton) {
            closeMobileMenu();
        }

    }
);