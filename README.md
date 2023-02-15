# School planner

A project that automatically generates my plan for the next day

## TODO:

1.  ~~Add dragging to other timeslots~~
1.  ~~Settings.json~~
1.  ~~Add other options, like name for the timetable~~
    ~~<br/>-> name~~
    ~~<br/>-> day~~
1.  ~~Add checkboxes in the print view~~
1.  ~~Add saving and loading configs~~
1.  ~~Add option to clear current configs~~
1.  ~~Add deleting and editing to tasks and timeslots~~
    ~~<br/>-> for deleting, instead of actually deleting, just use a property of the instance~~
1.  ~~Change default dragging cursor~~
1.  ~~Find a better colour pallet and layout
    -> https://coolors.co/2b2d42-8d99ae-edf2f4-e6c260-ef233c-d90429
    -> https://www.figma.com/file/fZKNDonKnhY0Uk2dHYmIwc/Untitled?node-id=0%3A1&t=WC7003374GTmoHxB-0~~
1.  ~~Fix bug where you cant drag items on timeslots~~
1.  ~~Add constants enum~~
1.  Fix bug in removing values from dropdown when clearing lists
1.  ~~Fix bug where deleted category is rendered in print view~~
1.  Code for setting default day, to be implemented:

    ```js
    const now = new Date();
    let day = now.getDay();

    if (now.getHours() >= 18) day++;
    if (day === 7) day = 0;

    console.log(day);
    ```

1.  Presets
1.  Editing tasks
1.  Copying tasks
1.  Change save name to the name of the timetable
1.  Auto close print view when printed
1.  Implement webpack
1.  ~~fix bug encountred when deleting tasksin multiple time slots~~
1.  FUTURE: Themes
    <br />-> Would it be possible to do theme previews?
