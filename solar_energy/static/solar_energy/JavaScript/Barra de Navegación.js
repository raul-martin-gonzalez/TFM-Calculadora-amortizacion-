feather.replace();

let menuToggle = document.querySelector('.menu-toggle');
let menuToggleIcon = document.querySelector('.menu-toggle i');
let menu = document.getElementById('menu');


menuToggle.addEventListener('click', e=>{
    menu.classList.toggle('show');
    document.getElementById("content").classList.toggle("active");
    if(menu.classList.contains('show')){
        menuToggleIcon.setAttribute('class', 'fa fa-times');
    }
    else{
        menuToggleIcon.setAttribute('class', 'fa fa-bars')
    }
})

