console.log('popup script start')

const controller = {
    init: () => {
        model.init()
        view.init()

        const data = model.getWorkItems('incident')
        view.writeWorkList(data)
        controller.setWorkListListeners()
        controller.setDropdownListener()
        controller.setPostListener()
    },
    setWorkListListeners: () => {
        const workList = document.getElementById('workList')
        Array.from(workList.children).forEach(i => {

            i.firstChild.addEventListener('click', (e) => {
                console.log('click', e.target)
                const bucket = document.getElementById('bucket')
                //check bucket
                if (bucket.children.length > 0) {
                    const elementArr = Array.from(bucket.children)
                    let bool = false
                    elementArr.forEach(item => {
                        console.log(item.dataset, e.target.dataset)
                        if (item.dataset.bill === e.target.dataset.bill) {
                            bool = true
                        }
                    })
                    if (bool) {} else {
                        view.writeBucket({
                            bill: e.target.dataset.bill,
                            billShort: e.target.dataset.billShort,
                            time: e.target.dataset.time
                        })
                    }
                } else {
                    view.writeBucket({
                        bill: e.target.dataset.bill,
                        billShort: e.target.dataset.billShort,
                        time: e.target.dataset.time
                    })
                }
            })
        })
    },
    setDropdownListener: () => {
        const dropdownElement = document.getElementById('billingSelect')
        dropdownElement.addEventListener('change', (e) => {
            const workList = document.getElementById('workList')
            Array.from(workList.children).forEach(i => i.remove())
            if (e.target.value === 'Incident') {
                const data = model.getWorkItems('incident')
                view.writeWorkList(data)
                controller.setWorkListListeners()
            } else if (e.target.value === 'MAD') {
                const data = model.getWorkItems('mad')
                view.writeWorkList(data)
                controller.setWorkListListeners()
            } else if (e.target.value === 'Simple Change') {
                const data = model.getWorkItems('simpleChange')
                view.writeWorkList(data)
                controller.setWorkListListeners()
            } else if (e.target.value === 'SOP') {
                const data = model.getWorkItems('sop')
                view.writeWorkList(data)
                controller.setWorkListListeners()
            }
        })
    },
    setPostListener: () => {
        const postButtonElement = document.getElementById('post')
        postButtonElement.addEventListener('click', (e) => {
            const bucket = document.getElementById('bucket')
            //console.log(e, bucket)
            if (bucket.children.length > 0) {
                const d = Array.from(bucket.children).map(i => {
                    return {
                        bill: i.dataset.billShort,
                        quantity: i.children[1].children[0].children[1].value,
                        time: i.children[1].children[1].children[1].value
                    }
                })

                setTimeout(() => {
                    Array.from(bucket.children).forEach(i => {
                        i.remove()
                    })
                }, 100)

                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                }, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        greeting: "hello",
                        data: d
                    }, function (response) {
                        window.close()
                    });
                });
            }
        })
    }
}

const view = {
    init: () => {},
    writeWorkList: (data) => {
        const workList = document.getElementById('workList')
        console.log("DATA", data)
        data.sort().forEach(i => {
            const li = document.createElement('li')
            const button = document.createElement('button')
            button.classList.add(`workItemBtn`)
            button.dataset.bill = i.billingTitle
            button.dataset.billShort = i.billingShort
            button.dataset.time = i.timeEstimate
            button.innerHTML = i.billingTitle
            li.appendChild(button)
            workList.appendChild(li)
        })
    },
    writeBucket: (data) => {
        let count = 1
        const li = document.createElement('li')
        li.dataset.bill = data.bill
        li.dataset.billShort = data.billShort
        li.dataset.time = data.time
        li.innerHTML = `<button class="workItemBtn">${li.dataset.bill}</button>`
        const div = document.createElement('div')
        div.classList.add('parent')
        div.style.display = 'none'

        div.appendChild(view.quantityDiv())
        div.appendChild(view.timeDiv(li.dataset.time))
        div.appendChild(view.removeButton(li))
        li.appendChild(div)
        bucket.appendChild(li)
        li.firstChild.addEventListener('click', (e) => {
            if (div.style.display === 'none') {
                div.style.display = 'block'
            } else {
                div.style.display = 'none'
            }
        })
    },
    quantityDiv: () => {
        const div = document.createElement('div')
        div.classList.add('grid-container')
        //div.style.justifyContent = 'left'
        div.style.background = "#E0E0E0"
        const title = document.createElement('div')
        const quantityInput = document.createElement('input')
        const change = document.createElement('div')

        title.innerHTML = 'Quantity:'
        title.classList.add('quantityTitle')


        quantityInput.type = "number"
        quantityInput.value = 1
        quantityInput.classList.add('quantityValue')

        change.classList.add('quantityChange')
        change.style.display = 'flex'
        const decrementButton = document.createElement('button')
        const incrementButton = document.createElement('button')
        decrementButton.innerHTML = '-'
        incrementButton.innerHTML = '+'
        change.appendChild(decrementButton)
        change.appendChild(incrementButton)
        decrementButton.addEventListener('click', e => {
            if (quantityInput.value > 1) quantityInput.value--
        })
        incrementButton.addEventListener('click', e => {
            quantityInput.value++
        })

        div.appendChild(title)
        div.appendChild(quantityInput)
        div.appendChild(change)
        return div
    },
    timeDiv: (num) => {
        const div = document.createElement('div')
        div.classList.add('grid-container')
        div.style.background = "#BDBDBD"
        const title = document.createElement('div')
        const timeInput = document.createElement('input')
        const change = document.createElement('div')

        title.innerHTML = 'Time (mins):'
        title.classList.add('timeTitle')
        title.style.width = 'px'

        timeInput.type = "number"
        timeInput.value = num
        timeInput.classList.add('timeValue')

        change.classList.add('timeChange')
        change.style.display = 'flex'
        const decrementButton = document.createElement('button')
        const incrementButton = document.createElement('button')
        decrementButton.innerHTML = '-'
        incrementButton.innerHTML = '+'
        change.appendChild(decrementButton)
        change.appendChild(incrementButton)
        decrementButton.addEventListener('click', e => {
            if (timeInput.value > 1) timeInput.value--
        })
        incrementButton.addEventListener('click', e => {
            timeInput.value++
        })

        div.appendChild(title)
        div.appendChild(timeInput)
        div.appendChild(change)

        return div
    },
    removeButton: (element) => {
        const div = document.createElement('div')
        const button = document.createElement('button')
        div.classList.add('child')
        div.style.background = '#9E9E9E'
        div.style.display = 'flex'
        div.style.flexDirection = 'row-reverse'
        button.innerHTML = "Remove"
        button.style.background = "red"
        button.style.color = "white"
        div.appendChild(button)
        button.addEventListener('click', (e) => {
            element.remove()
        })
        return div
    }
}

const model = {
    init: () => {
        this.data = model.workItemsData
    },
    workItemsData: {
        incident: [{
                billingTitle: "_QC-Exempt",
                billingShort: "_QC-Exempt",
                timeEstimate: 10
            },
            {
                billingTitle: "_QC-Incident",
                billingShort: "_QC-Incident",
                timeEstimate: 16
            },
            {
                billingTitle: "_QC-Rework",
                billingShort: "_QC-Rework",
                timeEstimate: 16
            },
            {
                billingTitle: "Add Admins(KVM/OS)",
                billingShort: "Add_Admins(KVM/OS)",
                timeEstimate: 20
            },
            {
                billingTitle: "Backup: Failure",
                billingShort: "Backup:_Failure",
                timeEstimate: 32
            },
            {
                billingTitle: "Connectivity Changes_Remote",
                billingShort: "Conn_Changes_Remote",
                timeEstimate: 20
            },
            {
                billingTitle: "Event Tracking",
                billingShort: "Event_Tracking",
                timeEstimate: 45
            },
            {
                billingTitle: "Facilities: Lab Power/Cooling",
                billingShort: "Faclts:LabPower",
                timeEstimate: 32
            },
            {
                billingTitle: "Firmware Install",
                billingShort: "Firmware_Install",
                timeEstimate: 71
            },
            {
                billingTitle: "Firmware Install_Remote",
                billingShort: "Firmw_Instal_Rem",
                timeEstimate: 30
            },
            {
                billingTitle: "Information Only-Remote",
                billingShort: "Info_Only-Remote",
                timeEstimate: 15
            },
            {
                billingTitle: "Investigation Only-Remote",
                billingShort: "Invest_Only-Remote",
                timeEstimate: 45
            },
            {
                billingTitle: "Investigation Only",
                billingShort: "Investigation_Only",
                timeEstimate: 47
            },
            {
                billingTitle: "IPAK MSNpatch",
                billingShort: "IPAK_MSNpatch",
                timeEstimate: 45
            },
            {
                billingTitle: "IPAK SQL",
                billingShort: "IPAK_SQL",
                timeEstimate: 90
            },
            {
                billingTitle: "IPAK Windows",
                billingShort: "IPAK_Windows",
                timeEstimate: 90
            },
            {
                billingTitle: "Local Admin PW Reset (ERD/DART)",
                billingShort: "LclAdminPWRest-ERD",
                timeEstimate: 47
            },
            {
                billingTitle: "Manufacturer Diagnostics",
                billingShort: "ManufactDiagnostics",
                timeEstimate: 47
            },
            {
                billingTitle: "Needs Additional Ticket",
                billingShort: "Need_ADD_Tkt",
                timeEstimate: 2
            },
            {
                billingTitle: "Network Configuration",
                billingShort: "Ntwk_Cfg",
                timeEstimate: 39
            },
            {
                billingTitle: "Network/ SAN: Link failure Troubleshooting",
                billingShort: "Ntwk/SAN:Linkfailure",
                timeEstimate: 47
            },
            {
                billingTitle: "Network/KVM/ PDU: RMA",
                billingShort: "Ntwk/KVM/_PDU:_RMA",
                timeEstimate: 47
            },
            {
                billingTitle: "Network: IP Config",
                billingShort: "Ntwk:IP_Config",
                timeEstimate: 15
            },
            {
                billingTitle: "Network: MTP cables verification/Change",
                billingShort: "Ntwk:MTPcablesVerifi",
                timeEstimate: 47
            },
            {
                billingTitle: "Network: Network Issue",
                billingShort: "Ntwk:Ntwk_Issue",
                timeEstimate: 47
            },
            {
                billingTitle: "Network: OOB/MGMT Connectivity issues",
                billingShort: "Ntwk:OOB/MGMT_Con",
                timeEstimate: 47
            },
            {
                billingTitle: "Network: Replace GBICs/QSFP",
                billingShort: "Ntwk:Repl_GBICs/QSFP",
                timeEstimate: 47
            },
            {
                billingTitle: "Network: Switch Replacement (Failure)",
                billingShort: "Ntwk:Switch_Repl_Fail",
                timeEstimate: 47
            },
            {
                billingTitle: "Non-Actionable",
                billingShort: "Non-Actionable",
                timeEstimate: 10
            },
            {
                billingTitle: "OS: Drive space issue",
                billingShort: "OS:_Drive_space_issue",
                timeEstimate: 47
            },
            {
                billingTitle: "OS: Firewall Issues",
                billingShort: "OS:_Firewall_Issues",
                timeEstimate: 47
            },
            {
                billingTitle: "OS: Image Installation_Remote",
                billingShort: "OS:_Image_Install_Rem",
                timeEstimate: 45
            },
            {
                billingTitle: "OS: Rename",
                billingShort: "OS:_Rename",
                timeEstimate: 20
            },
            {
                billingTitle: "OS: Repair Tier 3",
                billingShort: "OS:_Repair_Tier_3",
                timeEstimate: 47
            },
            {
                billingTitle: "OS: Routes addition",
                billingShort: "OS:_Routes_addition",
                timeEstimate: 47
            },
            {
                billingTitle: "Other Administrative - Supply Details",
                billingShort: "Otr_Admin-Supply",
                timeEstimate: 30
            },
            {
                billingTitle: "Other (supply details)",
                billingShort: "Otr_(supply_details)",
                timeEstimate: 47
            },
            {
                billingTitle: "Other Software Cfg(Hyper-v/IIS/other)",
                billingShort: "Otr-Soft_Cfg(Hyper-v)",
                timeEstimate: 30
            },
            {
                billingTitle: "Power Cycle/Reboot-Remote",
                billingShort: "Power_Cycle-Remote",
                timeEstimate: 15
            },
            {
                billingTitle: "Power_Maint_Tracking",
                billingShort: "Power_Maint_Tracking",
                timeEstimate: 60
            },
            {
                billingTitle: "QC CustVerf",
                billingShort: "QC-CustVerf",
                timeEstimate: 10
            },
            {
                billingTitle: "QC Customer Verify - Cannot Reproduce",
                billingShort: "QCCustVerf-CantRepro",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Customer Verify - No Access",
                billingShort: "QCCustVerf-NoAccess",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Closing Duplicate Ticket",
                billingShort: "QCexmt-CloseDuplTkt",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Customer Canceled Request",
                billingShort: "QCexmt-CustCancReq",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Customer Declined Walkthrough Investigation",
                billingShort: "QCexmt-CustDeclWlktru",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Information only",
                billingShort: "QCexmt-Info_only",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Lab Maintenance/Internal Project",
                billingShort: "QCexmt-Intrl_Project",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - No Response",
                billingShort: "QCexmt-No_Response",
                timeEstimate: 15
            },
            {
                billingTitle: "QC Exempt - Not supported",
                billingShort: "QCexmt-Not_supported",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Security Escort",
                billingShort: "QCexmt-Sec_Escort",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Wrong Template used",
                billingShort: "QCexmt-WrongTemplate",
                timeEstimate: 2
            },
            {
                billingTitle: "QC-Incident-Remote",
                billingShort: "QC-Incident-Remote",
                timeEstimate: 20
            },
            {
                billingTitle: "Re-seat (specify)",
                billingShort: "Re-seat_(specify)",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: Array Controller",
                billingShort: "Repl:Array_Cont",
                timeEstimate: 71
            },
            {
                billingTitle: "Replace: Array Controller Battery",
                billingShort: "Repl:Array_Cont_Batt",
                timeEstimate: 71
            },
            {
                billingTitle: "Replace: Blade",
                billingShort: "Repl:Blade",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: Cable",
                billingShort: "Repl:Cable",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: CDU (power strip)",
                billingShort: "Repl:CDU(power_strip)",
                timeEstimate: 94
            },
            {
                billingTitle: "Replace: Fan",
                billingShort: "Repl:Fan",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: Hard Disk Drive",
                billingShort: "Repl:HardDiskDrive",
                timeEstimate: 16
            },
            {
                billingTitle: "Replace: HBA",
                billingShort: "Repl:HBA",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: I/O Module (NIC, HBA)",
                billingShort: "Repl:I/O_Module_(NIC)",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: KVM Dongle (Avocent)",
                billingShort: "Repl:KVMDongle(Avoc)",
                timeEstimate: 23
            },
            {
                billingTitle: "Replace: KVM Dongle (other)",
                billingShort: "Repl:KVMDongle(Otr)",
                timeEstimate: 23
            },
            {
                billingTitle: "Replace: KVM switch (MLS Owned)",
                billingShort: "Repl:Switch_MLS_owned",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: KVM switch (Non-MLS Owned)",
                billingShort: "Repl:Switch_Non-MLS",
                timeEstimate: 71
            },
            {
                billingTitle: "Replace: Motherboard",
                billingShort: "Repl:MOtrboard",
                timeEstimate: 71
            },
            {
                billingTitle: "Replace: Other (specify)",
                billingShort: "Repl:Otr_(specify)",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: Power Supply",
                billingShort: "Repl:Power_Supply",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: PPM (Processor Power Module)",
                billingShort: "Repl:PPM_",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: Processor",
                billingShort: "Repl:Processor",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: RAM",
                billingShort: "Repl:RAM",
                timeEstimate: 47
            },
            {
                billingTitle: "Replace: Switch (MLS owned)",
                billingShort: "Repl:KVM_switch_MLS",
                timeEstimate: 71
            },
            {
                billingTitle: "Replace: Switch (Non-MLS owned)",
                billingShort: "Repl:KVM_switchNon-MLS",
                timeEstimate: 71
            },
            {
                billingTitle: "Replacement Part Sources - Customer Order",
                billingShort: "Repl_Part-_Cust_Order",
                timeEstimate: 47
            },
            {
                billingTitle: "Replacement Part Sources - Stock",
                billingShort: "Repl_Part-_Stock",
                timeEstimate: 47
            },
            {
                billingTitle: "Replacement Part Sources - Warranty Order",
                billingShort: "Repl_Part-WarrantyOrder",
                timeEstimate: 47
            },
            {
                billingTitle: "Restart/power cycle",
                billingShort: "Restart/power_cycle",
                timeEstimate: 23
            },
            {
                billingTitle: "SAN: Kit / Multipatch troubleshooting",
                billingShort: "SAN:Kit/MultipatTblSht",
                timeEstimate: 47
            },
            {
                billingTitle: "SAN: Cluster troubleshooting",
                billingShort: "SAN:ClusterTblSht",
                timeEstimate: 47
            },
            {
                billingTitle: "SAN: LUN connectivity",
                billingShort: "SAN:_LUN_connectivity",
                timeEstimate: 47
            },
            {
                billingTitle: "SAN: Performance analysis",
                billingShort: "SAN:_Perf_analysis",
                timeEstimate: 47
            },
            {
                billingTitle: "Software Configuration",
                billingShort: "Software_Cfg",
                timeEstimate: 47
            },
            {
                billingTitle: "Ticket-Customer_Followup",
                billingShort: "Ticket-Cust_Followup",
                timeEstimate: 10
            },
            {
                billingTitle: "Update MLSKVM",
                billingShort: "Upd_MLSKVM",
                timeEstimate: 10
            },
            {
                billingTitle: "Update MSAsset",
                billingShort: "Upd_MSAsset",
                timeEstimate: 7
            },
            {
                billingTitle: "Virtual Machine: Virtual network Troubleshoting",
                billingShort: "VM:_VT_Ntwk_TblSht",
                timeEstimate: 47
            },
            {
                billingTitle: "Virtual Machine: VM configuration settings",
                billingShort: "VM:_VM_Cfg_settings",
                timeEstimate: 47
            },
            {
                billingTitle: "Walkthrough - no response",
                billingShort: "Wlktru-no_response",
                timeEstimate: 2
            },
        ],
        mad: [{
                billingTitle: "_QC - MAD",
                billingShort: "_QC_-_MAD",
                timeEstimate: 16
            },
            {
                billingTitle: "_QC-Exempt",
                billingShort: "_QC-Exempt",
                timeEstimate: 10
            },
            {
                billingTitle: "_QC-Rework",
                billingShort: "_QC-Rework",
                timeEstimate: 16
            },
            {
                billingTitle: "Asset Inventory Database update",
                billingShort: "Asset_inv_DB_Upd",
                timeEstimate: 8
            },
            {
                billingTitle: "Cable Run/Trace/Change",
                billingShort: "Cable_Run/Trace/Change",
                timeEstimate: 47
            },
            {
                billingTitle: "Decomm Device",
                billingShort: "Decomm_Device",
                timeEstimate: 47
            },
            {
                billingTitle: "Deploy CDU (power strip)",
                billingShort: "Deploy_CDU_power_strip",
                timeEstimate: 94
            },
            {
                billingTitle: "Deploy KVM/IP Switch (MLS Owned)",
                billingShort: "Depl_KVM/IP_Switch_MLS",
                timeEstimate: 71
            },
            {
                billingTitle: "Deploy KVM/IP Switch (Non-MLS Owned)",
                billingShort: "Depl_KVM/IP_SW_Non-MLS",
                timeEstimate: 71
            },
            {
                billingTitle: "Device Deployment",
                billingShort: "Device_Deploy",
                timeEstimate: 94
            },
            {
                billingTitle: "Device Racked",
                billingShort: "Device_Racked",
                timeEstimate: 94
            },
            {
                billingTitle: "Device: Deployment QC",
                billingShort: "Device:_Deploy_QC",
                timeEstimate: 16
            },
            {
                billingTitle: "Drive Destruction",
                billingShort: "Drive_Destruction",
                timeEstimate: 23
            },
            {
                billingTitle: "Internal Device Move",
                billingShort: "Intrl_Device_Move",
                timeEstimate: 94
            },
            {
                billingTitle: "Investigation only",
                billingShort: "Investigation_only",
                timeEstimate: 47
            },
            {
                billingTitle: "Lab Infrastructure Work",
                billingShort: "Lab_Infrastructure_Work",
                timeEstimate: 32
            },
            {
                billingTitle: "Management (iLo/DRAC/other) entry/update",
                billingShort: "MGMT_(iLo/DRAC/Otr)Upd",
                timeEstimate: 32
            },
            {
                billingTitle: "Management (DSView/) entry/update",
                billingShort: "MGMT_(DSView)_Upd",
                timeEstimate: 8
            },
            {
                billingTitle: "Network: TOR Mounting/Relocation/Decommision",
                billingShort: "Ntwk:_TOR_Mt/Reloc/Decom",
                timeEstimate: 94
            },
            {
                billingTitle: "Non Actionable",
                billingShort: "Non_Actionable",
                timeEstimate: 10
            },
            {
                billingTitle: "Other (supply details)",
                billingShort: "Otr_(supply_details)",
                timeEstimate: 47
            },
            {
                billingTitle: "Power Down/Pre-Decomm Usage Test",
                billingShort: "Power_Down/ScreamTest",
                timeEstimate: 16
            },
            {
                billingTitle: "Power Up",
                billingShort: "Power_Up",
                timeEstimate: 23
            },
            {
                billingTitle: "QC Customer Verify - Cannot Reproduce",
                billingShort: "QCCustVerf-CantRepro",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Customer Verify - No Access",
                billingShort: "QCCustVerf-NoAccess",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Closing Duplicate Ticket",
                billingShort: "QCexmt-CloseDuplTkt",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Customer Canceled Request",
                billingShort: "QCexmt-CustCancReq",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Deployment Planning",
                billingShort: "QCexmt-Deploy_Plan",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Information Only",
                billingShort: "QCexmt-Info_Only",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Lab Maintenance/Internal Project",
                billingShort: "QCexmt-Lab_Maint",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - No Response",
                billingShort: "QCexmt-No_Response",
                timeEstimate: 15
            },
            {
                billingTitle: "QC Exempt - Not Supported",
                billingShort: "QCexmt-Not_Supported",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Security Escort",
                billingShort: "QCexmt-Sec_Escort",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Wrong Template Used",
                billingShort: "QCexmt-Wrong_Template",
                timeEstimate: 2
            },
            {
                billingTitle: "Rack Assessment and Provision (RAP)",
                billingShort: "Rack_Asses_and_Prov_RAP",
                timeEstimate: 71
            },
            {
                billingTitle: "Secure Data Wipe",
                billingShort: "Secure_Data_Wipe",
                timeEstimate: 23
            },
            {
                billingTitle: "Space and Power Approved",
                billingShort: "Space_and_Power_Approved",
                timeEstimate: 94
            },
            {
                billingTitle: "Space and Power Denied",
                billingShort: "Space_and_Power_Denied",
                timeEstimate: 94
            },
        ],
        simpleChange: [{
                billingTitle: "_QC - Simple Change",
                billingShort: "_QC-SimpleChan",
                timeEstimate: 8
            },
            {
                billingTitle: "_QC-Exempt",
                billingShort: "_QC-Exempt",
                timeEstimate: 10
            },
            {
                billingTitle: "_QC-Rework",
                billingShort: "_QC-Rework",
                timeEstimate: 16
            },
            {
                billingTitle: "Add Admins(KVM/OS)",
                billingShort: "Add_Admins(KVM/OS)",
                timeEstimate: 20
            },
            {
                billingTitle: "Cable Run/Trace/Change",
                billingShort: "Cable_Run/Trace/Change",
                timeEstimate: 47
            },
            {
                billingTitle: "CDU (Power Strip) Configuration",
                billingShort: "CDU_(Power_Strip)_Cfg",
                timeEstimate: 39
            },
            {
                billingTitle: "Configuration Management (NIC speed, drive config, networking, route add accounts)",
                billingShort: "Cfg_MGMT_NIC",
                timeEstimate: 39
            },
            {
                billingTitle: "Connectivity Changes_Remote",
                billingShort: "Conn_Changes_Remote",
                timeEstimate: 20
            },
            {
                billingTitle: "Customer Audit Request",
                billingShort: "Cust_Audit_Req",
                timeEstimate: 156
            },
            {
                billingTitle: "DNS/GNZ mapping",
                billingShort: "DNS/GNZ_mapping",
                timeEstimate: 23
            },
            {
                billingTitle: "DSView: KVM Access",
                billingShort: "DSView:_KVM_Access",
                timeEstimate: 47
            },
            {
                billingTitle: "Event Tracking",
                billingShort: "Event_Tracking",
                timeEstimate: 45
            },
            {
                billingTitle: "Facilities: Lab access",
                billingShort: "Faclts:_Lab_access",
                timeEstimate: 32
            },
            {
                billingTitle: "Facilities: Lab Cleaning",
                billingShort: "Faclts:_Lab_Cleaning",
                timeEstimate: 47
            },
            {
                billingTitle: "Facilities: Lab Escort",
                billingShort: "Faclts:_Lab_Escort",
                timeEstimate: 32
            },
            {
                billingTitle: "Facilities: Rack Movement",
                billingShort: "Faclts:_Rack_Movement",
                timeEstimate: 32
            },
            {
                billingTitle: "Firmware/BIOS Update",
                billingShort: "Firmware/BIOS_Upd",
                timeEstimate: 71
            },
            {
                billingTitle: "Firmware Install_Remote",
                billingShort: "Firmw_Instal_Rem",
                timeEstimate: 30
            },
            {
                billingTitle: "Hardware Audit/Upgrade investigation",
                billingShort: "Hardware_Upgrade/Change",
                timeEstimate: 156
            },
            {
                billingTitle: "Hardware Upgrade/Change",
                billingShort: "HW_Audit/Upgr_investi",
                timeEstimate: 47
            },
            {
                billingTitle: "Information Only-Remote",
                billingShort: "Info_Only-Remote",
                timeEstimate: 15
            },
            {
                billingTitle: "Investigation Only-Remote",
                billingShort: "Invest_Only-Remote",
                timeEstimate: 45
            },
            {
                billingTitle: "IPAK MSNpatch",
                billingShort: "IPAK_MSNpatch",
                timeEstimate: 45
            },
            {
                billingTitle: "IPAK SQL",
                billingShort: "IPAK_SQL",
                timeEstimate: 90
            },
            {
                billingTitle: "IPAK Windows",
                billingShort: "IPAK_Windows",
                timeEstimate: 90
            },
            {
                billingTitle: "Label Change",
                billingShort: "Label_Change",
                timeEstimate: 23
            },
            {
                billingTitle: "Management (iLo/DRAC/other) entry/update",
                billingShort: "MGMT_(iLo/DRAC/Otr)Upd",
                timeEstimate: 32
            },
            {
                billingTitle: "Managmenet (DSView) entry/update",
                billingShort: "MGMT_(DSview)Upd",
                timeEstimate: 8
            },
            {
                billingTitle: "MSAsset Update",
                billingShort: "MSAsset_Upd",
                timeEstimate: 8
            },
            {
                billingTitle: "MSNPatch",
                billingShort: "MSNPatch",
                timeEstimate: 71
            },
            {
                billingTitle: "Network: IP Config",
                billingShort: "Ntwk:IP_Config",
                timeEstimate: 15
            },
            {
                billingTitle: "Network: Switch console access",
                billingShort: "Ntwk:_Switch_cons_acc",
                timeEstimate: 32
            },
            {
                billingTitle: "Non Actionable",
                billingShort: "Non-Actionable",
                timeEstimate: 10
            },
            {
                billingTitle: "OS Custome Build",
                billingShort: "OS_Custome_Build",
                timeEstimate: 71
            },
            {
                billingTitle: "OS Standard Build",
                billingShort: "OS_Standard_Build",
                timeEstimate: 71
            },
            {
                billingTitle: "OS: Rename",
                billingShort: "OS:_Rename",
                timeEstimate: 20
            },
            {
                billingTitle: "OS: Image Installation_Remote",
                billingShort: "OS:_Image_Install_Rem",
                timeEstimate: 45
            },
            {
                billingTitle: "Other Administrative - Supply Details",
                billingShort: "Otr_Admin-Supply",
                timeEstimate: 30
            },
            {
                billingTitle: "Other (supply details)",
                billingShort: "Otr_(supply_details)",
                timeEstimate: 47
            },
            {
                billingTitle: "Other Software Cfg(Hyper-v/IIS/other)",
                billingShort: "Otr-Soft_Cfg(Hyper-v)",
                timeEstimate: 30
            },
            {
                billingTitle: "Other Software Install",
                billingShort: "Otr_Software_Install",
                timeEstimate: 47
            },
            {
                billingTitle: "Others(Bulk)",
                billingShort: "Otr_(Bulk)",
                timeEstimate: 2
            },
            {
                billingTitle: "OU change",
                billingShort: "OU_change",
                timeEstimate: 39
            },
            {
                billingTitle: "Patching: Windows /Antivirus updates",
                billingShort: "Patching:_Win/AV_Upd",
                timeEstimate: 32
            },
            {
                billingTitle: "Power Cycle/Reboot-Remote",
                billingShort: "Power_Cycle-Remote",
                timeEstimate: 15
            },
            {
                billingTitle: "Power_Maint_Tracking",
                billingShort: "Power_Maint_Tracking",
                timeEstimate: 60
            },
            {
                billingTitle: "QC CustVerf",
                billingShort: "QC-CustVerf",
                timeEstimate: 10
            },
            {
                billingTitle: "QC Customer Verify - Cannot Reproduce",
                billingShort: "QCCustVerf-Cant_Repro",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Customer Verify - No Access",
                billingShort: "QCCustVerf-No_Access",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Closing Duplicate Ticket",
                billingShort: "QCexmt-CloseDuplTkt",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Customer Canceled Request",
                billingShort: "QCexmt-CustCancReq",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Information only",
                billingShort: "QCexmt-Info_only",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Lab Maintenance/Internal Project",
                billingShort: "QCexmt-Lab_Maint",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - No Response",
                billingShort: "QCexmt-No_Response",
                timeEstimate: 15
            },
            {
                billingTitle: "QC Exempt - Not supported",
                billingShort: "QCexmt-Not_supported",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Security Escort",
                billingShort: "QCexmt-Sec_Escort",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Wrong Template used",
                billingShort: "QCexmt-Wrong_Templ",
                timeEstimate: 2
            },
            {
                billingTitle: "QC-Simple_Change-Remote",
                billingShort: "QC-Simple-Remote",
                timeEstimate: 30
            },
            {
                billingTitle: "Reboot/Power Cycle",
                billingShort: "Reboot/Power_Cycle",
                timeEstimate: 23
            },
            {
                billingTitle: "Rehome",
                billingShort: "Rehome",
                timeEstimate: 47
            },
            {
                billingTitle: "Rename",
                billingShort: "Rename",
                timeEstimate: 47
            },
            {
                billingTitle: "Reserve/Configure IP",
                billingShort: "Reserve/Configure_IP",
                timeEstimate: 32
            },
            {
                billingTitle: "SAN: Code Upgrade",
                billingShort: "SAN:_Code_Upgrade",
                timeEstimate: 32
            },
            {
                billingTitle: "SAN: Disk shelf/disk addition",
                billingShort: "SAN:_Disk_shelf/disk_add",
                timeEstimate: 32
            },
            {
                billingTitle: "SAN: Firmware upgrade",
                billingShort: "SAN:_Firmware_upgrade",
                timeEstimate: 32
            },
            {
                billingTitle: "SAN: LUN Addition/Deletion",
                billingShort: "SAN:_LUN_Add/Del",
                timeEstimate: 32
            },
            {
                billingTitle: "SAN: SAN Kit Installation",
                billingShort: "SAN:_SAN_Kit_Install",
                timeEstimate: 32
            },
            {
                billingTitle: "SAN: Share Access/Creation",
                billingShort: "SAN:_Share_Acce/create",
                timeEstimate: 32
            },
            {
                billingTitle: "SAN: SQL cluster creation",
                billingShort: "SAN:_SQL_clust_create",
                timeEstimate: 32
            },
            {
                billingTitle: "SAN: Windows cluster creation",
                billingShort: "SAN:_Win_clust_create",
                timeEstimate: 32
            },
            {
                billingTitle: "Server/Device: decommission",
                billingShort: "Server/Device:_decomm",
                timeEstimate: 47
            },
            {
                billingTitle: "Ticket-Customer_Followup",
                billingShort: "Ticket-Cust_Followup",
                timeEstimate: 10
            },
            {
                billingTitle: "Update MLSKVM",
                billingShort: "Upd_MLSKVM",
                timeEstimate: 10
            },
            {
                billingTitle: "Update MSAsset",
                billingShort: "Upd_MSAsset",
                timeEstimate: 7
            },
            {
                billingTitle: "WDS Image addition /Drivers",
                billingShort: "VM:_VM_Creation",
                timeEstimate: 71
            },
            {
                billingTitle: "Virtual Machine: VM Creation",
                billingShort: "WDS_Image_addition_/Drivers",
                timeEstimate: 47
            },
        ],
        sop: [{
                billingTitle: "_QC-Exempt",
                billingShort: "_QC-Exempt",
                timeEstimate: 10
            },
            {
                billingTitle: "_QC-Rework",
                billingShort: "_QC-Rework",
                timeEstimate: 16
            },
            {
                billingTitle: "_QC-SOP",
                billingShort: "_QC-SOP",
                timeEstimate: 16
            },
            {
                billingTitle: "Asset Database Update",
                billingShort: "Asset_DB_Upd",
                timeEstimate: 8
            },
            {
                billingTitle: "Backup Media Replacement",
                billingShort: "Backup_Media_Repl",
                timeEstimate: 32
            },
            {
                billingTitle: "Backup Media Scratch Count",
                billingShort: "Backup_Media_Scratch",
                timeEstimate: 32
            },
            {
                billingTitle: "Capacity Verification",
                billingShort: "Capacity_Verification",
                timeEstimate: 94
            },
            {
                billingTitle: "Documentation",
                billingShort: "Documentation",
                timeEstimate: 32
            },
            {
                billingTitle: "DSAN Report Generation/Creation",
                billingShort: "DSAN_Report_Generation",
                timeEstimate: 32
            },
            {
                billingTitle: "Lab Maintenance",
                billingShort: "Lab_Maint",
                timeEstimate: 32
            },
            {
                billingTitle: "Lab Walkthrough",
                billingShort: "Lab_Wlktru",
                timeEstimate: 71
            },
            {
                billingTitle: "Non-Actionable",
                billingShort: "Non-Actionable",
                timeEstimate: 10
            },
            {
                billingTitle: "Other (supply details)",
                billingShort: "Otr_(supply_details)",
                timeEstimate: 47
            },
            {
                billingTitle: "Physical Audit",
                billingShort: "Physical_Audit",
                timeEstimate: 156
            },
            {
                billingTitle: "QC Exempt - Closing Duplicate Ticket",
                billingShort: "QCexmt-CloseDuplTkt",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Customer Canceled Request",
                billingShort: "QCexmt-CustCancReq",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Deployment Planning",
                billingShort: "QCexmt-DeployPlan",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Information Only",
                billingShort: "QCexmt-Info_Only",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Lab Maintenance/Internal Project",
                billingShort: "QCexmt-Lab_Maint",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Not Supported",
                billingShort: "QCexmt-Not_Supported",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Security Escort",
                billingShort: "QCexmt-Sec_Escort",
                timeEstimate: 2
            },
            {
                billingTitle: "QC Exempt - Wrong Template Used",
                billingShort: "QCexmt-Wrong_Template",
                timeEstimate: 2
            },
            {
                billingTitle: "Security Escort",
                billingShort: "Sec_Escort",
                timeEstimate: 47
            },
        ]
    },
    getWorkItems: (type) => {
        return this.data[type]
    }
}

controller.init()