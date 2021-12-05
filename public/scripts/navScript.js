const userIcon = document.querySelector('.user-icon')
const userBtns = document.querySelector('.redirects-cont')
const username = document.querySelector('.user-fullname')

userIcon.addEventListener('mouseover', e =>{

    userBtns.classList.remove('hidden')
})

userBtns.addEventListener('mouseout', e =>{
    
    userBtns.classList.add('hidden')
})

if(username != null && username.innerHTML.length > 15){
    let x = username.innerHTML.slice(0,15)
    username.innerHTML = x + "..."
}




const burger = document.querySelector('.burger')
const burgerBg = document.querySelector('.burger-bg')
const burgerContent = document.querySelector('.burger-content')
const burgerUserIcon = document.querySelector('.burger-user-icon')
const burgerUserBtns = document.querySelector('.burger-redirects-cont')


burger.addEventListener('click', e =>{
    burgerBg.classList.toggle('off')
    burgerContent.classList.toggle('off')
    burgerUserIcon.classList.toggle('display-none')
})

burgerBg.addEventListener('click', e =>{
    burgerBg.classList.toggle('off')
    burgerContent.classList.toggle('off')
    burgerUserIcon.classList.toggle('display-none')
})

burgerUserIcon.addEventListener('click', e =>{

    if(burgerUserBtns.classList.contains('hidden'))
        burgerUserBtns.classList.remove('hidden')
    else
        burgerUserBtns.classList.add('hidden')
})

burgerContent.addEventListener('click', e =>{
    if(e.target.classList.contains('burger-content')){
        burgerUserBtns.classList.add('hidden')
    }
})
// burger modal bugerUserBtns off