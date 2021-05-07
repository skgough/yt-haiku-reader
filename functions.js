function resetViewer() {
    let sortSelect = document.querySelector('.sort')
    let timeSelect = document.querySelector('.time')
    let sort = sortSelect.value
    let url
    if (sort === 'top') {
        timeSelect.parentElement.classList.remove('hidden')
        let time = timeSelect.value
        url = `https://www.reddit.com/r/youtubehaiku/${sort}.json?t=${time}`
    } else {
        timeSelect.parentElement.classList.add('hidden')
        url = `https://www.reddit.com/r/youtubehaiku/${sort}.json?limit=1000`
    }
    getJSON(url).then((json) => {
        list = json.data.children.map((each) => each.data)
        for (const index in list) {
            if (!(list[index].media)) {
                list.splice(index, 1)
            }
        }
        if (list.length > 0) {
            let viewer = document.querySelector('.viewer')
            viewer.dataset.index = 0
            getThumbnails()
            document.querySelector('.thumbstrip').classList.remove('placeholder')
            document.querySelector('.post.current > div').innerHTML = ''
            document.querySelector('.post.next > div').innerHTML = ''
            document.querySelector('.post.prev > div').innerHTML = ''
            updateViewer()
        } else {
            document.querySelector('.post.current > div').innerHTML = 'Error fetching posts.'
            document.querySelector('.post.next > div').innerHTML = ''
            document.querySelector('.post.prev > div').innerHTML = ''
        }
    }, list)
}

function updateViewer() {
    let viewer = document.querySelector('.viewer')
    let index = parseInt(viewer.dataset.index)

    let crnt = document.querySelector('.post.current > div')
    let next = document.querySelector('.post.next > div')
    let prev = document.querySelector('.post.prev > div')

    if (list.length > 0) {
        document.querySelector('.thumbstrip').classList.remove('placeholder')
        let newPrev = document.createElement('div')
        let newCrnt = getPost(index)
        newCrnt.querySelector('.title a').setAttribute('tabindex','')
        let newNext = document.createElement('div')
        if (list.length > 1) {
            if (index === 0) {
                newNext = getPost(index + 1)
            } else if (index === list.length - 1) {
                newPrev = getPost(index - 1)
            } else if (list.length > 1) {
                newNext = getPost(index + 1)
                newPrev = getPost(index - 1)
            }
        }
        crnt.replaceWith(newCrnt)
        prev.replaceWith(newPrev)
        next.replaceWith(newNext)
        markWatchedOnLoad()
        updateThumbnails()
    } else {
        document.querySelector('.post.current > div').replaceWith(getRickRoll())
        document.querySelector('.post.next').innerHTML = '<div></div>'
        document.querySelector('.post.prev').innerHTML = '<div></div>'
        document.querySelector('.thumbstrip').classList.add('placeholder')
        document.querySelector('.thumbstrip').innerHTML = '<div class="tooltip"></div>'
    }
}

function getPost(index) {
    let post = document.createElement('div')
    let src = list[index]
    post.dataset.id = src.id

    let title = document.createElement('div')
    title.classList.add('title')

    let link = document.createElement('a')
    link.setAttribute('tabindex','-1')
    link.href = origin + src.permalink
    
    link.innerText = src.title
    
    if (storageEnabled) {
        let postsInNewTabs = (localStorage.getItem('postsInNewTabs') === 'true')
        if (postsInNewTabs) {
            link.target = '_blank'
            let launchIcon = document.createElement('img')
            launchIcon.alt = 'Open in new tab'
            launchIcon.src = 'assets/launch.svg'
            link.appendChild(launchIcon)
        }
    }

    title.appendChild(link)

    let readMarker = document.createElement('div')
    readMarker.classList.add('read-marker')
    let input = document.createElement('input')
    input.type = "checkbox"
    if (storageEnabled) {
        let readList = localStorage.getItem('readList')
        if (readList) {
            readList = JSON.parse(readList)
            let search = readList.find((id) => id === src.id)
            if (search) {
                input.checked = true
                readMarker.classList.add('read')
            }
        }
    }

    let button = document.createElement('button')
    let text = document.createElement('span')
    text.innerText = input.checked ? 'Mark unwatched' : 'Mark watched'
    let markIcon = document.createElement('img')
    let hoverIcon = document.createElement('img')
    let readIcon = document.createElement('img')
    markIcon.src = 'assets/eye.svg'
    markIcon.alt = 'Mark post as unwatched'
    hoverIcon.src = 'assets/hide.svg'
    hoverIcon.alt = 'Mark post as watched'
    readIcon.src = 'assets/read.svg'
    button.appendChild(markIcon)
    button.appendChild(hoverIcon)
    button.appendChild(readIcon)
    button.appendChild(text)

    button.addEventListener('click', () => {
        if (storageEnabled) {
            let rememberingWatched = (localStorage.getItem('rememberWatched') === 'true')
            if (rememberingWatched) {
                input.checked = !input.checked
                if (input.checked) {
                    text.innerText = 'Mark unwatched'
                    readMarker.classList.add('read')
                } else {
                    text.innerText = 'Mark watched'
                    readMarker.classList.remove('read')
                }
                let evt = new Event('change')
                input.dispatchEvent(evt)
            } else {
                cookieMessageReceived = true
                errorJiggle(button)
                document.querySelector('.settings').classList.add('open')
                setTimeout(() => {document.querySelector('#remember-watched switch-input').focus()},500)
            }
        } else {
            errorJiggle(button)
        }
    })

    input.addEventListener('change', () => {
        if (storageEnabled) {
            let readList = localStorage.getItem('readList')
            if (readList) {
                readList = JSON.parse(readList)
                if (input.checked) {
                    readList.push(src.id)
                } else {
                    let search = readList.find((id) => id === src.id)
                    if (search) {
                        let index = readList.indexOf(search)
                        readList.splice(index, 1)
                    }
                }
                localStorage.setItem('readList', JSON.stringify(readList))
            } else {
                if (input.checked) readList = [src.id]
                localStorage.setItem('readList', JSON.stringify(readList))
            }
        }
        updateThumbnails()
        updateCount()
    })

    readMarker.appendChild(input)
    readMarker.appendChild(button)

    title.appendChild(readMarker)

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
    nextBtn.tabindex = 1
    nextBtn.addEventListener('click', () => {
        nextPost()
        markWatchedOnLoad()
    })

    let prevBtn = document.createElement('button')
    prevBtn.classList.add('prev-button')
    prevBtn.innerText = 'Previous post'
    prevBtn.addEventListener('click', () => {
        prevPost()
        markWatchedOnLoad()
    })

    post.appendChild(title)
    post.appendChild(thumbnail)
    post.appendChild(embed)
    post.appendChild(nextBtn)
    post.appendChild(prevBtn)
    post.classList.add('populated')

    return post
}

async function getJSON(url) {
    const request = await fetch(url)
    return request.json()
}

function getThumbnails() {
    let thumbstrip = document.querySelector('.thumbstrip')
    let oldNails = thumbstrip.querySelectorAll('.thumbnail')
    oldNails.forEach((el) => el.remove())
    let tooltip = document.querySelector('.tooltip')
    for (const index in list) {
        let thumbnail = document.createElement('button')
        thumbnail.classList.add('thumbnail')
        thumbnail.style.backgroundImage = `url(${list[index].media.oembed.thumbnail_url})`
        thumbnail.innerText = list[index].title
        thumbnail.addEventListener('click', () => {
            let viewer = document.querySelector('.viewer')
            if (viewer.dataset.index !== index) {
                viewer.dataset.index = index
                updateViewer()
                updateThumbnails()
            }
        })
        thumbnail.addEventListener('mouseenter', () => {
            let tooltip = document.querySelector('.tooltip')
            tooltip.innerText = list[index].title
        })
        thumbnail.addEventListener('mousemove', (e) => {
            let offset = e.x - thumbstrip.getBoundingClientRect().x - tooltip.getBoundingClientRect().width / 2
            let boxShadowSize = parseInt(window.getComputedStyle(document.body).getPropertyValue('font-size')) / 2
            let max = thumbstrip.getBoundingClientRect().width - tooltip.getBoundingClientRect().width + boxShadowSize
            if (offset > boxShadowSize && offset < max) {
                tooltip.style.left = offset + 'px'
            } else if (offset <= boxShadowSize) {
                tooltip.style.left = boxShadowSize + 'px'
            } else if (offset > max) {
                tooltip.style.left = max + 2 * boxShadowSize + 'px'
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

    let crnt = document.querySelector('.post.current > div')
    let next = document.querySelector('.post.next > div')
    let prev = document.querySelector('.post.prev > div')

    crnt.parentElement.classList.remove('current')
    crnt.parentElement.classList.add('next')

    next.parentElement.classList.remove('next')
    next.parentElement.classList.add('prev')

    prev.parentElement.classList.remove('prev')
    prev.parentElement.classList.add('current')
    prev.querySelector('.title a').setAttribute('tabindex','')

    if (index !== list.length - 1) {
        let nextPost = getPost(index + 1)
        crnt.replaceWith(nextPost)
    } else {
        let empty = document.createElement('div')
        crnt.replaceWith(empty)
    }

    if (index !== 0) {
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

    let crnt = document.querySelector('.post.current > div')
    let next = document.querySelector('.post.next > div')
    let prev = document.querySelector('.post.prev > div')

    crnt.parentElement.classList.remove('current')
    crnt.parentElement.classList.add('prev')

    next.parentElement.classList.remove('next')
    next.parentElement.classList.add('current')
    next.querySelector('.title a').setAttribute('tabindex','')

    prev.parentElement.classList.remove('prev')
    prev.parentElement.classList.add('next')

    if (index !== list.length - 1) {
        let nextPost = getPost(index + 1)
        prev.replaceWith(nextPost)
    } else {
        let empty = document.createElement('div')
        prev.replaceWith(empty)
    }
    if (index !== 0) {
        let prevPost = getPost(index - 1)
        crnt.replaceWith(prevPost)
    } else {
        let empty = document.createElement('div')
        crnt.replaceWith(empty)
    }

    viewer.dataset.index = index
    updateThumbnails()
}

function updateThumbnails() {
    let thumbstrip = document.querySelector('.thumbstrip')
    let viewer = document.querySelector('.viewer')
    let index = parseInt(viewer.dataset.index)

    let buttons = thumbstrip.querySelectorAll('button')
    for (let i = 0; i < buttons.length; i++) {
        let id = list[i].id
        if (storageEnabled) {
            let readList = localStorage.getItem('readList')
            if (readList) {
                readList = JSON.parse(readList)
                let search = readList.find((postID) => postID === id)
                if (search) {
                    buttons[i].classList.add('read')
                } else {
                    buttons[i].classList.remove('read')
                }
            } else {
                buttons[i].classList.remove('read')
            }
        }
    }

    let buttonWidth = thumbstrip.querySelector('button').offsetWidth
    let scrollLeft = (index * buttonWidth) - thumbstrip.offsetWidth / 2 + buttonWidth / 2
    thumbstrip.scrollLeft = scrollLeft

    let previous = thumbstrip.querySelectorAll('.selected')
    previous.forEach((button) => button.classList.remove('selected'))

    let selected = thumbstrip.querySelectorAll('button')[index]
    selected.classList.add('selected')
}

function updateCount() {
    let watchedCount = document.querySelector('#clear-watched span')
    if (storageEnabled) {
        let readList = localStorage.getItem('readList')
        if (readList) {
            readList = JSON.parse(readList)
            if (readList.length > 0) {
                watchedCount.innerText = readList.length + ' watched posts'
            } else {
                watchedCount.innerText = ''
            }
            return readList.length
        } else {
            watchedCount.innerText = ''
        }
    }
}

function hideRead() {
    if (storageEnabled) {
        let readList = localStorage.getItem('readList')
        if (readList) {
            readList = JSON.parse(readList)
            for (const id of readList) {
                let search = list.find((post) => post.id === id)
                if (search) {
                    let index = list.indexOf(search)
                    list.splice(index, 1)
                    document.querySelectorAll('.thumbstrip button')[index].remove()
                }
            }
            document.querySelector('.viewer').dataset.index = 0
            if (list[0]) document.querySelector('.tooltip').innerText = list[0].title
            getThumbnails()
            updateViewer()
        }
    } else {
        let hideReadBtn = document.querySelector('.hide-read')
        errorJiggle(hideReadBtn)
    }
}

function getRickRoll() {
    let post = document.createElement('div')

    let title = document.createElement('div')
    title.classList.add('title')
    let span = document.createElement('span')
    span.innerText = 'You spend too much time on reddit.'
    title.appendChild(span)

    let thumbnail = document.createElement('div')
    thumbnail.classList.add('thumbnail')

    thumbnail.style.backgroundImage = `url(https://i3.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg)`

    let embed = htmlDecode('<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=0" allowfullscreen></iframe>')
    embed.addEventListener('load', () => {
        post.classList.add('loaded')
    })

    post.appendChild(title)
    post.appendChild(thumbnail)
    post.appendChild(embed)

    return post
}

function testStorage() {
    let test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

function errorJiggle(element) {
    element.classList.remove('jiggly'); // reset animation
    void element.offsetWidth; // trigger reflow
    element.classList.add('jiggly');
    let audio = new Audio('error.mp3');
    audio.play();
    setTimeout(() => {
        if (!cookieMessageReceived) {
            alert('Enable cookies to use this feature.')
            cookieMessageReceived = true
        }
    }, 200)
}

function markWatchedOnLoad() {
    if (storageEnabled) {
        let markWatchedOnLoad = (localStorage.getItem('markWatchedOnLoad') === 'true')
        let rememberWatched = (localStorage.getItem('rememberWatched') === 'true')
        if (markWatchedOnLoad && rememberWatched) {
            let current = document.querySelector('.post.current > div')
            let id = current.dataset.id
            let readList = localStorage.getItem('readList')
            if (readList) {
                readList = JSON.parse(readList)
                let search = readList.find((postID) => postID === id)
                if (!search) {
                    current.querySelector('.read-marker button').click()
                }
            } else {
                current.querySelector('.read-marker button').click()
            }
        }
    }
}