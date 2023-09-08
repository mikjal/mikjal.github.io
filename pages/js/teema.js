if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    vaihdaTeema();
}

function vaihdaTeema() {
    const teema = document.documentElement.getAttribute('data-bs-theme');
    if (teema != null) {
        let uusiTeema = (teema == 'light') ? 'dark' : 'light';
        document.documentElement.setAttribute('data-bs-theme',uusiTeema);
        document.querySelector('#teemakuvake').innerHTML = teema + '_mode';
    }
}

document.querySelector('#teemakuvake').addEventListener('click', () => {
    vaihdaTeema();
});

