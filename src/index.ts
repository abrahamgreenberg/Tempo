let settings: any;

interface Item {
    id: number;
    name: string;
    deleted: boolean;
}

interface PresetItem {
    name: string;
}

interface PresetTimeSlot extends PresetItem {
    start: number;
    end: number;
}

interface PresetTask extends PresetItem {
    length: number;
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
    day: number;
}

interface Save {
    name: string;
    day: number;
    timeslots: TimeSlot[];
    tasks: Task[];
}

enum Constants {
    iconsArrow = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16">
    <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
  </svg>`,
    iconsSquare = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
</svg>`,
    iconsClock = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clock-fill" viewBox="0 0 16 16">
<path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
</svg>`,
}

const printViewColors = ["red", "orange", "yellow", "blue", "green"];

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

const isPresetTimeSlot = (obj: any): obj is PresetTimeSlot => {
    return (
        obj &&
        typeof obj === "object" &&
        typeof obj.name === "string" &&
        typeof obj.start === "number" &&
        typeof obj.end === "number"
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

const isPresetTask = (obj: any): obj is PresetTask => {
    return (
        obj &&
        typeof obj === "object" &&
        typeof obj.name === "string" &&
        typeof obj.length === "number"
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
    day: 0,
};

let timeSlots: TimeSlot[] = [];
let presetTimeslots: PresetTimeSlot[] = [];
let allTasks: Task[] = [];
let presetTasks: PresetTask[] = [];
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
    const split = string.split(":");
    if (split.length !== 2) return false;
    const hours = Math.abs(parseInt(split[0]));
    const mins = Math.abs(parseInt(split[1]));
    if (isNaN(hours) || isNaN(mins)) return false;
    if (hours > 23 || mins > 60) return false;
    return hours * 60 + mins;
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

const validateTimes = (
    start: number | false,
    end: number | false,
    edit = false
): string | [number, number] => {
    if (start === false || end === false) return "Invalid times";

    if (start > end) return "Start can't be later than the end";

    if (!edit)
        for (const slot of timeSlots)
            if (start < slot.end && end > slot.start && !slot.deleted)
                return "There is already another time slot in those times!";

    return [start, end];
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

    const timesValid = validateTimes(start, end);
    if (typeof timesValid === "string") return error(timesValid, "TimeError");

    timeSlots.push({
        id: timeSlots.length,
        // @ts-ignore
        name: e.target.elements.TSName.value,
        start: timesValid[0],
        end: timesValid[1],
        finalEnd: timesValid[1],
        deleted: false,
    });

    timeSlots = timeSlots.sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
    });

    e.target.reset();

    renderTimeslotDropdown();

    removeErrors("TSTimeError");

    renderList();
    return true;
};

const addDefaultTimeSlot = (e: SubmitEvent & { target: HTMLFormElement }) => {
    e.preventDefault();
    const error = (message: string, ...elements: string[]) => {
        for (const element of elements) displayError(`DTS${element}`, message);
        return false;
    };
    if (!e.target) return;

    const id = parseInt(e.target.DTimeSlot.value as string);
    const timeslot = presetTimeslots[id];
    for (const slot of timeSlots)
        if (
            timeslot.start < slot.end &&
            timeslot.end > slot.start &&
            !slot.deleted
        )
            return error(
                "There is already another time slot in those times!",
                "TimeError"
            );

    timeSlots.push({
        id: timeSlots.length,
        name: timeslot.name,
        start: timeslot.start,
        end: timeslot.end,
        finalEnd: timeslot.end,
        deleted: false,
    });

    timeSlots = timeSlots.sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
    });

    e.target.reset();

    renderTimeslotDropdown();

    removeErrors("DTSTimeError");

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

const addDefaultTask = (e: SubmitEvent & { target: HTMLFormElement }) => {
    e.preventDefault();
    // @ts-ignore
    const timeslotId = parseInt(document.getElementById("TTimeSlot").value);
    const id = parseInt(e.target.DTask.value as string);

    if (isNaN(timeslotId)) return;

    const presetTask = presetTasks[id];

    const timeslotTasks = taskTimeslots.get(timeslotId) ?? [];

    const task = allTasks.push({
        id: allTasks.length,
        name: presetTask.name,
        length: presetTask.length,
        order: timeslotTasks.length,
        timeslotId,
        deleted: false,
    });

    timeslotTasks.push(task - 1);
    taskTimeslots.set(timeslotId, timeslotTasks);

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

const createTimeslotElement = (
    template: string,
    document: Document,
    timeSlot: TimeSlot,
    replacements: [string, string][],
    callback?: itemCallBack
) => {
    if (timeSlot.deleted) return false;
    const newTimeSlot = document.createElement("li");
    addClass(newTimeSlot, "timeline-slot");
    newTimeSlot.id = `timeslot-${timeSlot.id}`;

    const newTimeSlotInfo = document.createElement("div");
    addClass(newTimeSlotInfo, "timeslot-content");
    if (callback) callback(newTimeSlot);

    newTimeSlotInfo.innerHTML = replaceStrings(
        template,
        ["name", timeSlot.name],
        ["clock", Constants.iconsClock],
        ["start", intToStime(timeSlot.start)],
        ...replacements
    );

    newTimeSlot.appendChild(newTimeSlotInfo);
    return newTimeSlot;
};

const getList = (
    template: renderTemplate,
    taskCallBack?: itemCallBack,
    timeslotCallBack?: itemCallBack
) => {
    let fragment = document.createDocumentFragment();

    let renderedTimeslots = 0;

    for (const timeSlot of timeSlots) {
        if (timeSlot.deleted) continue;

        renderedTimeslots++;

        const buttonIcon = (name: string, iconName: string) => {
            return `<button class="${name}-button" onclick="handle${
                name.charAt(0).toUpperCase() + name.slice(1)
            }(this)">${icon(iconName)}</button>`;
        };

        const buttons = `<div class="buttons">
        ${buttonIcon("copy", "clipboard-plus")}
        ${buttonIcon("edit", "pencil-square")}
        ${buttonIcon("delete", "trash-fill")}
        </div>`;

        if (template.timeslotInfo) {
            const tsElem = createTimeslotElement(
                template.timeslotInfo,
                document,
                timeSlot,
                [
                    ["end", intToStime(timeSlot.end)],
                    ["buttons", buttons],
                ],
                timeslotCallBack
            );
            if (tsElem) fragment.appendChild(tsElem);
            else continue;
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
                ["buttons", buttons],
                ["clock", Constants.iconsClock],
                ["arrows", Constants.iconsArrow],
                ["square", Constants.iconsSquare]
            );

            if (currentTime > timeSlot.end) addClass(newTask, "task-error");
            newTask.appendChild(newTaskInfo);
            fragment.appendChild(newTask);
        }

        timeSlots[timeSlot.id].finalEnd = currentTime;
    }

    if (renderedTimeslots === 0) {
        const noElem = document.createElement("h2");
        noElem.id = "noelem";
        noElem.innerText = "You have no tasks";
        fragment.replaceChildren(noElem);
    }

    return fragment;
};

const renderList = () => {
    const list = getList(
        {
            timeslotInfo: settings.listViewTimeslot,
            taskInfo: settings.listViewTask,
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
    const noElem = list.firstElementChild?.id === "noelem";
    timeline.replaceChildren(list);
    if (!timeline.parentElement) return;
    if (timeline.parentElement.style.display !== "block" && !noElem)
        timeline.parentElement.style.display = "block";
    else if (noElem) timeline.parentElement.style.display = "flex";
};

const renderTimeslotDropdown = () => {
    const timeslotsFragment = document.createDocumentFragment();

    for (const timeslot of timeSlots) {
        if (timeslot.deleted) continue;
        let option = document.createElement("option");
        option.text = timeslot.name;
        option.value = timeslot.id.toString();
        timeslotsFragment.appendChild(option);
    }
    (
        document.getElementById("TTimeSlot") as HTMLSelectElement | null
    )?.replaceChildren(timeslotsFragment);
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

    // @ts-ignore
    const from = findTask(getId(event.srcElement.id));

    if (target_element.className === "timeline-slot") {
        const timeslot = timeSlots[+getId(target_element.id)];
        if (from.timeslotId === timeslot.id) return;
        const newTimeslotTasks = getTimeslotTasks(timeslot.id);
        let currentTimeslotTasks = getTimeslotTasks(from.timeslotId);

        currentTimeslotTasks = currentTimeslotTasks.filter((task) => {
            return task.id !== from.id;
        });
        updateTimeslotTasks(from.timeslotId, currentTimeslotTasks);

        for (let i = 0; i < newTimeslotTasks.length; i++)
            newTimeslotTasks[i].order = i + 1;
        from.timeslotId = timeslot.id;
        from.order = 0;
        newTimeslotTasks.unshift(from);
        updateTimeslotTasks(timeslot.id, newTimeslotTasks);
        renderList();

        return;
    }

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
    }
    renderList();
};

const randomElement = <T>(array: T[]) => {
    return array[Math.floor(Math.random() * array.length)];
};

const selectColor = (prevColor1: string | null, prevColor2: string | null) => {
    const colors = printViewColors;
    let probs = new Array(colors.length).fill(1);

    if (prevColor1) {
        probs[colors.indexOf(prevColor1)] *= 0.5;
    }

    if (prevColor2) {
        probs[colors.indexOf(prevColor2)] *= 0.2;
        for (let i = 0; i < probs.length; i++) {
            if (i !== colors.indexOf(prevColor2)) {
                probs[i] *= 0.8;
            }
        }
    }

    let totalProb = probs.reduce((a, b) => a + b);
    let rand = Math.random() * totalProb;
    for (let i = 0; i < probs.length; i++) {
        if (rand < probs[i]) {
            return colors[i];
        }
        rand -= probs[i];
    }
    return colors[0];
};

const printView = async () => {
    const newWindow = window.open();
    if (!newWindow) return;

    let fragment = newWindow.document.createDocumentFragment();

    let timeslotsFragment = newWindow.document.createDocumentFragment();

    const name = newWindow.document.createElement("h1");
    name.innerHTML = timetableOptions.name;
    name.style.marginBottom = "0";
    fragment.appendChild(name);

    if (timetableOptions.day) {
        const day = newWindow.document.createElement("em");
        day.innerHTML = getDay(timetableOptions.day);
        fragment.appendChild(day);
    }

    let i = 0;

    let prevColor1: string | null = null;
    let prevColor2: string | null = null;

    for (const timeSlot of timeSlots) {
        const timeslotElem = createTimeslotElement(
            settings.printViewTimeslot,
            newWindow.document,
            timeSlot,
            [
                ["end", intToStime(timeSlot.finalEnd)],
                ["arrows", Constants.iconsArrow],
            ],
            (timeslot) => {
                const letter = newWindow.document.createElement("div");
                letter.innerHTML = String.fromCharCode("A".charCodeAt(0) + i++);
                const color = selectColor(prevColor1, prevColor2);
                letter.classList.add("ul-number", color);
                prevColor2 = prevColor1;
                prevColor1 = color;
                timeslot.insertBefore(letter, timeslot.firstChild);
            }
        );
        if (!timeslotElem) continue;
        timeslotsFragment.appendChild(timeslotElem);
    }

    const documentTimeSlots = newWindow.document.createElement("ol");
    documentTimeSlots.type = "A";
    documentTimeSlots.replaceChildren(timeslotsFragment);

    fragment.appendChild(documentTimeSlots);

    newWindow.document.title = "Print timetable";

    i = 0;
    const listItems = getList(
        {
            taskInfo: settings.printViewTask,
        },
        (task) => {
            const number = newWindow.document.createElement("div");
            number.innerHTML = (++i).toString();
            const color = selectColor(prevColor1, prevColor2);
            number.classList.add("ul-number", color);
            prevColor2 = prevColor1;
            prevColor1 = color;
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

    const regenerate = newWindow.document.createElement("button");
    regenerate.innerText = "Regenerate colours";
    regenerate.className = "no-print";
    regenerate.addEventListener("click", () => {
        const lists = newWindow.document.getElementsByTagName("ol");
        for (const list of lists) {
            for (const elem of list.children) {
                const div = elem.firstChild as HTMLElement;
                div.classList.remove(...printViewColors);
                const color = selectColor(prevColor1, prevColor2);
                div.classList.add(color);
                prevColor2 = prevColor1;
                prevColor1 = color;
            }
        }
    });
    fragment.appendChild(regenerate);

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
    timetableOptions.day = parseInt(e.target.value);
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
            loadSave(data);
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
    renderTimeslotDropdown();
};

const getPopup = () => {
    return document.getElementById("popup");
};

const setPrompt = (text: string) => {
    const prompt = document.getElementById("popup-prompt");
    if (prompt) prompt.innerText = text;
};

const isToggled = (popup: HTMLElement) => {
    return popup.style.direction === "flex";
};

const togglePopup = (state?: boolean, popup_?: HTMLElement) => {
    const popup = popup_ !== undefined ? popup_ : getPopup();
    if (popup === null) return;
    if ((isToggled(popup) && !state) || state === false)
        popup.style.display = "none";
    else popup.style.display = "flex";
};

interface InputCall {
    prompt: string;
    type: "string" | "integer" | "time";
    value?: string;
    required?: boolean;
}

const popupInput = async (
    params: InputCall
): Promise<number | string | false> => {
    const popup = getPopup();
    if (!popup) return false;
    togglePopup(true, popup);
    setPrompt(params.prompt);

    const input = document.getElementById("popup-input");
    if (input === null || !(input instanceof HTMLInputElement)) return false;
    input.select();
    input.value = params.value ? params.value : "";

    const inputPromise: Promise<string | number | false> = new Promise(
        (resolve) => {
            input.addEventListener("keydown", (e: KeyboardEvent) => {
                if (e.key === "Enter") {
                    if (params.required === true && input.value.length === 0)
                        return;
                    if (params.type === "integer") {
                        const value = parseInt(input.value);
                        if (isNaN(value)) return;
                        else return resolve(Math.abs(value));
                    } else if (params.type === "time") {
                        return resolve(stimeToInt(input.value));
                    } else {
                        return resolve(input.value);
                    }
                } else if (e.key === "Escape") {
                    return resolve(false);
                }
            });
        }
    );
    return inputPromise;
};

const getInputs = async (
    inputs: InputCall[]
): Promise<(string | number)[] | false> => {
    const returnArray = [];

    for (const inputCall of inputs) {
        const input = await popupInput(inputCall);
        if (input === false) {
            togglePopup(false);
            return false;
        }
        returnArray.push(input);
    }

    togglePopup(false);

    return returnArray;
};

const handleDelete = (button: HTMLButtonElement) => {
    const parent = traverseUp(button, 4);
    if (!parent) return;
    const id = getId(parent.id);

    if (parent.id.startsWith("timeslot")) {
        timeSlots[id].deleted = true;
        renderTimeslotDropdown();
    } else {
        allTasks[id].deleted = true;
    }

    renderList();
};

const handleEdit = async (button: HTMLButtonElement) => {
    const parent = traverseUp(button, 4);
    if (!parent) return;
    const id = getId(parent.id);

    if (parent.id.startsWith("timeslot")) {
        const timeslot = timeSlots[id];

        const newValues = await getInputs([
            {
                prompt: "Name",
                type: "string",
                value: timeslot.name,
                required: true,
            },
            {
                prompt: "Start",
                type: "time",
                value: intToStime(timeslot.start),
                required: true,
            },
            {
                prompt: "End",
                type: "time",
                value: intToStime(timeslot.end),
                required: true,
            },
        ]);

        if (newValues === false) return;

        timeslot.name = newValues[0] as string;
        const start = newValues[1] as number;
        const end = newValues[2] as number;

        if (typeof validateTimes(start, end, true) === "string") return;
        timeslot.start = start;
        timeslot.end = end;
    } else {
        const task = allTasks[id];

        const newValues = await getInputs([
            {
                prompt: "Name",
                type: "string",
                value: task.name,
                required: true,
            },
            {
                prompt: "Length (minutes)",
                type: "integer",
                value: task.length.toString(),
                required: true,
            },
        ]);

        if (newValues === false) return;

        task.name = newValues[0] as string;
        task.length = newValues[1] as number;
    }
    renderList();
};

const updateFormNameAndDay = () => {
    const nameForm = document.getElementById("name");
    if (!nameForm) return;
    (nameForm.childNodes[3] as HTMLInputElement).value = timetableOptions.name;
    nameForm.addEventListener("submit", setName);

    const dayForm = document.getElementById("day");
    if (!dayForm) return;
    const days = dayForm.childNodes[3] as HTMLSelectElement;
    if (days.children.length === 0) setDefaultDays(days);
    days.value = timetableOptions.day.toString();
    days.addEventListener("change", setDay);
};

const loadSave = (save: Save) => {
    timetableOptions.name = save.name;
    timetableOptions.day = save.day;
    timeSlots = save.timeslots;
    allTasks = save.tasks;

    for (const task of save.tasks) {
        const timeslotTasks = taskTimeslots.get(task.timeslotId) ?? [];
        timeslotTasks[task.order] = task.id;
        taskTimeslots.set(task.timeslotId, timeslotTasks);
    }

    renderList();
    renderTimeslotDropdown();
    updateFormNameAndDay();
};

const testData = () => {
    const testSave: Save = {
        name: "Test",
        day: 1,
        timeslots: [
            {
                name: "Morning",
                deleted: false,
                start: 540,
                end: 660,
                finalEnd: 660,
                id: 0,
            },
            {
                name: "Lunch",
                deleted: false,
                start: 765,
                end: 825,
                finalEnd: 825,
                id: 1,
            },
            {
                name: "After school",
                deleted: false,
                start: 1020,
                end: 1170,
                finalEnd: 1170,
                id: 2,
            },
        ],
        tasks: [
            {
                deleted: false,
                id: 0,
                length: 60,
                name: "Math hw",
                order: 0,
                timeslotId: 0,
            },
            {
                deleted: false,
                id: 1,
                length: 60,
                name: "Computer science hw",
                order: 1,
                timeslotId: 0,
            },
            {
                deleted: false,
                id: 2,
                length: 60,
                name: "Economics",
                order: 0,
                timeslotId: 1,
            },
            {
                deleted: false,
                id: 3,
                length: 30,
                name: "Economics",
                order: 0,
                timeslotId: 2,
            },
            {
                deleted: false,
                id: 4,
                length: 30,
                name: "Math",
                order: 1,
                timeslotId: 2,
            },
            {
                deleted: false,
                id: 5,
                length: 60,
                name: "Coursework",
                order: 2,
                timeslotId: 2,
            },
            {
                deleted: false,
                id: 6,
                length: 60,
                name: "Trombone",
                order: 3,
                timeslotId: 2,
            },
        ],
    };

    loadSave(testSave);
};

const setPresets = (settings: any) => {
    if (!settings.presetTimeslots || !settings.presetTasks) return;
    const timeslotsFragment = document.createDocumentFragment();

    for (const timeslot of settings.presetTimeslots) {
        if (!isPresetTimeSlot(timeslot)) return;
        presetTimeslots.push(timeslot);
        let option = document.createElement("option");
        option.text = timeslot.name;
        option.value = (presetTimeslots.length - 1).toString();
        timeslotsFragment.appendChild(option);
    }

    (
        document.getElementById("DTimeSlot") as HTMLSelectElement | null
    )?.replaceChildren(timeslotsFragment);

    const tasksFragment = document.createDocumentFragment();
    for (const task of settings.presetTasks) {
        if (!isPresetTask(task)) continue;
        presetTasks.push(task);
        let option = document.createElement("option");
        option.text = task.name;
        option.value = (presetTasks.length - 1).toString();
        tasksFragment.appendChild(option);
    }

    (
        document.getElementById("DTask") as HTMLSelectElement | null
    )?.replaceChildren(tasksFragment);
};

document.addEventListener("DOMContentLoaded", async () => {
    const printButton = document.getElementById("print-button");
    if (!printButton) return;
    printButton.addEventListener("click", printView);

    settings = await (await fetch("../settings.json")).json();

    setPresets(settings);

    timetableOptions.name = settings.defaultName;

    const now = new Date();
    let day = now.getDay();

    if (now.getHours() - now.getTimezoneOffset() / 60 >= 18) day++;
    if (day === 7) day = 0;
    timetableOptions.day = day;

    updateFormNameAndDay();

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

    testData();
});
