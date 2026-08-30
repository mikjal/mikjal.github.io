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

const dropdown = document.querySelector(".dropdown");
const dropdown_bookser = document.querySelector(".dropdown-bookser");

const dropdownButton = document.querySelector(".dropdown-button");
const dropdownButton2 = document.querySelector(".book-series-button");

let aa_data = [], rs_data = [];

aa_nimet.forEach(
    function (name, index) {
        let data = {
            na: "Nro " + (index+1),
            ti: name,
            st: "",
            co: "aa-" + (index+1) + ".jpg"
        };
        aa_data.push(data);
    }
);

rs_partial_data.forEach(
    function (da, index) {
        let data = {
            na: "Nro " + (index+1) + " " + da[0],
            ti: da[1],
            st: "",
            co: "rs-" + (index+1) + ".jpg"
        }
        rs_data.push(data);
    }
)

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
            initializePage("aa",aa_data);
            break;
        case "rs":
            document.querySelector('#menu-rs').classList.add('disabled');
            document.querySelector('#seriestitle').innerHTML = "Roope-Sedät";
            sessionStorage.setItem('series','rs');
            initializePage("rs",rs_data);
            break;
    }
}

async function initializePage(sername, data) {

    // Luodaan pikavalinnat.
    createQuickLinks(50,data.length);

    document.getElementById('odota').classList.add('nayta');

    // Haetaan omistustiedot.
    await loadOwnership(sername);

    /*
     * Luodaan kirjalista.
     */

    createBookList(sername, data);


    /*
     * Tarkistetaan, onko käyttäjällä
     * jo aktiivinen Supabase-istunto.
     */

    await checkExistingSession();
    document.getElementById('odota').classList.remove('nayta');

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
        /*
         * Jos kirjaa ei ole aa_nimet-taulukossa,
         * ei luoda linkkiä.
         */

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

/*
    {
        sn: "487",
        na: "Nro 487",
        ti: "Roope-Setä 487",
        st: "",
        co: "rs-487.jpg"
    }
*/
// =========================================================
// YKSITTÄISEN KIRJAN LUOMINEN
// =========================================================

function createBook(itm,ndx,sername) {

    const book = document.createElement("article");

    book.className = "book";
    book.id = "book-" + ndx;
    book.setAttribute("data-table",sername);

    // -----------------------------------------
    // Kansikuva
    // -----------------------------------------

    const image = document.createElement("img");

    image.className = "book-cover";
    image.src = "images/" + itm.co;
    image.alt = itm.ti;
    image.loading = 'lazy';
    image.width = 80;
    image.height = 121;


    /*
     * Jos kuvaa ei löydy,
     * piilotetaan rikkinäinen kuva.
     */

    image.onerror = function() {

        this.onerror = null;

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
            
            this.src = svg;
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
*/      
    };

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

    
    const tbl = book.getAttribute("data-table");

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

    checkbox.addEventListener(
        "change",
        async function () {

            document.getElementById('odota').classList.add('nayta');
            
            const newValue =
                checkbox.checked;

            checkbox.disabled =
                true;


            const success =
                await saveOwnership(number,newValue,tbl);


            /*
             * Jos tallennus epäonnistuu,
             * palautetaan vanha arvo.
             */

            if (!success) {

                checkbox.checked =
                    !newValue;

            }


            checkbox.disabled =
                false;

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

    const book =
        document.getElementById(
            "book-" + number
        );


    if (book) {

        const ownership =
            book.querySelector(
                ".ownership"
            );


        if (ownership) {

            updateOwnershipDisplay(
                ownership,
                number
            );

        }

    }


    console.log(
        "Omistustieto tallennettu:",
        number,
        owned
    );


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

        console.error(
            "Uloskirjautuminen epäonnistui:",
            error
        );

    }


    editMode = false;


    updateEditButton();


    /*
     * Poistetaan checkboxit.
     */

    document
        .querySelectorAll(
            ".ownership-editor"
        )
        .forEach(
            function (editor) {

                editor.remove();

            }
        );


    /*
     * Poistetaan muokkaustilan korostukset.
     */

    document
        .querySelectorAll(".book")
        .forEach(
            function (book) {

                book.classList.remove(
                    "editing"
                );

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

if (
    hamburger &&
    navLinks
) {

    hamburger.addEventListener(
        "click",
        function () {

            const isOpen =
                navLinks.classList.toggle(
                    "open"
                );


            hamburger.classList.toggle(
                "active",
                isOpen
            );


            hamburger.setAttribute(
                "aria-expanded",
                isOpen
                    ? "true"
                    : "false"
            );

        }
    );

}


// =========================================================
// MOBIILIVALIKON SULKEMINEN
// =========================================================

function closeMobileMenu() {

    if (navLinks) {

        navLinks.classList.remove(
            "open"
        );

    }


    if (hamburger) {

        hamburger.classList.remove(
            "active"
        );


        hamburger.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


// =========================================================
// SULJE MOBIILIVALIKKO, KUN LINKKIÄ PAINETAAN
// =========================================================

if (navLinks) {

    navLinks
        .querySelectorAll(
            "a"
        )
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        closeMobileMenu();

                    }
                );

            }
        );

}




// =========================================================
// SULJE MOBIILIVALIKKO, KUN KLIKATAAN SEN ULKOPUOLELLE
// =========================================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !navLinks ||
            !hamburger
        ) {

            return;
        }


        if (
            window.innerWidth > 700
        ) {

            return;
        }


        const clickedMenu =
            navLinks.contains(
                event.target
            );


        const clickedButton =
            hamburger.contains(
                event.target
            );


        if (
            !clickedMenu &&
            !clickedButton
        ) {

            closeMobileMenu();

        }

    }
);