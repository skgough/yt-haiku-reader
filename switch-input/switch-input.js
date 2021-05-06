class SwitchInput extends HTMLElement {
    constructor () {
        super()
    }
    connectedCallback() {
        this.setAttribute('role','switch')
        this.setAttribute('tabindex','0')
        let shadow = this.attachShadow({mode: 'open'})
        let style = document.createElement('style')
        style.textContent = `
:host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: .5em;
}
.track {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    background-color: hsl(0, 100%, 70%);
    border-radius: .5em;
    transition: background-color .2s;
}
.knob {
    height: calc(1em - 4px);
    width: calc(1em - 4px);
    border-radius: 50%;
    background: white;
    transform: translateX(2px);
    transition: .2s transform;
    box-shadow: 0 0 2px 2px rgba(0,0,0,.2)
}
.checked {
    background-color: hsl(120, 100%, 70%)    
}
.checked .knob {
    transform: translateX(calc(1em + 2px))
}
`
        let knob = document.createElement('div')
        knob.classList.add('knob')
        let track = document.createElement('div')
        track.classList.add('track')
        track.appendChild(knob)

        if (this.hasAttribute('checked')) {
            track.classList.add('checked')
            this.setAttribute('aria-checked','true')
            this.value = true;
        } else {
            this.setAttribute('aria-checked','false')
            this.value = false;
        }
        
        shadow.appendChild(style)
        shadow.appendChild(track)

        window.requestAnimationFrame(() => {
            let height = parseInt(window.getComputedStyle(this).height);
            let style = document.createElement('style')
            style.textContent = `
:host { 
    font-size: ${height}px;
    height: ${height}px!important;
    width: ${2*height}px;
}
`
            shadow.appendChild(style)
        })
        this.addEventListener('keydown', (e) => {
            if (e.code === 'Enter' || e.code === 'Space') {
                e.preventDefault()
                this.click()
            }
        })
        this.addEventListener('click', () => {
            this.value = !this.value
            let evt = new Event('change')
            this.dispatchEvent(evt)
        })
        this.addEventListener('change', () => {
            if (this.value) {
                this.setAttribute('aria-checked','true')
                track.classList.add('checked')
            } else {
                this.setAttribute('aria-checked','false')
                track.classList.remove('checked')
            }
        })
    }
}
customElements.define('switch-input', SwitchInput)