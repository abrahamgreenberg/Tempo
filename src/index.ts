interface TimeSlot {
    id: number;
    name: string;
    start: number;
    end: number;
    finalEnd: number;
}

interface Task {
    id: number;
    name: string;
    length: number;
    order: number;
    timeslotId: number;
}

let timeSlots: TimeSlot[] = [];
const allTasks: Task[] = [];
const taskTimeslots: Map<number, number[]> = new Map();

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
    const minutes = int % 60;
    const hours = (int - minutes) / 60;
    return `${hours}:${minutes.toLocaleString("en-US", {
        minimumIntegerDigits: 2,
        useGrouping: false,
    })}`;
};

const getTimeslotTasks = (timeslotId: number) => {
    let timeslotTasks: number[] = taskTimeslots.get(timeslotId) ?? [];
    let returnArray: Task[] = [];
    for (let i = 0; i < timeslotTasks.length; i++)
        returnArray.push(allTasks[timeslotTasks[i]]);
    return returnArray;
};

const checkForClass = (element: Element, className: string) => {
    let i = 0;

    while (element.parentNode) {
        if (element.classList.contains(className)) return i;
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
        if (start < slot.end && end > slot.start)
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

type taskCallBack = (item: HTMLLIElement) => void;

const getList = (template: renderTemplate, taskCallBack?: taskCallBack) => {
    let fragment = document.createDocumentFragment();

    for (const timeSlot of timeSlots) {
        if (template.timeslotInfo) {
            const newTimeSlot = document.createElement("li");
            addClass(newTimeSlot, "timeline-slot");
            newTimeSlot.id = `timeslot-${timeSlot.id}`;

            const newTimeSlotInfo = document.createElement("div");
            addClass(newTimeSlotInfo, "timeslot-content");
            newTimeSlotInfo.innerHTML = replaceStrings(
                template.timeslotInfo,
                ["name", timeSlot.name],
                ["start", intToStime(timeSlot.start)],
                ["end", intToStime(timeSlot.end)]
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
            const newTask = document.createElement("li");
            addClass(newTask, "timeline-task");
            if (taskCallBack) taskCallBack(newTask);
            newTask.id = `task-${task.id}`;

            const newTaskInfo = document.createElement("div");
            addClass(newTaskInfo, "timeline-content");
            newTaskInfo.innerHTML = replaceStrings(
                template.taskInfo,
                ["name", task.name],
                ["start", intToStime(currentTime)],
                ["end", intToStime((currentTime += task.length))]
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
                '<h2>%NAME%</h2>\n<div class="timeline-time">%START% - %END%</div>',
            taskInfo:
                '<h3>%NAME%</h3>\n<div class="timeline-time">%START% - %END%</div>',
        },
        (task) => {
            task.addEventListener("dragend", handleDragEnd);
            task.draggable = true;
        }
    );

    const timeline = document.getElementById("timeline");
    if (!timeline) return;
    timeline.replaceChildren(list);
    if (!timeline.parentElement) return;
    timeline.parentElement.style.display = "block";
};

const handleDragEnd = (event: DragEvent) => {
    // @ts-ignore
    if (!event.srcElement.classList.contains("timeline-task")) return;
    let target_element = document.elementFromPoint(
        event.clientX,
        event.clientY
    );
    if (!target_element) return;
    const parent = checkForClass(target_element, "timeline-task");
    if (!parent) return;
    target_element = traverseUp(target_element, parent);

    const getId = (string: string) => {
        const split = string.split("-");
        return +split[split.length - 1];
    };

    const findTask = (id: number) => {
        return allTasks.find((obj) => {
            return obj.id === id;
        });
    };

    // @ts-ignore
    const from = findTask(getId(event.srcElement.id));
    // @ts-ignore
    const to = findTask(getId(target_element.id));
    if (!from || !to) return;

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
    }
    // TODO: Handle if task moves to different time slot
    renderList();
};

const randomElement = <T>(array: T[]) => {
    return array[Math.floor(Math.random() * array.length)];
};

const printView = async () => {
    const newWindow = window.open();
    if (!newWindow) return;

    const colors = ["red", "green", "orange", "blue", "purple"];
    // TODO: "Subway theming" https://chat.openai.com/chat/8698b809-f201-4deb-a995-6082d7034f4f
    let fragment = newWindow.document.createDocumentFragment();

    let timeslotsFragment = newWindow.document.createDocumentFragment();

    let i = 0;

    for (const timeSlot of timeSlots) {
        const newTimeSlot = newWindow.document.createElement("li");
        addClass(newTimeSlot, "timeline-slot");
        newTimeSlot.id = `timeslot-${timeSlot.id}`;

        const newTimeSlotInfo = newWindow.document.createElement("div");
        addClass(newTimeSlotInfo, "timeslot-content");
        newTimeSlotInfo.innerHTML = replaceStrings(
            '<div class="timeline-time">&nbsp;%START% - %END%</div><h2>&nbsp;&nbsp;%NAME%</h2>',
            ["name", timeSlot.name],
            ["start", intToStime(timeSlot.start)],
            ["end", intToStime(timeSlot.finalEnd)]
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
                '<div class="timeline-time">&nbsp;%START% - %END%</div><h3>&nbsp;&nbsp;%NAME%</h3>',
        },
        (task) => {
            const number = newWindow.document.createElement("div");
            number.innerHTML = (++i).toString();
            number.classList.add("ul-number", randomElement(colors));
            task.insertBefore(number, task.firstChild);
        }
    );

    const css = await fetch("../print.css");
    const style = newWindow.document.createElement("style");
    style.innerHTML = await css.text();
    newWindow.document.head.appendChild(style);

    const list = newWindow.document.createElement("ol");
    list.replaceChildren(listItems);
    fragment.appendChild(list);

    newWindow.document.body.replaceChildren(fragment);

    newWindow.print();
};

document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("print-button");
    if (!button) return;
    button.addEventListener("click", printView);
});

/* 
    TODO:
    - Add other options, like name for the timetable
    - Add checkboxes in the print view
    - Add saving and loading configs
    - Add option to clear configs
*/
