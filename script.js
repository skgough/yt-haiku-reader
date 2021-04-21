let timeSelect = document.querySelector('.time')

timeSelect.addEventListener('change', () => {
    resetViewer()
})

let time = timeSelect.value

let url = `https://www.reddit.com/r/youtubehaiku/top.json?t=${time}`
let origin = new URL(url).origin
var list
getJSON(url).then((json) => {
    list = json.data.children.map((each) => each.data)
    getThumbnails()
    let lastViewedID = window.localStorage.getItem('lastViewedID')
    let lastViewed = list.find((post) => post.id === lastViewedID)
    if (lastViewed) {
        let index = list.indexOf(lastViewed)
        let viewer = document.querySelector('.viewer')
        viewer.dataset.index = index
    }
    updateViewer()
    updateThumbnails()
}, list)

function resetViewer() {
    let timeSelect = document.querySelector('.time')

    window.localStorage.clear()
    let time = timeSelect.value
    
    let url = `https://www.reddit.com/r/youtubehaiku/top.json?t=${time}`
    getJSON(url).then((json) => {
        list = json.data.children.map((each) => each.data)

        getThumbnails()
        let viewer = document.querySelector('.viewer')
        viewer.dataset.index = 0
        document.querySelector('.post.current > div').innerHTML = ''
        document.querySelector('.post.next > div').innerHTML = ''
        document.querySelector('.post.prev > div').innerHTML = ''
        updateViewer()
        updateThumbnails()
    }, list)
}
function updateViewer() {
    let viewer = document.querySelector('.viewer')
    let index = parseInt(viewer.dataset.index)
    let src = list[index]

    window.localStorage.setItem('lastViewedID', src.id)
    
    let crnt = document.querySelector('.post.current > div')
    let next = document.querySelector('.post.next > div')
    let prev = document.querySelector('.post.prev > div')
    
    let newPrev = document.createElement('div')
    let newCrnt = getPost(index)
    let newNext = document.createElement('div')

    if (index === 0) {
        newNext = getPost(index + 1)
    } else if (index === list.length - 1) {
        newPrev = getPost(index - 1)
    } else {
        newNext = getPost(index + 1)
        newPrev = getPost(index - 1)
    }

    crnt.replaceWith(newCrnt)
    prev.replaceWith(newPrev)
    next.replaceWith(newNext)
}

function getPost(index) {
    let post = document.createElement('div')
    let src = list[index]
    
    post.dataset.id = src.id

    let title = document.createElement('div')
        title.classList.add('link')

    let link = document.createElement('a')
        link.innerText = src.title
        link.href = origin + src.permalink
        
        title.appendChild(link)
        
    let thumbnail = document.createElement('div')
        thumbnail.classList.add('thumbnail')
        thumbnail.style.backgroundImage = `url(${src.media.oembed.thumbnail_url})`

    let embed = htmlDecode(src.media_embed.content)
        embed.removeAttribute('width')
        embed.removeAttribute('height')
        embed.addEventListener('load', () => {
            post.classList.add('loaded')
        })

    let nextBtn = document.createElement('button')
    nextBtn.classList.add('next-button')
    nextBtn.innerText = 'Next post'
    nextBtn.addEventListener('click', () => {
        nextPost()
    })

    let prevBtn = document.createElement('button')
    prevBtn.classList.add('prev-button')
    prevBtn.innerText = 'Previous post'
    prevBtn.addEventListener('click', () => {
        prevPost()
    })
    
    post.appendChild(title)
    post.appendChild(thumbnail)
    post.appendChild(embed)
    post.appendChild(nextBtn)
    post.appendChild(prevBtn)
    return post 
}
async function getJSON(url) {
    const request = await fetch(url)
    return request.json()
}
function getThumbnails() {
    let thumbstrip = document.querySelector('.thumbstrip')
        thumbstrip.innerHTML = ''
    for (const index in list) {
        let thumbnail = document.createElement('button')
            thumbnail.classList.add('thumbnail')
            thumbnail.style.backgroundImage = `url(${list[index].media.oembed.thumbnail_url})`
            thumbnail.innerText = list[index].title
            thumbnail.addEventListener('click', () => {
                let viewer = document.querySelector('.viewer')
                viewer.dataset.index = index
                updateViewer()
                updateThumbnails()
            })
            thumbnail.addEventListener('mouseenter', (e) => {
                let tooltip = document.querySelector('.tooltip')
                tooltip.innerText = list[index].title
            })
            thumbnail.addEventListener('mousemove', (e) => {
                let tooltip = document.querySelector('.tooltip')
                let offset = e.x - thumbstrip.getBoundingClientRect().x - tooltip.getBoundingClientRect().width/2
                let max = thumbstrip.getBoundingClientRect().width - tooltip.getBoundingClientRect().width
                if (offset > 0 && offset < max) {
                    tooltip.style.left = offset + 'px'
                } else if (offset <= 0 ) {
                    tooltip.style.left = 0 + 'px'
                } else if (offset > max) {
                    tooltip.style.left = max + 'px'
                }
            })
        thumbstrip.appendChild(thumbnail)
    }
}
function htmlDecode(input) {
    let e = document.createElement('textarea');
    e.innerHTML = input;
    // handle case of empty input
    let text = e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    let template = document.createElement('template')
    template.innerHTML = text
    return template.content.firstChild
}
function prevPost() {
    let viewer = document.querySelector('.viewer')
    let index = parseInt(viewer.dataset.index) - 1
    let src = list[index]

    window.localStorage.setItem('lastViewedID', src.id)
    
    let crnt = document.querySelector('.post.current > div')
    let next = document.querySelector('.post.next > div')
    let prev = document.querySelector('.post.prev > div')

    crnt.parentElement.classList.remove('current')
    crnt.parentElement.classList.add('next')

    next.parentElement.classList.remove('next')
    next.parentElement.classList.add('prev')

    prev.parentElement.classList.remove('prev')
    prev.parentElement.classList.add('current')

    if (!(index === 0)) {
        let prevPost = getPost(index - 1)
        next.replaceWith(prevPost)
    } else {
        let empty = document.createElement('div')
        next.replaceWith(empty)
    }
    
    viewer.dataset.index = index
    updateThumbnails()
}
function nextPost() {
    let viewer = document.querySelector('.viewer')
    let index = parseInt(viewer.dataset.index) + 1
    let src = list[index]


    window.localStorage.setItem('lastViewedID', src.id)
    
    let crnt = document.querySelector('.post.current > div')
    let next = document.querySelector('.post.next > div')
    let prev = document.querySelector('.post.prev > div')

    crnt.parentElement.classList.remove('current')
    crnt.parentElement.classList.add('prev')

    next.parentElement.classList.remove('next')
    next.parentElement.classList.add('current')

    prev.parentElement.classList.remove('prev')
    prev.parentElement.classList.add('next')

    
    if (!(index === list.length - 1)) {
        let nextPost = getPost(index + 1)
        prev.replaceWith(nextPost)
    } else {
        let empty = document.createElement('div')
        prev.replaceWith(empty)
    }

    viewer.dataset.index = index
    updateThumbnails()
}

function updateThumbnails() {
    let thumbstrip = document.querySelector('.thumbstrip')
    let viewer = document.querySelector('.viewer')
    let index = parseInt(viewer.dataset.index)

    let buttonWidth = thumbstrip.querySelector('button').offsetWidth
    let scrollLeft = (index*buttonWidth) - thumbstrip.offsetWidth/2 + buttonWidth/2
    thumbstrip.scrollLeft = scrollLeft
    
    let previous = thumbstrip.querySelectorAll('.selected')
        previous.forEach((button) => button.classList.remove('selected'))

    let selected = thumbstrip.querySelectorAll('button')[index]
        selected.classList.add('selected')

}