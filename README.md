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
1.  Find a better colour pallet and layout
    -> https://coolors.co/palette/2b2d42-8d99ae-edf2f4-ef233c-d90429
1.  Presets
1.  Fix bug in removing values from dropdown when clearing lists

1.  Code for setting default day, to be implemented:

    ```js
    const now = new Date();
    let day = now.getDay() + 1;

    if (day === 1) {
        if (now.getHours() <= 18) day = 0;
        else day = 1;
    } else if (day === 7) day = 0;

    console.log(day);
    ```

1.  Properly do editing tasks
1.  Copying tasks
1.  Change save name to the name of the timetable
1.  Auto close print view when printed
1.  FUTURE: Themes
    <br />-> Would it be possible to do theme previews?
