interface TimeSlot {
    id: number;
    name: string;
    start: number;
    end: number;
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

const renderList = () => {
    let fragment = document.createDocumentFragment();
    for (const timeSlot of timeSlots) {
        const newTimeSlot = document.createElement("li");
        addClass(newTimeSlot, "timeline-slot");
        newTimeSlot.id = `timeslot-${timeSlot.id}`;

        const newTimeSlotInfo = document.createElement("div");
        addClass(newTimeSlotInfo, "timeslot-content");
        newTimeSlotInfo.innerHTML = `<h2>${
            timeSlot.name
        }</h2>\n<div class="timeline-time">${intToStime(
            timeSlot.start
        )} - ${intToStime(timeSlot.end)}</div>`;

        newTimeSlot.appendChild(newTimeSlotInfo);
        fragment.appendChild(newTimeSlot);

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
            newTask.draggable = true;
            newTask.id = `task-${task.id}`;
            newTask.addEventListener("dragend", handleDragEnd);

            const newTaskInfo = document.createElement("div");
            addClass(newTaskInfo, "timeline-content");
            newTaskInfo.innerHTML = `<h3>${
                task.name
            }</h3>\n<div class="timeline-time">${intToStime(
                currentTime
            )} - ${intToStime((currentTime += task.length))}</div>`;

            if (currentTime > timeSlot.end) addClass(newTask, "task-error");
            newTask.appendChild(newTaskInfo);
            fragment.appendChild(newTask);
        }
    }

    const timeline = document.getElementById("timeline");
    if (!timeline) return;
    timeline.replaceChildren(fragment);
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

// TODO: Refactor: make get list its own function, and generate a list, using different templates
document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("print-button");
    if (!button) return;
    button.addEventListener("click", () => {
        const newWindow = window.open();
        if (!newWindow) return;
        newWindow.document.title = "Print timetable";
        newWindow.document.body.innerHTML = "<h2>Hello world</h2>";
        newWindow.print();
    });
});

/* 
    TODO:
    - Add other options, like name for the timetable
    - Add saving and loading configs
    - Add option to clear configs
*/

/* TODO: To get it working
    - Refactor to allow render to render elements with a given template
    - Figure out how to have separate style sheets for print view
    - Style print view
    & we're done for tonight!

*/
