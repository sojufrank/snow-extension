console.log('content.js script loading')

const options = {
  user: [
    'Customer response',
    'Customer QC',
    'Customer to order parts',
    'Customer to ship parts',
    'Customer requested hold',
    'Downtime',
  ],
  party: [
    'OEM response / investigation',
    'Awaiting part [in warranty]',
    'Awaiting part [out of warranty]',
    'Network Team',
    'RE&S',
    'Other Partner Teams',
  ],
  active: [
    'investigation in progress',
    'Ready to work',
  ],
  assigned: [
    'investigation in progress',
    'add/change hardware component',
    'add/change software',
    'patching',
    'researching solution',
    'work in progress',
  ],
  open: [
    'open',
    'foo',
    'bar'
  ],
  wip: [
    'wip',
    'foo',
    'bar',

  ],
  atp: [
    'atp',
    'foo',
    'bar'
  ],
  default: [
    'Choose SubState'
  ]
}

const chromeApiResponseController = {
  init: () => {
    this.uniqueBool = false
    this.billingLock = false
    chromeApiResponseController.setMessageListeners()
  },
  setMessageListeners: () => {
    chrome.runtime.onMessage.addListener(function (request) {
      if (request && request.type === 'history-state-updated') {
        //console.log('history state updated')
      } else if (request && request.type === 'incident') {
        //console.log("incident listener activated", request.data)
      } else if (request && request.type === 'problem') {
        //console.log("problem listener activated", request.data)
      } else if (request && request.type === 'change') {
        //console.log("change listener activated", request.data)
      } else if (request && request.type === 'task') {
        //console.log("task listener activated", request.data)
      } else if (request && request.type === 'loading') {
        //console.log("loading listener activated", request.data)
      } else if (request && request.type === 'complete') {
        if (!this.uniqueBool) {
          const iframeElement = document.querySelector("#gsft_main");
          if (iframeElement === null) {
            //console.log("complete listener activated", request.data)
            chromeApiResponseController.enableIframeFocus()
            refresh.init()
          }
          this.uniqueBool = true
        }
      } else if (request.greeting === 'hello') {
        console.log('hello')
        const iframeElement = document.querySelector("#gsft_main");
        if (!iframeElement) {
          if(!this.billingLock){
            this.billingLock = true
            setTimeout(function(){this.billingLock = false},2500)
            workRecord.init(request.data)
          }
        }
      }
    })
  },
  enableIframeFocus: () => {
    const toggleMoreOptions = document.querySelector('#toggleMoreOptions');
    if (toggleMoreOptions) {
      mouseController.mouseClick(toggleMoreOptions)
      setTimeout(function () {
        mouseController.mouseClick(toggleMoreOptions)
      }, 10)
    }
  },
}

const refresh = {
  init: () => {
    refresh.mainBlur()

    const idCheck = document.getElementById('subStateContainer')
    if (idCheck) {
      console.log("removing", idCheck)
      idCheck.remove()
    }

    const typeCheck = scanModule.getTicketType()
    console.log('typecheck',typeCheck)
    if(typeCheck === "incident" || typeCheck === 'task' || typeCheck === 'item'){
      dropdown.init()
    }
    
  },
  mainBlur: () => {
    if (document.activeElement) {
      document.activeElement.blur()
    }
  },
}

const workRecord = {
  init: (data) => {
    if (document.getElementById('moreOptionsContainer').style.display === 'none') {
      document.getElementById('toggleMoreOptions').click()
      setTimeout(start, 500)
    }
    start()


    function start() {
      //workRecord.removeAll()
      setTimeout(() => {
        document.getElementById('tags_menu').click()
        setTimeout(() => {
          let count = 0
          const looper = setInterval(() => {
            workRecord.writeSample(data[count])
            count++
            console.log(count, data.length)
            if (count === data.length) {
              clearInterval(looper)              
            }
          }, 1000)
        }, 500)
      }, 500)
    }
  },
  removeAll: () => {
    const arr = document.querySelectorAll('.tagit-close')
    arr.forEach(item => {
      item.click()
    })
    console.log(arr)
  },
  writeSample: (val) => {
    setTimeout(() => {
      console.log(val)
      const input = document.getElementById('document_tags').lastChild.children[0]
      input.value = `{B:${val.bill},Q:${val.quantity},T:${val.time}}`
      setTimeout(() => {
        const el = document.getElementById('tags_menu')
        el.focus()
        mouseController.mouseClick(el)
        el.click()
      }, 500)
    }, 500)
  }
}

const dropdown = {
  init: () => {
    console.log('dropdown init()')

    const idCheck = document.getElementById('subState')
    if (idCheck) {
      console.log("removing", idCheck)
      idCheck.remove()
    }

    //build dropdown
    dropdown.buildContainer()
    dropdown.buildDropdown()
    buttonModule.init()

    const state = scanModule.getState()
    if (state != 'Disabled') {
      ppeSubStateListener.init()
      const worknotes = scanModule.getAllSubStates()
      if (worknotes.length === 0) {
        dropdown.loadOptions()
        dropdown.animateDropdown()
      } else if (worknotes[0].includes('-END')) {
        dropdown.loadOptions()
        dropdown.animateDropdown()
      } else if (worknotes[0].includes('-START')) {
        dropdown.loadSingle()
        buttonModule.close()
      } else {
        dropdown.loadOptions()
        dropdown.animateDropdown()
      }
    } else {
      dropdown.loadDisable()
    }
  },
  getAnchor: () => {
    const type = scanModule.getTicketType()
    if (type === 'incident') return 'element.incident.state'
    else if (type === 'task') return 'element.sc_task.state'
    else if (type === 'item') return 'element.sc_req_item.state'
  },
  getOptions: () => {
    const state = scanModule.getState()
    if (state === 'Awaiting User') {
      return options.user
    } else if (state === 'Awaiting 3rd Party') {
      return options.party
    } else if (state === 'Active') {
      return options.active
    } else if (state === 'Assigned') {
      return options.assigned
    } else if (state === 'Open') {
      return options.open
    } else if (state === 'Work in Progress') {
      return options.wip
    } else if (state === 'Awaiting Third Party') {
      return options.atp
    } else {
      return []
    }
  },
  buildContainer: () => {
    const anchorElement = document.getElementById(dropdown.getAnchor())
    console.log('ANCHOR',anchorElement)
    const container = document.createElement('div')
    container.id = 'subStateContainer'
    anchorElement.children[1].appendChild(container)
  },
  buildDropdown: () => {
    const container = document.getElementById('subStateContainer')
    const select = document.createElement('select')
    select.id = 'subState'
    select.style.margin = "8px"
    select.style.background = "grey"
    select.style.color = 'white'
    select.style.padding = "2px"
    container.appendChild(select)
  },
  loadOptions: () => {
    const options = dropdown.getOptions()
    const dropdownElement = document.getElementById('subState')
    dropdownElement.style.background = ''
    dropdownElement.style.color = ''
    const option = document.createElement("option")
    option.disabled = "disabled"
    option.selected = "selected"
    option.hidden = "hidden"
    option.innerHTML = 'Choose Sub-State'
    dropdownElement.appendChild(option)

    options.forEach(item => {
      const option = document.createElement("option");
      option.value = item
      option.text = item
      dropdownElement.appendChild(option)
    })
  },
  loadDisable: () => {
    const options = dropdown.getOptions()
    const dropdownElement = document.getElementById('subState')
    const option = document.createElement("option")
    option.disabled = "disabled"
    option.selected = "selected"
    option.hidden = "hidden"
    option.innerHTML = 'Disabled'
    dropdownElement.appendChild(option)
  },
  loadSingle: () => {
    const dropdownElement = document.getElementById('subState')
    dropdownElement.style.background = '#ffff72'
    dropdownElement.style.color = ''
    const option = document.createElement("option")
    option.disabled = "disabled"
    option.selected = "selected"
    option.hidden = "hidden"
    scanModule.getWorkNoteSubState()
    option.innerHTML = scanModule.getWorkNoteSubState()
    dropdownElement.appendChild(option)
  },
  animateDropdown: () => {
    const el = document.getElementById('subState')
    const interval = 750
    const pixel = 3

    notify()

    function notify() {
      el.style.border = `${pixel}px solid #e57373`
      setTimeout(() => {
        el.style.border = `${pixel}px solid white`
        setTimeout(() => {
          el.style.border = `${pixel}px solid #f44336`
          setTimeout(() => {
            el.style.border = ``
          }, interval)
        }, interval)
      }, interval)
    }
  },
}

const scanModule = {
  init: () => {},
  getTicketType: () => {
    const navbar = document.querySelector('.navbar-title')
    //console.dir(navbar)
    if (navbar) {
      const navbarTextContent = navbar.textContent.toLowerCase()
      if (navbarTextContent.includes('incident')) return 'incident'
      if (navbarTextContent.includes('task')) return 'task'
      if (navbarTextContent.includes('requested item')) return 'item'
      if (navbarTextContent.includes('request')) return 'request'
    }
  },
  getCurrentState: () => {
    const type = scanModule.getTicketType()
    if (type === 'incident') {
      console.log('inc')
      const stateElement = document.getElementById('incident.state')
      return stateElement.options[stateElement.selectedIndex].text
    } else if (type === 'task') {
      console.log('task')
      const stateElement = document.getElementById('sc_task.state')
      console.dir(111111,stateElement)
      return stateElement.options[stateElement.selectedIndex].text
    } else if (type === 'request') {
      console.log('request')
      const stateElement = document.getElementById('sc_task.state')
      return stateElement.options[stateElement.selectedIndex].text
    } else if (type === 'item') {
      console.log('item')
      const stateElement = document.getElementById('sc_task.state')
      return stateElement.options[stateElement.selectedIndex].text
    }
  },
  getAllSubStates: () => {
    let subStates = document.getElementsByClassName('sn-widget-textblock-body sn-widget-textblock-body_formatted')
    return Array.from(subStates).filter(i => i.textContent.includes(`<Sub-State>`)).map(item => {
      const len = '<Sub-State>'.length
      const startIndex = item.textContent.indexOf(`<Sub-State>`) + len
      const endIndex = item.textContent.lastIndexOf(`</Sub-State>`)
      return item.textContent.substring(startIndex, endIndex)
    })
  },
  getFieldChanges: () => {
    //let subStates = document.getElementsByClassName('sn-widget-list-table-cell')
    let subStates = document.querySelectorAll('.sn-card-component_records')
    const states = Array.from(subStates).filter(i => {
      if (i.textContent.includes('StateAwaiting User') ||
        i.textContent.includes('StateAwaiting 3rd Party') ||
        i.textContent.includes('StateActive') ||
        i.textContent.includes('StateAssigned')) return i
    }).map(i => i.textContent)

    const stateUser = Array.from(subStates).filter(i => i.textContent.includes('StateAwaiting User')).map(i => i.textContent)
    const stateParty = Array.from(subStates).filter(i => i.textContent.includes('StateAwaiting 3rd Party')).map(i => i.textContent)
    const stateActive = Array.from(subStates).filter(i => i.textContent.includes('StateActive')).map(i => i.textContent)
    const stateAssigned = Array.from(subStates).filter(i => i.textContent.includes('StateAssigned')).map(i => i.textContent)

    console.log(states)
    return
  },
  getState: () => {
    const stateLength = document.querySelectorAll('.process-breadcrumb.process-breadcrumb-border').length
    if (stateLength > 0) {
      const stateList = document.querySelectorAll('.process-breadcrumb.process-breadcrumb-border')[0].children
      const text = Array.from(stateList).filter(i => i.className === 'active')[0].textContent
      if (text.includes('Awaiting User')) {
        return 'Awaiting User'
      } else if (text.includes('Awaiting 3rd Party')) {
        return 'Awaiting 3rd Party'
      } else if (text.includes('Active')) {
        return 'Active'
      } else if (text.includes('Assigned')) {
        return 'Assigned'
      } else {
        return 'Disabled'
      }
    } else {
      return 'Disabled'
    }
  },
  getWorkNoteState: () => {
    const text = scanModule.getAllSubStates()[0]
    console.log('text', text)
    if (text.includes('Awaiting User')) {
      return 'Awaiting User'
    } else if (text.includes('Awaiting 3rd Party')) {
      return 'Awaiting 3rd Party'
    } else if (text.includes('Active')) {
      return 'Active'
    } else if (text.includes('Assigned')) {
      return 'Assigned'
    } else {
      return 'Disabled'
    }
  },
  getWorkNoteSubState: () => {
    let subStates = document.getElementsByClassName('sn-widget-textblock-body sn-widget-textblock-body_formatted')
    const text = Array.from(subStates).filter(i => i.textContent.includes(`<Sub-State>`))[0].textContent
    const len = '<Sub-State>'.length
    const startIndex = text.indexOf('<Sub-State>') + len
    const endIndex = text.indexOf('-START</Sub-State>')
    return text.substring(startIndex, endIndex)
  },
}

const buttonModule = {
  init: (element) => {
    const idCheck = document.getElementById('myButton')
    if (idCheck) {
      console.log("removing", idCheck)
      idCheck.remove()
    }

    const el = document.getElementById('subStateContainer')
    const btn = document.createElement('span')
    btn.innerHTML = '⊘'
    btn.id = 'myButton'
    btn.style.background = 'grey'
    btn.style.color = 'white'
    btn.style.border = '1px solid black'
    btn.style.borderRadius = '3px'
    btn.style.padding = '3px'
    btn.style.userSelect = 'none'
    el.appendChild(btn)
  },
  enable: () => {
    const buttonElement = document.getElementById('myButton')
    const color = '#4caf50'
    const highlight = '#80e27e'
    buttonElement.style.background = color
    buttonElement.style.color = 'white'
    buttonElement.innerHTML = 'START'
    buttonElement.addEventListener('click', (e) => {
      workNoteModule.init()
      workNoteModule.openWorkNote()
    })
    buttonElement.addEventListener('mouseenter', (e) => {
      buttonElement.style.background = highlight
    })
    buttonElement.addEventListener('mouseleave', (e) => {
      buttonElement.style.background = color
    })
  },
  close: () => {
    const buttonElement = document.getElementById('myButton')
    const color = '#f44336'
    const highlight = '#ff7961'
    buttonElement.style.background = color
    buttonElement.style.color = 'white'
    buttonElement.innerHTML = 'END'
    buttonElement.addEventListener('click', (e) => {
      workNoteModule.init()
      workNoteModule.closeWorkNote()
    })
    buttonElement.addEventListener('mouseenter', (e) => {
      buttonElement.style.background = highlight
    })
    buttonElement.addEventListener('mouseleave', (e) => {
      buttonElement.style.background = color
    })
  }

}

const workNoteModule = {
  init: () => {
    //this.text = text
    const dropdownElement = document.getElementById('subState')
    const a = Array.from(dropdownElement.children).filter(i => i.selected)
    this.text = a[0].value
    this.delimiterStart = "<Sub-State>"
    this.delimiterEnd = "</Sub-State>"
    this.element = 'activity-stream-textarea'
    this.btn = 'activity-submit'
  },
  openWorkNote: () => {
    //const txtVal = workNoteModule.generateNote()
    const txtVal = `${this.delimiterStart}${this.text}-START${this.delimiterEnd}<|${scanModule.getState()}|>`
    const space = document.getElementById(this.element)
    const btn = document.getElementsByClassName(this.btn)
    if (space) {
      space.focus()
      document.execCommand('insertText', false, txtVal)
      btn[0].click()
    }
    setTimeout(refresh.init, 1000)
  },
  closeWorkNote: () => {
    const txtVal = `${this.delimiterStart}${this.text}-END${this.delimiterEnd}<|${scanModule.getState()}|>`
    const space = document.getElementById(this.element)
    const btn = document.getElementsByClassName(this.btn)
    if (space) {
      space.focus()
      document.execCommand('insertText', false, txtVal)
      btn[0].click()
    }
    setTimeout(refresh.init, 1000)
  },
}

const billingModule = {
  init: () => {
    this.text = ''
    this.delimiterStart = "<Sub-State>"
    this.delimiterEnd = "</Sub-State>"
    this.element = 'activity-stream-textarea'
    this.btn = 'activity-submit'
  },
  postBilling: (data) => {
    const arr = data
    const txt = `<billing-summary>\n${generateBill()}\n</billing-summary>`
    const space = document.getElementById(this.element)
    const btn = document.getElementsByClassName(this.btn)

    if (space) {

      space.focus()
      document.execCommand('insertText', false, txt)
      btn[0].click()
    }

    function generateBill() {
      return arr.map(i => `<billing-item>${i}</billing-item>`).join('\n')
    }
  },
}


const ppeSubStateListener = {
  init: () => {
    this.el = document.getElementById('subState')
    ppeSubStateListener.changeListener()
  },
  changeListener: () => {
    this.el.addEventListener('change', (e) => {
      //const selectedOption = e.target.selectedOptions[0].text
      //console.log('selectedOption',selectedOption)
      buttonModule.init()
      buttonModule.enable()
    })
  }
}

//following is the code I found on stack to be able to click the inner Iframe.
//source of mouse click code 
//https://stackoverflow.com/questions/43291181/how-to-trigger-click-on-a-button
const mouseController = {
  mouseClick: (element) => {
    var theButton = element
    if (theButton) {
      console.log("mouseController.mouseClick()")
      var box = theButton.getBoundingClientRect(),
        coordX = box.left + (box.right - box.left) / 2,
        coordY = box.top + (box.bottom - box.top) / 2;

      mouseController.simulateMouseEvent(theButton, "mousedown", coordX, coordY);
      mouseController.simulateMouseEvent(theButton, "mouseup", coordX, coordY);
      mouseController.simulateMouseEvent(theButton, "click", coordX, coordY);
    }
  },
  simulateMouseEvent: function (element, eventName, coordX, coordY) {
    element.dispatchEvent(new MouseEvent(eventName, {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: coordX,
      clientY: coordY,
      button: 0
    }))
  }
}

chromeApiResponseController.init()