
if(window.innerWidth > 1000){
    ScrollReveal().reveal('.whath2', {duration: 2000, viewFactor: 1, delay: 0, beforeReveal: showSvg});
    ScrollReveal().reveal('.whatp', {duration: 2000, viewFactor: 1, delay: 500});
    ScrollReveal().reveal('.whata', {duration: 2000, viewFactor: 1, delay: 1500});

    ScrollReveal().reveal('.howh', {duration: 1500, viewFactor: 1, delay: 0, beforeReveal: showSvg2});
    ScrollReveal().reveal('.howp', {duration: 2500, viewFactor: .8, delay: 500});

    function showSvg(){
        document.querySelector('.whatsvg').style.animation = 'showUp 2s .8s ease forwards'
    }


    function showSvg2(){
        document.querySelector('.howsvg').style.animation = 'showUp 1s 1s ease forwards'
        document.querySelector('.howa').style.animation = 'showUp 2s 2s ease forwards'
    }
}