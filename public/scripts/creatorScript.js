const namee = document.querySelector('#cname')
const cat = document.querySelector('#category')
const about = document.querySelector('#about')
const price = document.querySelector('#price')
const start = document.querySelector('#start')
const end = document.querySelector('#end')
const courseImg = document.querySelector('#courseimg')
const submit = document.querySelector('.submit')
console.log(courseImg)

const addMeeting = document.querySelector('.add-meeting')
const mname = document.querySelector('#mname')
const mdesc = document.querySelector('#mdesc')
const aboutm = document.querySelector('#mabout')
const mdate = document.querySelector('#mdate')
const mhour = document.querySelector('#mhour')
const mestm = document.querySelector('#mestm')

let mats = []
let materials = document.getElementById("materials");
const displayMaterials = document.querySelector(".display-materials");

const meetings = []
const minputs = [mname,mdesc,aboutm,mdate,mhour,mestm]
const inputs = [namee,cat,about,price,start,end]

const meetingsCont = document.querySelector('.meetings-cont')




/* --- Update course list --- */
materials.addEventListener('change', function (evnt) {
    for (let i = 0; i < materials.files.length; i++) {

        mats.push(materials.files[i]);

        const p = document.createElement('p')
        p.innerHTML = materials.files[i].name
        
        displayMaterials.append(p)
    }
});



/* --- Add meeting to list --- */
addMeeting.addEventListener('click', e =>{

    e.preventDefault()
    
    const obj = {
        mname: mname.value,
        mdesc: mdesc.value,
        aboutm: aboutm.value,
        mdate: mdate.value,
        mhour: mhour.value,
        mestm: mestm.value
    }

    meetings.push(obj)


    let div = document.createElement('div')
    div.setAttribute('class','meeting')
    div.innerHTML = 
    `
    <div class="meeting-upper">
        <h5>${mname.value}</h5>
        <div class="cm-date">${mdate.value}</div>
    </div>

    <div class="meeting-bottom">
        <h6>${mdesc.value}</h6>
        <h5>${mhour.value}</h5>
    </div>
    `

    meetingsCont.style.display = 'block'
    meetingsCont.append(div)

    minputs.forEach(inp =>{
        inp.value = ''
    })
})


function validate(inps){

    let x = false;
    
    inps.forEach(inp =>{
        if(inp.value == ''){
            x = true;
            console.log(inp)
            return
        }
    })

    console.log(x)
    return x
}

function validateDate(){

    const dates = [start,end]
    let validatePass = true;

    dates.forEach((date,i) =>{

        date = date.value;
        let pass = true;

        if(/^[0-9]{2}-[0-9]{2}-[0-9]{4}$/.test(date)){
            
            const day = `${date[0]}${date[1]}`
            const month = `${date[3]}${date[4]}`
            const year = `${date[6]}${date[7]}${date[8]}${date[9]}`
            
            if(parseInt(day) < 0 || parseInt(day > 31)){
                pass = false;
            }
            else if(parseInt(month < 0) || parseInt(month > 12)){
                pass = false;
            }
            else if(parseInt(year < 2021)){
                pass = false;
                console.log("------------------- BRUM ---------------", date)
            }
        }
        else{
            pass = false;
        }

        if(pass == false){

            validatePass = false;
            dates[i].classList.add('not-valid-inp')

            dates[i].addEventListener('click', e =>{
                dates[i].classList.remove('not-valid-inp')
            })
        }
    })

    return validatePass
}


function validateHour(){

    if(/^[0-9]{2}:[0-9]{2}$/.test(mhour.value)){
        return true
    }
    return false
}

/* --- Submit form --- */
document.querySelector('form').addEventListener('submit', e =>{


    /* --- Valdation --- */
    if(!validateHour() && meetings.length == 0){
        alert("zle godzina")
        e.preventDefault()
        return
    }

    if(!validateDate()){
        alert("Niepoprawnie wprowadzono date")

        e.preventDefault()
        return
    }

    if(validate(inputs)){
        alert('All inputs except materials and meetings should be provided')
        e.preventDefault()
        return
    }
    if(meetings.length == 0){
        alert('There should be at least one meeting set')
        e.preventDefault()
        return
    }


    /* --- Saving data as new object and sending it --- */

    e.preventDefault()
    let formData = new FormData();

    let estMeetingsTime = 0
    meetings.forEach(met => {estMeetingsTime += parseInt(met.mestm)})
    
    const data = {
        title: namee.value,
        price: price.value,
        authorInfo: {},
        aboutCourse: about.value,
        start: start.value,
        end: end.value,
        estMeetingsTime: estMeetingsTime,
        category: cat.value,
        meetings
    }

    console.log("est meetings", estMeetingsTime)
    // append json data
    formData.append("jsondata", JSON.stringify(data));
    console.log(courseImg.files[0])
    formData.append('courseImg', courseImg.files[0])

    //append materials
    mats.forEach((mat,i) =>{
        formData.append("materials[]", mat)
    })
    

    fetch('/addcourse',{
        method: "POST",
        body: formData
    })
    
    document.location = '/'
})



/* --- Custom Select --- */
const custom = document.querySelector('.custom-select')
const selectInp = document.querySelector('#category')
const cats = document.querySelectorAll('.cat')

selectInp.addEventListener('click', e =>{

    custom.classList.toggle('hidden')

    document.addEventListener('click', toggleInp)

    function toggleInp(ev){

        console.log(ev.target)
        console.log("gowno")
        if(!ev.target.classList.contains('select-input')){
            custom.classList.add('hidden')
            console.log("Chuj")
        }

        window.removeEventListener('click', toggleInp)
    }
})

cats.forEach(cat =>{
    cat.addEventListener('click', e =>{
        
        selectInp.value = cat.innerHTML;
        custom.classList.add('hidden')
    })
})