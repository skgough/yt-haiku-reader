let storageEnabled = testStorage()

let timeSelect = document.querySelector('.time')
let fauxTimeSpan = document.querySelector('.time~.faux span')
if (storageEnabled) {
    let memTime = localStorage.getItem('time')
    if (memTime) {
        timeSelect.value = memTime
        fauxTimeSpan.innerText = timeSelect.querySelector(`[value=${timeSelect.value}]`).innerText
    }
}

timeSelect.addEventListener('change', () => {
    if (storageEnabled) localStorage.setItem('time', timeSelect.value)
    fauxTimeSpan.innerText = timeSelect.querySelector(`[value=${timeSelect.value}]`).innerText
    resetViewer()
})
let time = timeSelect.value

let sortSelect = document.querySelector('.sort')
let fauxSortSpan = document.querySelector('.sort~.faux span')
if (storageEnabled) {
    let memSort = localStorage.getItem('sort')
    if (memSort) {
        sortSelect.value = memSort
        fauxSortSpan.innerText = sortSelect.querySelector(`[value=${sortSelect.value}]`).innerText
    }
}
sortSelect.addEventListener('change', () => {
    if (storageEnabled) localStorage.setItem('sort', sortSelect.value)
    fauxSortSpan.innerText = sortSelect.querySelector(`[value=${sortSelect.value}]`).innerText
    resetViewer()
})
let sort = sortSelect.value

let hideReadBtn = document.querySelector('.hide-read')
hideReadBtn.addEventListener('click', () => { hideRead() })

let refreshBtn = document.querySelector('.refresh')
refreshBtn.addEventListener('click', () => { 
    refreshBtn.classList.remove('spinny'); // reset animation
    void refreshBtn.offsetWidth; // trigger reflow
    refreshBtn.classList.add('spinny');
    resetViewer() 
})

let settingsBtn = document.querySelector('.settings button') 
settingsBtn.addEventListener('click', () => {
    settingsBtn.parentElement.classList.toggle('open')
})
let clickOff = document.querySelector('.settings .click-off')
clickOff.addEventListener('click', () => {
    clickOff.parentElement.classList.remove('open')
})

let newTabSwitch = document.querySelector('#new-tab switch-input')
if (storageEnabled) {
    let postsInNewTabs = localStorage.getItem('postsInNewTabs')
    if (postsInNewTabs !== null) {
        newTabSwitch.value = (postsInNewTabs === 'true')
        
    } else {
        localStorage.setItem('postsInNewTabs',true)
        newTabSwitch.value = true
    }
    let evt = new Event('change')
    newTabSwitch.dispatchEvent(evt)
}
newTabSwitch.addEventListener('change', () => {
    if (storageEnabled) {
        localStorage.setItem('postsInNewTabs', newTabSwitch.value)
        let newTarget = newTabSwitch.value
                            ? '_blank'
                            : ''
        let postLinks = document.querySelectorAll('.post .title a') 
        postLinks.forEach(link => link.setAttribute('target', newTarget))
    } else {
        errorJiggle(newTabSwitch)
    }
})

let watchedSwitch = document.querySelector('#remember-watched switch-input')
if (storageEnabled) {
    let rememberWatched = localStorage.getItem('rememberWatched')
    if (rememberWatched !== null) {
        watchedSwitch.value = (rememberWatched === 'true')
    } else {
        localStorage.setItem('rememberWatched',true)
        watchedSwitch.value = true
    }
    let evt = new Event('change')
    watchedSwitch.dispatchEvent(evt)
}
watchedSwitch.addEventListener('change', () => {
    if (storageEnabled) {
        localStorage.setItem('rememberWatched',watchedSwitch.value)
    } else {
        errorJiggle(watchedSwitch)
    }
})

let markWatchedOnLoadSwitch = document.querySelector('#watch-on-load switch-input')
if (storageEnabled) {
    let markWatchedOnLoad = localStorage.getItem('markWatchedOnLoad')
    if (markWatchedOnLoad !== null) {
        markWatchedOnLoadSwitch.value = (markWatchedOnLoad === 'true')
    } else {
        localStorage.setItem('markWatchedOnLoad',true)
        markWatchedOnLoadSwitch.value = true
    }
    let evt = new Event('change')
    markWatchedOnLoadSwitch.dispatchEvent(evt)
}

let watchedCount = updateCount()

let forgetBtn = document.querySelector('#clear-watched button')
forgetBtn.addEventListener('click', () => {
    if (storageEnabled) {
        localStorage.setItem('readList','')
        updateCount()
        updateThumbnails()
        updateViewer()
    }
})

let url
if (sort === 'top') {
    timeSelect.parentElement.classList.remove('hidden')
    let time = timeSelect.value
    url = `https://www.reddit.com/r/youtubehaiku/${sort}.json?t=${time}`
} else {
    timeSelect.parentElement.classList.add('hidden')
    url = `https://www.reddit.com/r/youtubehaiku/${sort}.json?limit=1000`
}

let thumbstrip = document.querySelector('.thumbstrip')
let tooltip = document.querySelector('.tooltip')
thumbstrip.addEventListener('mouseleave', () => {
    let boxShadowSize = parseInt(window.getComputedStyle(document.body).getPropertyValue('font-size')) / 2
    tooltip.style.left = boxShadowSize + 'px'
})

let origin = new URL(url).origin
let list = []
getJSON(url).then((json) => {
    list = json.data.children.map((each) => each.data)
    for (const index in list) {
        if (!(list[index].media)) {
            list.splice(index, 1)
        }
    }
    getThumbnails()
    updateViewer()
}, list)

let cookieMessageReceived = false