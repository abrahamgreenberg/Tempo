interface Item {
    id: number;
    name: string;
    deleted: boolean;
}

interface TimeSlot extends Item {
    start: number;
    end: number;
    finalEnd: number;
}

interface Task extends Item {
    length: number;
    order: number;
    timeslotId: number;
}

interface TimetableOptions {
    name: string;
    day: string;
}

interface Save {
    name: string;
    day: string;
    timeslots: TimeSlot[];
    tasks: Task[];
}

const isTimeslot = (obj: any): obj is TimeSlot => {
    return (
        obj &&
        typeof obj === "object" &&
        typeof obj.name === "string" &&
        typeof obj.id === "number" &&
        typeof obj.start === "number" &&
        typeof obj.end === "number" &&
        typeof obj.finalEnd === "number" &&
        typeof obj.deleted === "boolean"
    );
};

const isTask = (obj: any): obj is Task => {
    return (
        obj &&
        typeof obj === "object" &&
        typeof obj.name === "string" &&
        typeof obj.id === "number" &&
        typeof obj.length === "number" &&
        typeof obj.order === "number" &&
        typeof obj.timeslotId === "number" &&
        typeof obj.deleted === "boolean"
    );
};

const isSave = (obj: any): obj is Save => {
    return (
        obj &&
        typeof obj === "object" &&
        typeof obj.name === "string" &&
        typeof obj.day === "string" &&
        Array.isArray(obj.timeslots) &&
        Array.isArray(obj.tasks) &&
        (obj.timeslots.length > 0 ?? isTimeslot(obj.timeslots[0])) &&
        (obj.timeslots.length > 0 ?? isTask(obj.tasks[0]))
    );
};

const timetableOptions: TimetableOptions = {
    name: "DEFAULT",
    day: "DEFAULT",
};

let timeSlots: TimeSlot[] = [];
let allTasks: Task[] = [];
const taskTimeslots: Map<number, number[]> = new Map();

const icon = (icon: string) => {
    return `<i class="bi bi-${icon}"></i>`;
};

const displayError = (elementID: string, message: string) => {
    let element = document.getElementById(elementID);
    if (element) {
        element.innerHTML = message;
        element.style.display = "block";
    }
    const breaks = document.getElementsByClassName("RemoveIfError");
    for (const breakElem of breaks) {
        if (!(breakElem instanceof HTMLElement)) return;
        breakElem.style.display = "none";
    }
};

const removeErrors = (...elementIDs: string[]) => {
    for (const id of elementIDs) {
        let element = document.getElementById(id);
        if (!element) continue;
        element.style.display = "none";
    }
    const breaks = document.getElementsByClassName("RemoveIfError");
    for (const breakElem of breaks) {
        if (!(breakElem instanceof HTMLElement)) return;
        breakElem.style.display = "block";
    }
};

const stimeToInt = (string: string) => {
    const [hours, minutes] = string.split(":");
    return +hours * 60 + +minutes;
};

const intToStime = (int: number) => {
    const doubleDigits = (number: number) => {
        return number.toLocaleString("en-US", {
            minimumIntegerDigits: 2,
            useGrouping: false,
        });
    };

    const minutes = int % 60;
    const hours = (int - minutes) / 60;
    return `${doubleDigits(hours)}:${doubleDigits(minutes)}`;
};

const getTimeslotTasks = (timeslotId: number) => {
    let timeslotTasks: number[] = taskTimeslots.get(timeslotId) ?? [];
    let returnArray: Task[] = [];
    for (let i = 0; i < timeslotTasks.length; i++)
        returnArray.push(allTasks[timeslotTasks[i]]);
    return returnArray;
};

const containsCommonElement = <T>(array1: T[], array2: T[]) => {
    for (const i of array1) for (const j of array2) if (i === j) return true;
    return false;
};

const checkForClass = (element: Element, ...classNames: string[]) => {
    let i = 0;

    while (element.parentNode) {
        if (containsCommonElement([...element.classList], classNames)) return i;
        i++;
        element = element.parentNode as HTMLElement;
    }
    return false;
};

const updateTimeslotTasks = (timeslotId: number, tasks: Task[]) => {
    taskTimeslots.set(
        timeslotId,
        tasks.map((task) => task.id)
    );
};

const traverseUp = (element: Element, levels: number) => {
    for (let i = 0; i < levels; i++) {
        if (element.parentNode) {
            element = element.parentNode as HTMLElement;
        } else {
            return null;
        }
    }
    return element;
};

const addClass = (element: Element, ...classes: string[]) => {
    for (const className of classes) element.classList.add(className);
};

const getDay = (id: number) => {
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "",
    ];
    return days[id];
};

const addIcons = (elem: HTMLElement, ...iconIds: string[]) => {
    const icons = iconIds
        .map((iconId) => {
            return icon(iconId);
        })
        .join();
    elem.innerHTML = `${icons}&nbsp;${elem.innerHTML}`;
};

const addTimeSlot = (e: SubmitEvent & { target: HTMLFormElement }) => {
    e.preventDefault();
    const error = (message: string, ...elements: string[]) => {
        for (const element of elements) displayError(`TS${element}`, message);
        return false;
    };
    if (!e.target) return;

    // @ts-ignore
    let start = stimeToInt(e.target.elements.TSStart.value as string);
    // @ts-ignore
    let end = stimeToInt(e.target.elements.TSEnd.value as string);

    if (start > end)
        return error("Start can't be later than the end", "TimeError");

    for (const slot of timeSlots)
        if (start < slot.end && end > slot.start && !slot.deleted)
            return error(
                "There is already another time slot in those times!",
                "TimeError"
            );

    const slot = timeSlots.push({
        id: timeSlots.length,
        // @ts-ignore
        name: e.target.elements.TSName.value,
        start,
        end,
        finalEnd: end,
        deleted: false,
    });

    timeSlots = timeSlots.sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
    });

    e.target.reset();

    let option = document.createElement("option");
    option.text = timeSlots[slot - 1].name;
    option.value = (slot - 1).toString();

    (document.getElementById("TTimeSlot") as HTMLSelectElement | null)?.add(
        option
    );

    removeErrors("TSTimeError");

    renderList();
    return true;
};

const addTask = (e: SubmitEvent & { target: HTMLFormElement }) => {
    e.preventDefault();

    const { elements: vals } = e.target;

    // @ts-ignore
    const timeslotId = +vals.TTimeSlot.value;
    const timeslotTasks = taskTimeslots.get(timeslotId) ?? [];

    // @ts-ignore
    const hours = +vals.TLength.value * 60;
    // @ts-ignore
    const mins = +vals.TLengthMins.value;

    const task = allTasks.push({
        id: allTasks.length,
        // @ts-ignore
        name: vals.TName.value,
        length: hours + mins,
        order: timeslotTasks.length,
        timeslotId,
        deleted: false,
    });

    timeslotTasks.push(task - 1);
    taskTimeslots.set(timeslotId, timeslotTasks);

    e.target.reset();

    // @ts-ignore
    vals.TTimeSlot.value = timeslotId;

    renderList();
    return true;
};

const replaceStrings = (string: string, ...values: [string, string][]) => {
    for (const value of values) {
        string = string.replace(
            new RegExp(
                `%${value[0].toUpperCase().replace(/[ +]/g, "_")}%`,
                "g"
            ),
            value[1]
        );
    }
    return string;
};

interface renderTemplate {
    timeslotInfo?: string;
    taskInfo: string;
}

type itemCallBack = (item: HTMLLIElement) => void;

const getList = (
    template: renderTemplate,
    taskCallBack?: itemCallBack,
    timeslotCallBack?: itemCallBack
) => {
    let fragment = document.createDocumentFragment();

    for (const timeSlot of timeSlots) {
        if (timeSlot.deleted) continue;
        if (template.timeslotInfo) {
            const newTimeSlot = document.createElement("li");
            addClass(newTimeSlot, "timeline-slot");
            newTimeSlot.id = `timeslot-${timeSlot.id}`;

            const newTimeSlotInfo = document.createElement("div");
            addClass(newTimeSlotInfo, "timeslot-content");
            if (timeslotCallBack) timeslotCallBack(newTimeSlot);

            newTimeSlotInfo.innerHTML = replaceStrings(
                template.timeslotInfo,
                ["name", timeSlot.name],
                [
                    "start",
                    `${icon("clock-fill")} ${intToStime(timeSlot.start)}`,
                ],
                ["end", intToStime(timeSlot.end)],
                [
                    "buttons",
                    `<div class="buttons"><button class="copy-button">${icon(
                        "clipboard-plus"
                    )}</button><button class="edit-button">${icon(
                        "pencil-square"
                    )}</button><button class="delete-button" onclick=handleDelete(this)>${icon(
                        "trash-fill"
                    )}</button></div>`,
                ]
            );

            newTimeSlot.appendChild(newTimeSlotInfo);
            fragment.appendChild(newTimeSlot);
        }

        let timeslotTasks = getTimeslotTasks(timeSlot.id);
        timeslotTasks = timeslotTasks.sort((a, b) => {
            if (a.order < b.order) return -1;
            if (a.order > b.order) return 1;
            return 0;
        });

        updateTimeslotTasks(timeSlot.id, timeslotTasks);

        let currentTime = timeSlot.start;

        for (const task of timeslotTasks) {
            if (task.deleted) continue;
            const newTask = document.createElement("li");
            addClass(newTask, "timeline-task");
            if (taskCallBack) taskCallBack(newTask);
            newTask.id = `task-${task.id}`;

            const newTaskInfo = document.createElement("div");
            addClass(newTaskInfo, "timeline-content");
            newTaskInfo.innerHTML = replaceStrings(
                template.taskInfo,
                ["name", task.name],
                ["start", `${icon("clock-fill")} ${intToStime(currentTime)}`],
                ["end", intToStime((currentTime += task.length))],
                [
                    "buttons",
                    `<div class="buttons"><button class="copy-button">${icon(
                        "clipboard-plus"
                    )}</button><button class="edit-button">${icon(
                        "pencil-square"
                    )}</button><button class="delete-button" onclick=handleDelete(this)>${icon(
                        "trash-fill"
                    )}</button></div>`,
                ],
                [
                    "clock",
                    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-fill" viewBox="0 0 16 16">
                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
              </svg>`,
                ],
                [
                    "arrows",
                    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
              </svg>`,
                ],
                [
                    "square",
                    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-square" viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
              </svg>`,
                ]
            );

            if (currentTime > timeSlot.end) addClass(newTask, "task-error");
            newTask.appendChild(newTaskInfo);
            fragment.appendChild(newTask);
        }

        timeSlots[timeSlot.id].finalEnd = currentTime;
    }

    return fragment;
};

const renderList = () => {
    const list = getList(
        {
            timeslotInfo:
                '<div class="right"><h2>%NAME%</h2><div class="timeline-time"><em>%START% - %END%</em></div></div><div class="left">%BUTTONS%</div>',
            taskInfo:
                '<div class="right"><h3>%NAME%</h3><div class="timeline-time">%START% - %END%</div></div><div class="left">%BUTTONS%</div>',
        },
        (task) => {
            task.addEventListener("dragend", handleDragEnd);
            task.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            task.draggable = true;
        },
        (timeslot) => {
            timeslot.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
        }
    );

    const timeline = document.getElementById("timeline");
    if (!timeline) return;
    timeline.replaceChildren(list);
    if (!timeline.parentElement) return;
    timeline.parentElement.style.display = "block";
};

const getId = (string: string) => {
    const split = string.split("-");
    return +split[split.length - 1];
};

const findTask = (id: number) => {
    return allTasks[id];
};

const handleDragEnd = (event: DragEvent) => {
    // @ts-ignore
    if (!event.srcElement.classList.contains("timeline-task")) return;
    let target_element = document.elementFromPoint(
        event.clientX,
        event.clientY
    );
    if (!target_element) return;
    const parent = checkForClass(
        target_element,
        "timeline-task",
        "timeline-slot"
    );
    if (!parent) return;
    target_element = traverseUp(target_element, parent);

    if (!target_element) return;
    if (target_element.className === "timeline-slot") {
        console.log("T1IMESLOt");
        return;
    }

    // @ts-ignore
    const from = findTask(getId(event.srcElement.id));
    // @ts-ignore
    const to = findTask(getId(target_element.id));
    if (!from || !to) return;
    if (from.id === to.id) return;

    if (from.timeslotId === to.timeslotId) {
        const timeslotTasks = getTimeslotTasks(from.timeslotId);

        if (from.order < to.order) {
            for (let i = from.order + 1; i <= to.order; i++)
                timeslotTasks[i].order = i - 1;
            timeslotTasks[from.order].order = to.order + 1;
        } else {
            for (let i = from.order - 1; i >= to.order; i--)
                timeslotTasks[i].order = i + 1;
            timeslotTasks[from.order].order = to.order - 1;
        }
    } else {
        const fromTimeslotTasks = getTimeslotTasks(from.timeslotId);

        for (let i = from.order + 1; i < fromTimeslotTasks.length; i++) {
            fromTimeslotTasks[i].order = i - 1;
        }

        fromTimeslotTasks.splice(from.order, 1);
        updateTimeslotTasks(from.timeslotId, fromTimeslotTasks);

        const toTimeslotTasks = getTimeslotTasks(to.timeslotId);

        allTasks[from.id].timeslotId = to.timeslotId;

        toTimeslotTasks.push(from);
        updateTimeslotTasks(to.timeslotId, toTimeslotTasks);

        for (let i = to.order; i < toTimeslotTasks.length; i++) {
            toTimeslotTasks[i].order = i + 1;
        }

        toTimeslotTasks[toTimeslotTasks.length - 1].order = to.order - 1;

        console.log(fromTimeslotTasks);
        console.log(toTimeslotTasks);
    }
    renderList();
};

const randomElement = <T>(array: T[]) => {
    return array[Math.floor(Math.random() * array.length)];
};

const printView = async () => {
    const newWindow = window.open();
    if (!newWindow) return;

    const colors = ["red", "orange", "yellow", "blue", "green"];
    let fragment = newWindow.document.createDocumentFragment();

    let timeslotsFragment = newWindow.document.createDocumentFragment();

    const name = newWindow.document.createElement("h1");
    name.innerHTML = timetableOptions.name;
    name.style.marginBottom = "0";
    fragment.appendChild(name);

    if (timetableOptions.day) {
        const day = newWindow.document.createElement("em");
        day.innerHTML = timetableOptions.day;
        fragment.appendChild(day);
    }

    let i = 0;

    for (const timeSlot of timeSlots) {
        const newTimeSlot = newWindow.document.createElement("li");
        addClass(newTimeSlot, "timeline-slot");
        newTimeSlot.id = `timeslot-${timeSlot.id}`;

        const newTimeSlotInfo = newWindow.document.createElement("div");
        addClass(newTimeSlotInfo, "timeslot-content");
        newTimeSlotInfo.innerHTML = replaceStrings(
            '&nbsp;%CLOCK%&nbsp;<div class="timeline-time">%START% - %END%</div>&nbsp;%ARROWS%&nbsp;<h3>%NAME%</h3>',
            ["name", timeSlot.name],
            ["start", intToStime(timeSlot.start)],
            ["end", intToStime(timeSlot.finalEnd)],
            [
                "clock",
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-fill" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
          </svg>`,
            ],
            [
                "arrows",
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
          </svg>`,
            ]
        );

        const letter = newWindow.document.createElement("div");
        letter.innerHTML = String.fromCharCode("A".charCodeAt(0) + i++);

        letter.classList.add("ul-number", randomElement(colors));
        newTimeSlotInfo.insertBefore(letter, newTimeSlotInfo.firstChild);

        newTimeSlot.appendChild(newTimeSlotInfo);
        timeslotsFragment.appendChild(newTimeSlot);
    }

    const documentTimeSlots = newWindow.document.createElement("ol");
    documentTimeSlots.type = "A";
    documentTimeSlots.replaceChildren(timeslotsFragment);

    fragment.appendChild(documentTimeSlots);

    newWindow.document.title = "Print timetable";

    i = 0;
    const listItems = getList(
        {
            taskInfo:
                '&nbsp;%CLOCK%&nbsp;<div class="timeline-time">%START% - %END%</div>&nbsp;%ARROWS%&nbsp;<h3>%NAME%</h3>&nbsp;%SQUARE%',
        },
        (task) => {
            const number = newWindow.document.createElement("div");
            number.innerHTML = (++i).toString();
            number.classList.add("ul-number", randomElement(colors));
            task.insertBefore(number, task.firstChild);
        }
    );

    const css = await fetch("../print.css");
    const styleSheet = newWindow.document.createElement("style");
    styleSheet.innerHTML = await css.text();
    newWindow.document.head.appendChild(styleSheet);

    const list = newWindow.document.createElement("ol");
    list.replaceChildren(listItems);
    fragment.appendChild(list);

    newWindow.document.body.replaceChildren(fragment);

    newWindow.print();
};

const setDefaultDays = (select: HTMLSelectElement) => {
    for (let i = 0; i < 8; i++) {
        const option = document.createElement("option");
        option.value = i.toString();
        option.text = getDay(i);
        select.add(option);
    }
};

const setName = (e: SubmitEvent) => {
    e.preventDefault();
    // @ts-ignore
    timetableOptions.name = e.target.elements.GTimetableName.value;
};

const setDay = (e: Event) => {
    // @ts-ignore
    timetableOptions.day = getDay(e.target.value);
};

const saveConfig = () => {
    const config: Save = {
        ...timetableOptions,
        timeslots: timeSlots,
        tasks: allTasks,
    };

    const configString = JSON.stringify(config);
    const blob = new Blob([configString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "timetable-config.json";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
};

const loadConfig = (event: Event) => {
    if (!event.target || !(event.target instanceof HTMLInputElement)) return;

    const input = event.target;
    if (!input.files) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target?.result as string);
            if (!isSave(data)) throw new Error();
            timetableOptions.name = data.name;
            timetableOptions.day = data.name;
            timeSlots = data.timeslots;
            allTasks = data.tasks;

            for (const task of data.tasks) {
                const timeslotTasks = taskTimeslots.get(task.timeslotId) ?? [];
                timeslotTasks[task.order] = task.id;
                taskTimeslots.set(task.timeslotId, timeslotTasks);
            }

            renderList();
        } catch {
            return;
        } finally {
            input.value = "";
        }
    };
    reader.readAsText(file);
};

const clear = () => {
    timeSlots = [];
    allTasks = [];
    taskTimeslots.clear();
    renderList();
    const timeline = document.getElementById("timeline");
    if (!timeline) return;
    const noElem = document.createElement("h2");
    noElem.id = "noelem";
    noElem.innerText = "You have no tasks";
    timeline.replaceChildren(noElem);
    if (!timeline.parentElement) return;
    timeline.parentElement.style.display = "flex";
};

const handleDelete = (button: HTMLButtonElement) => {
    const parent = traverseUp(button, 4);
    if (!parent) return;
    const id = getId(parent.id);

    if (parent.id.startsWith("timeslot")) {
        timeSlots[id].deleted = true;
        const select = document.getElementById(
            "TTimeSlot"
        ) as HTMLSelectElement | null;
        if (select)
            for (let i = 0; i < select.options.length; i++)
                if (select.options[i].value === id.toString()) {
                    select.remove(i);
                    break;
                }
    } else {
        allTasks[id].deleted = true;
    }

    renderList();
};

document.addEventListener("DOMContentLoaded", async () => {
    const printButton = document.getElementById("print-button");
    if (!printButton) return;
    printButton.addEventListener("click", printView);

    const settings = await (await fetch("../settings.json")).json();

    timetableOptions.name = settings.defaultName;
    timetableOptions.day = getDay(settings.defaultDay);

    const nameForm = document.getElementById("name");
    if (!nameForm) return;
    (nameForm.childNodes[3] as HTMLInputElement).value = settings.defaultName;
    nameForm.addEventListener("submit", setName);

    const dayForm = document.getElementById("day");
    if (!dayForm) return;
    const days = dayForm.childNodes[3] as HTMLSelectElement;
    setDefaultDays(days);
    days.value = settings.defaultDay;
    days.addEventListener("change", setDay);

    const saveButton = document.getElementById("save-button");
    if (!saveButton) return;
    saveButton.addEventListener("click", saveConfig);

    const loadButton = document.getElementById("load-button");
    if (!loadButton) return;
    loadButton.addEventListener("change", loadConfig);

    const clearButton = document.getElementById("clear-button");
    if (!clearButton) return;
    clearButton.addEventListener("click", clear);

    addIcons(printButton, "printer-fill");
    addIcons(saveButton, "save-fill");
    addIcons(clearButton, "x-circle-fill");
});
