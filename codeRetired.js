//document.getElementById('tags_menu')
    //document.getElementById('document_tags')
    //document.getElementById('toggleMoreOptions')
    //document.getElementById('document_tags').lastChild.children[0]
    const ke = new KeyboardEvent("keydown", {
      bubbles: true, cancelable: true, keyCode: 13
  });//document.body.dispatchEvent(ke);

  function rec(){
    console.log('recursion')
    if(document.getElementById('tags_number').dataset.number){
      return document.getElementById('tags_number').dataset.number
    } else {
      return setTimeout(()=>{rec()},100)
    }
  }
/*
  PROTOTYPE features
*/


const tagController = {
  init: (data) => {
    this.data = data
    this.toggleMoreOptions = document.querySelector('#toggleMoreOptions');
    this.tagsMenu = document.querySelector('#tags_menu');
    this.time = 150
  },
  //clicks menu -> clicks add tag button -> adds tag data -> clicks tag button -> clicks menu
  setTag: () => {
    mouseController.mouseClick(this.toggleMoreOptions)
    setTimeout(function () {
      mouseController.mouseClick(this.tagsMenu)
      setTimeout(function () {
        //this.tagInput must be declared here after the settimeouts to work properly
        this.tagInput = document.getElementById('document_tags').lastChild.children[0]
        this.tagInput.focus()
        this.tagInput.value = this.data
        setTimeout(function () {
          mouseController.mouseClick(this.tagsMenu)
          this.tagsMenu.click()
          setTimeout(function () {
            mouseController.mouseClick(this.toggleMoreOptions)
          }, this.time)
        }, this.time)
      }, this.time)
    }, this.time)
  }
}

const dropdownController = {
  init: () => {
    this.data = {}

    dropdownController.mainBlur()
    this.data = scanModule.init()
    dropdownController.draw()
  },
  draw: () => {
    //console.log(this.data)
    //dropdownModule.init(this.data)
  },
  mainBlur: () => {
    if (document.activeElement) {
      document.activeElement.blur()
    }
  },
}

const dropdownModule = {
  init: (obj) => {

    this.activities = obj.activities
    this.currentState = obj.currentState


    this.id = 'subState'
    this.title = 'Select Sub-State'
    this.buttonElement = 'close_sc_task'
    this.anchorElement = "element.incident.state"
    this.stateElement = "incident.state"

    const idCheck = document.getElementById('subState')
    if (idCheck) {
      console.log("removing", idCheck)
      idCheck.remove()
    }

    this.selectOptions = dropdownModule.checkState()
    //console.log('state', this.selectOptions)

    dropdownModule.dropdownBuild()
    dropdownModule.checkAndSetActiveSubState()
    subStateListener.init(this.id)
    stateListener.init(this.stateElement)
    buttonModule.init(this.anchorElement)

  },
  checkState: () => {
    if (this.currentState === 'Awaiting User') {
      return options.user
    } else if (this.currentState === 'Awaiting 3rd Party') {
      return options.party
    } else if (this.currentState === 'Active') {
      return options.active
    } else if (this.currentState === 'Assigned') {
      return options.assigned
    } else {
      return []
    }
  },
  dropdownBuild: () => {
    const anchor = document.getElementById(this.anchorElement)
    //console.log("dropdown building")

    const select = document.createElement('select')
    select.id = this.id
    select.style.margin = "8px"
    select.style.background = "yellow"
    anchor.children[1].appendChild(select)

    const option = document.createElement("option")
    option.disabled = "disabled"
    option.selected = "selected"
    option.hidden = "hidden"
    this.selectOptions.length >= 1 ? option.innerHTML = this.title : option.innerHTML = "Disabled"
    this.selectOptions.length >= 1 ? select.style.background = "yellow" : select.style.background = "#D3D3D3"
    //option.innerHTML = this.title
    select.appendChild(option)

    if (this.selectOptions.length >= 1) {
      this.selectOptions.forEach(item => {
        const option = document.createElement("option");
        option.value = item
        option.text = item
        select.appendChild(option)
      })
    }
  },
  checkAndSetActiveSubState: () => {
    this.recent = scanModule.getAllSubStates()
    if (this.recent.length > 0) {
      if (!this.recent[0].includes('-END')) {
        const el = document.getElementById(this.id)
        Array.from(el.children).forEach(item => {
          if (item.value.includes(this.recent[0])) item.selected = 'selected'
        })
      } else {
        if (this.currentState === 'Active') {
          const el = document.getElementById(this.id)
          Array.from(el.children).forEach(item => {
            if (item.value.includes('Ready to work')) item.selected = 'selected'
          })

          workNoteModule.init('Ready to work')
          workNoteModule.openWorkNote()
          const saveElement = document.getElementById('sysverb_update_and_stay')
          setTimeout(() => {
            mouseController.mouseClick(saveElement)
          }, 1000)
        } else {
          dropdownModule.animateDropdown()
        }
      }
    } else {
      if (this.currentState === 'Active') {
        const el = document.getElementById(this.id)
        Array.from(el.children).forEach(item => {
          if (item.value.includes('Ready to work')) item.selected = 'selected'
        })

        workNoteModule.init('Ready to work')
        workNoteModule.openWorkNote()
        const saveElement = document.getElementById('sysverb_update_and_stay')
        setTimeout(() => {
          mouseController.mouseClick(saveElement)
        }, 1000)
      } else {
        dropdownModule.animateDropdown()
      }
    }
  },
  refreshDropdown: () => {
    const selectElement = document.getElementById(this.id)
    Array.from(selectElement.children).forEach(option => option.remove())

    const option = document.createElement("option")
    option.disabled = "disabled"
    option.selected = "selected"
    option.hidden = "hidden"
    option.innerHTML = "Disabled"
    selectElement.style.background = "#D3D3D3"
    selectElement.appendChild(option)
  },
  animateDropdown: () => {
    const el = document.getElementById(this.id)
    const interval = 750
    const pixel = 3
    //el.focus()
    //el.blur()
    //redFlash()
    redFlash()

    function redFlash() {
      el.style.border = `${pixel}px solid #e57373`
      setTimeout(() => {
        el.style.border = `${pixel}px solid white`
        setTimeout(() => {
          el.style.border = `${pixel}px solid #f44336`
          setTimeout(() => {
            el.style.border = `${pixel}px solid white`
            setTimeout(() => {
              el.style.border = `${pixel}px solid #d32f2f`
              setTimeout(() => {
                el.style.border = ``
              }, interval)
            }, interval)
          }, interval)
        }, interval)
      }, interval)
    }
  },
}

const subStateListener = {
  init: () => {
    this.el = document.getElementById('subState')
    //subStateListener.changeListener()
  },
  changeListener: () => {
    this.el.addEventListener('change', (e) => {
      workNoteModule.init(e.target.selectedOptions[0].text)
      workNoteModule.closeWorkNote()
      workNoteModule.openWorkNote()
      const saveElement = document.getElementById('sysverb_update_and_stay')

      setTimeout(() => {
        //mouseController.mouseClick(saveElement)
        const idCheck = document.getElementById('subState')
        if (idCheck) {
          console.log("removing", idCheck)
          idCheck.remove()
        }
        //dropdownController.init()
      }, 1000)
    })
  },
}

const stateListener = {
  init: (element) => {
    //console.log('state listener init')
    this.stateElement = document.getElementById(element)
    stateListener.changelistener()
  },
  changelistener: () => {
    this.stateElement.removeEventListener()
    this.stateElement.addEventListener('change', (e) => {
      console.log('state change listener', e.target.selectedOptions[0].text)
      const selectValue = e.target.selectedOptions[0].text
      if (selectValue != 'Resolved') {
        workNoteModule.init(' ')
        workNoteModule.closeWorkNote()
        if (selectValue === 'Awaiting User' || selectValue === 'Awaiting 3rd Party' ||
          selectValue === 'Active' || selectValue === 'Assigned'
        ) {
          const saveElement = document.getElementById('sysverb_update_and_stay')
          setTimeout(() => {
            mouseController.mouseClick(saveElement)
          }, 1000)
        } else {
          console.log('refresh Dropdown')
          dropdownModule.refreshDropdown()
        }
      } else {
        dropdownModule.refreshDropdown()
      }
    })
  },
}

// function selectCreator() {
//   //const el = document.getElementById("activity-stream-textarea")
//   const el = document.getElementById("single-input-journal-entry")


//   const test = document.createElement("select")
//   test.id = "testid"
//   test.innerHTML = "Hello world"
//   test.style.margin = "8px"
//   test.style.background = "#C0C0C0"

//   el.appendChild(test)
//   var option = document.createElement("option")
//   option.disabled = "disabled"
//   option.selected = "selected"
//   option.hidden = "hidden"
//   option.innerHTML = "Select Work/Billing action"
//   test.appendChild(option)

//   test.addEventListener('change', (e) => {
//     //console.log(e)
//     const value = e.target.selectedOptions[0].text
//     console.log(value)
//     setTimeout(function () {
//       workAction(value)
//     }, 100)

//   })

function formTags() {
    console.log("Starting 2nd click")
    setTimeout(function () {
      document.getElementById('tags_menu').focus()
      document.getElementById('tags_menu').click()
  
      setTimeout(function () {
        const t = document.getElementById('document_tags').children[0].children[0]
        t.value = "test"
        setTimeout(function () {
          const t1 = document.getElementById('document_tags').children[0].children[0]
          t1.dispatchEvent(new KeyboardEvent('keypress', {
            'key': 'enter'
          }));
  
        }, 500)
  
        console.log("tagitnew", t)
      }, 500)
    }, 500)
  }

//   testArr.forEach(item => {
//     var option = document.createElement("option");
//     option.value = item
//     option.text = item
//     test.appendChild(option)
//   })
// }

function save(data) {
    const txtVal = data
    const space = document.getElementById('incident.short_description')
    space.focus()
    document.execCommand('selectAll', false)
    document.execCommand('insertText', false, 'sojuTestText')
  
    const space2 = document.getElementById('sys_display.original.incident.short_description')
    if (space) space.value = txtVal
    if (space2) space2.value = txtVal
  
    const btn = document.getElementsByClassName("form_action_button")
  
    if (btn.length > 0) {
      btn[3].focus()
      btn[3].click()
    }
  }
  
  function saveNotes(data) {
    const txtVal = data
    const space = document.getElementById('activity-stream-textarea')
    space.focus()
    document.execCommand('selectAll', false)
    document.execCommand('insertText', false, 'sojuTestText')
  
    if (space) space.value = txtVal
  
    //const btn = document.getElementsByClassName("form_action_button")
    const btn = document.getElementsByClassName('activity-submit')
    //console.log(btn)
    //chrome.tabs.create({ url: "http://mlsportal/WorkRecordTool/Workrecord.aspx" })
    //window.open("http://mlsportal/WorkRecordTool/Workrecord.aspx")
  
    if (btn) {
      btn[0].focus()
      btn[0].click()
    }
  
  }
  
  function save2() {
    const space = document.getElementById('incident.short_description')
    const space2 = document.getElementById('sys_display.original.incident.short_description')
    if (space) space.value = "soju 2"
    //space.value = "soju 1"
    if (space2) space2.value = "soju 2"
    const btn = document.getElementsByClassName("form_action_button")
    console.log(btn)
    if (btn.length > 0) {
      btn[3].focus()
      btn[3].click()
    }
  
  }

  
function shortDescription() {
    const space = document.getElementById('incident.short_description')
    const space2 = document.getElementById('sys_display.original.incident.short_description')
    //const space = document.getElementById('')
    // const el = document.getElementById('output_messages')
    // const a = document.getElementById('gsft_main')
    // const b = document.getElementById('incident.form_header')
    // console.log(el)
    // console.log(a)
    // console.log(b)
    console.log("space", space, space2)
    space.value = "HELLO WORLD"
    space2.value = "HELLO WORLD"
    setTimeout(() => {
      const space3 = document.getElementById('incident.short_description')
      const space4 = document.getElementById('sys_display.original.incident.short_description')
  
      console.log(space3, space4)
    }, 500)
  
    const btn = document.getElementsByClassName("form_action_button")
    console.log(btn[0])
    btn[0].focus()
    btn[0].click()
  
    //var event = new CustomEvent("touchend", { "detail": "Example of an event" });
  
    // Dispatch/Trigger/Fire the event
  
  }

  function mouse() {
    console.log("STARTING CLICK: ")
    var theButton = document.querySelector('#toggleMoreOptions');
  
    var box = theButton.getBoundingClientRect(),
      coordX = box.left + (box.right - box.left) / 2,
      coordY = box.top + (box.bottom - box.top) / 2;
  
    simulateMouseEvent(theButton, "mousedown", coordX, coordY);
    simulateMouseEvent(theButton, "mouseup", coordX, coordY);
    simulateMouseEvent(theButton, "click", coordX, coordY);
  }
  
function simulateClick() {
    var event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    var cb = document.getElementById('toggleMoreOptions');
    if (cb) {
      console.log(cb)
  
      var cancelled = !cb.dispatchEvent(event);
      if (cancelled) {
        // A handler called preventDefault.
        alert("cancelled");
      } else {
        // None of the handlers called preventDefault.
        alert("not cancelled");
      }
    }
  }

  const testArr = ["_QC-Exempt", "_QC-Incident", "_QC-Rework", "Backup: Failure",
  "Facilities: Lab Power/Cooling", "Firmware Install", "Investigation Only", "IPAK", "Local Admin PW Reset (ERD/DART)",
  "Manufacturer Diagnostics", "Needs Additional Ticket", "Network Configuration", "Network/ SAN: Link failure Troubleshooting",
  "Network/KVM/ PDU: RMA", "Network: MTP cables verification/Change", "Network: Network Issue",
  "Network: OOB/MGMT Connectivity issues", "Network: Replace GBICs/QSFP", "Network: Switch Replacement (Failure)",
  "Non-Actionable", "OS: Drive space issue", "OS: Firewall Issues", "OS: Repair Tier 3",
  "OS: Routes addition", "Other (supply details)", "QC Customer Verify - Cannot Reproduce", "QC Customer Verify - No Access",
  "QC Exempt - Closing Duplicate Ticket",
  "QC Exempt - Customer Canceled Request",
  "QC Exempt - Customer Declined Walkthrough Investigation",
  "QC Exempt - Information only",
  "QC Exempt - Lab Maintenance/Internal Project",
  "QC Exempt - No Response",
  "QC Exempt - Not supported",
  "QC Exempt - Security Escort",
  "QC Exempt - Wrong Template used",
  "Replace: Array Controller",
  "Replace: Array Controller Battery",
  "Replace: Blade",
  "Replace: Cable",
  "Replace: CDU (power strip)",
  "Replace: Fan",
  "Replace: Hard Disk Drive",
  "Replace: HBA",
  "Replace: I/O Module (NIC, HBA)",
  "Replace: KVM Dongle (Avocent)",
  "Replace: KVM Dongle (other)",
  "Replace: KVM switch (MLS Owned)",
  "Replace: KVM switch (Non-MLS Owned)",
  "Replace: Motherboard",
  "Replace: Other (specify)",
  "Replace: Power Supply",
  "Replace: PPM (Processor Power Module)",
  "Replace: Processor",
  "Replace: RAM",
  "Replace: Switch (MLS owned)",
  "Replace: Switch (Non-MLS owned)",
  "Replacement Part Sources - Customer Order",
  "Replacement Part Sources - Stock",
  "Replacement Part Sources - Warranty Order",
  "Re-seat (specify)",
  "Restart/power cycle",
  "SAN: Cluster troubleshooting",
  "SAN: Kit / Multipatch troubleshooting",
  "SAN: LUN connectivity",
  "SAN: Performance analysis",
  "Software Configuration",
  "Update MLSKVM",
  "Update MSAsset",
  "Virtual Machine: Virtual network Troubleshoting",
  "Virtual Machine: VM configuration settings",
  "Walkthrough - no response"
]


//clicks menu -> clicks add tag button -> adds tag data -> clicks tag button -> clicks menu
function workAction(data) {
  const toggleMoreOptions = document.querySelector('#toggleMoreOptions');
  const tagsMenu = document.querySelector('#tags_menu');
  const time = 100
  mouse2(toggleMoreOptions)
  setTimeout(function () {
    mouse2(tagsMenu)
    setTimeout(function () {
      const t = document.getElementById('document_tags').lastChild.children[0]
      t.focus()
      t.value = data
      setTimeout(function () {
        mouse2(tagsMenu)
        tagsMenu.click()
        setTimeout(function () {
          mouse2(toggleMoreOptions)
        }, time)
      }, time)
    }, time)
  }, time)
}

function mouse2(element) {
  var theButton = element
  if (theButton) {
    console.log("STARTING CLICK: ")
    var box = theButton.getBoundingClientRect(),
      coordX = box.left + (box.right - box.left) / 2,
      coordY = box.top + (box.bottom - box.top) / 2;

    simulateMouseEvent(theButton, "mousedown", coordX, coordY);
    simulateMouseEvent(theButton, "mouseup", coordX, coordY);
    simulateMouseEvent(theButton, "click", coordX, coordY);
  }
}

var simulateMouseEvent = function (element, eventName, coordX, coordY) {
  element.dispatchEvent(new MouseEvent(eventName, {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: coordX,
    clientY: coordY,
    button: 0
  }));
};


// 5/7/2020



// retired code.
const userOptions = [
  'awaiting downtime',
  'awaiting customer response',
  'awaiting work window',
  'awaiting customer QC',
  'awaiting kick-off',
  'awaiting customer to order parts',
  'awaiting customer to ship parts',
  'customer requested hold'
]
const partyOptions = [
  'awaiting networking',
  'awaiting partner team',
  'awaiting part [in warranty]',
  'awaiting part [out of warranty]',
  'awaiting OEM response / investigation',
  'awaiting device delivery',
  'awaiting diagnostics to finish',
  'awaiting replication',
  'awaiting IPAK/MSN Patch',
  'awaiting OS Build',
  'investigation in progress',
  'running diagnostics',
  'Ready to work'
]
const activeOptions = [
  'investigation in progress',
  'running diagnostics',
  'Ready to work',
  'awaiting internal QC'
]
const assignedOptions = [
  'investigation in progress',
  'running diagnostics',
  'add/change hardware component',
  'add/change software',
  'patching',
  'researching solution',
  'work in progress',
]
const testArr = [
  'awaiting networking',
  'awaiting partner',
  'awaiting downtime',
  'awaiting diagnostics to finish',
  'awaiting customer response',
  'awaiting part [in warranty]',
  'awaiting part [out of warranty]',
  'awaiting work window',
  'awaiting OEM response / investigation',
  'awaiting customer QC',
  'customer requested hold',
  'initial investigate',
  'investigation in progress',
  'running diagnostic',
  'test commit'
]

const myModel = {
  init: () => {
    console.log('model init')
    this.modeData = {}
    this.worknoteData = []
  },
  modeGetSetter2: {
    get: () => this.modeData,
    set: (value) => this.modeData = value
  },
  modeGetSetter: {
    get: (key) => this.modeData[key],
    set: (key, value) => this.modeData[key] = value
  },
  worknoteGetSetter: {
    get: (key) => this.worknoteData[key],
    set: (key, value) => this.worknoteData[key = value]
  },
}

const mainController = {
  init: () => {},
  setMessageListeners: () => {
    chrome.runtime.onMessage.addListener(function (request) {
      if (request && request.type === 'page-rendered') {
        controller.dirtyFormFocus()
      } else if (request && request.type === 'incident') {
        console.log("incident received", request.data)
        controller.populateModel()
        workRecordController.incident.init()
        workRecordController.incident.workNotesCheckBox()
        workRecordController.incident.buildDropDown()

        // ver 3

      } else if (request && request.type === 'problem') {
        console.log("problem received", request.data)
      } else if (request && request.type === 'change') {
        console.log("change received", request.data)
      } else if (request && request.type === 'task') {
        console.log("task received", request.data)
        controller.populateModel()
        workRecordController.task.init()
        //workRecordController.task.disableCloseButton()
        workRecordController.task.buildTaskDropDown()
      } else if (request && request.type === 'tab-ready') {
        console.log("tab-ready received", request.data)
      }
    })
  },
  dirtyFormFocus: () => {
    const toggleMoreOptions = document.querySelector('#toggleMoreOptions');
    if (toggleMoreOptions) {
      mouseController.mouseClick(toggleMoreOptions)
      setTimeout(function () {
        mouseController.mouseClick(toggleMoreOptions)
      }, 1)
    }
  },
  populateModel: () => {
    scrapeController.init()
    if (scrapeController.check()) {
      model.set('activities', scrapeController.getActivities())
      model.set('activitiesBool', true)
    }
  }
}

const snowTicketTypeSelector = {
  init: (obj) => {
    if (obj.type === "incident") snowTicketTypeSelector.startIncidentMode()
  },
  startIncidentMode: () => {
    myModel.modeGetSetter2.set({
      type: "incident",
      buttonElement: "close_sc_task",
      anchorElement: "element.incident.state"
    })
  },
  startTaskMode: () => {},
}

const dropDownMenu = {
  init: (element, id, dataArray, title) => {
    console.log("dropdown init")
    this.element = element //.children[1]
    this.id = id
    this.data = dataArray
    this.optionTitle = title
  },
  buildDropDown: () => {
    const el = document.getElementById(this.element)
    if (el) {
      const anchor = el.children[1]
      console.log("dropdown building")
      const select = document.createElement('select')
      select.id = this.id
      select.style.margin = "8px"
      //select.style.background = "#ffeb3b"  //material yellow
      select.style.background = "yellow"
      anchor.appendChild(select)

      const option = document.createElement("option")
      option.disabled = "disabled"
      option.selected = "selected"
      option.hidden = "hidden"
      option.innerHTML = this.optionTitle
      select.appendChild(option)

      this.data.forEach(item => {
        const option = document.createElement("option");
        option.value = item
        option.text = item
        select.appendChild(option)
      })
    }
  },
  checkDefaultSelectedOption: (key) => {
    if (model.get(key)) {
      const recentStatus = model.get('activities')[0]
      const el = document.querySelector(`#${this.id}`)
      Array.from(el.children).forEach(item => {
        if (item.value.includes(recentStatus)) {
          item.selected = 'selected'
        }
      })
    }
  }
}

const workRecordController = {
  init: () => {},
  //incident type tickets
  incident: {
    init: () => {
      this.data = testArr
      this.buttonElement = 'close_sc_task'
      this.anchorElement = "element.incident.state"
      this.workNotesCheckBox = document.querySelector('.input-group-checkbox.ng-scope')
      this.multipleTextInputCheck = document.querySelector('#multiple-input-journal-entry')
      this.multipleBtn = document.querySelector('.icon-stream-one-input.btn-default.btn')
      this.id = "subStateDropDown"
      this.preState = "<Sub-State>"
      this.postState = "</Sub-State>"
    },
    workNotesCheckBox: () => {
      if (this.workNotesCheckBox) {
        //checks for multiple text boxes.  additional comments + work notes
        //closes extra box by clicking button
        if (this.multipleTextInputCheck.attributes[3].nodeValue === "false") {
          console.log("closing multiple")
          this.multipleBtn.focus()
          this.multipleBtn.click()
        }
        //checks checkbox label and sets correct checkbox 
        if (this.workNotesCheckBox.children[1].innerText === "Work notes") {
          console.log("setting check box")
          this.workNotesCheckBox.children[1].click()
        }
      }
    },
    buildDropDown: () => {
      dropDownMenu.init(this.anchorElement, this.id, this.data, "Sub-State")
      dropDownMenu.buildDropDown()
      dropDownMenu.checkDefaultSelectedOption('activitiesBool')
      workRecordController.incident.dropDownEventListener()
    },
    //dropdown change event listener 
    //sets worknote and worktag
    dropDownEventListener: () => {
      const el = document.getElementById(this.id)
      if (el) {
        console.log("dropdown event listener")
        el.addEventListener('change', (e) => {
          console.log(e.target.selectedOptions[0].text)
          workNotes.init(this.preState + e.target.selectedOptions[0].text + this.postState)
          workNotes.setWorkNote()
          setTimeout(() => {
            //tagController.init(e.target.selectedOptions[0].text)
            //tagController.setTag()
          }, 100)
        })
      }
    }
  },
  //task type tickets
  task: {
    init: () => {
      this.data = testArr
      this.buttonElement = 'close_sc_task'
      this.anchorElement = "element.sc_task.state"
      this.id = "taskDropDown"
      this.preState = "<Sub-State>"
      this.postState = "</Sub-State>"
    },
    buildTaskDropDown: () => {
      dropDownMenu.init(this.anchorElement, this.id, this.data, "Sub-State")
      dropDownMenu.buildDropDown()
      dropDownMenu.checkDefaultSelectedOption('activitiesBool')
      workRecordController.task.taskDropDownEventListener()
    },
    taskDropDownEventListener: () => {
      const el = document.getElementById('taskDropDown')
      if (el) {
        console.log("dropdown event listener")
        el.addEventListener('change', (e) => {
          //workRecordController.task.enableCloseButton()
          workNotes.init(this.preState + e.target.selectedOptions[0].text + this.postState)
          workNotes.setWorkNote()
        })
      }
    },
    enableCloseButton: () => {
      const el = document.getElementById(this.buttonElement)
      if (el) {
        console.log("Task Close button enabled")
        el.disabled = false
      }
    },
    disableCloseButton: () => {
      const el = document.getElementById(this.buttonElement)
      if (el) {
        console.log("Task Close button disabled")
        el.disabled = true
      }
    }
  }
}