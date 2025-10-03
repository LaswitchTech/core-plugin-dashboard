// Dashboard Layout
builder.add('layouts','dashboard', class extends builder.ComponentClass {

    _init(){
        this._properties = {
            class: {
                component: null,
            },
        };
        this._widgets = {};
        this._dashboard = null;
        this._count = 0;
        this._rows = {};
        this._mode = "view";
    }

    _create(){

        // Set Self
        const self = this;

        // Create Component
        this._component = $(document.createElement('div')).attr({
            'id': 'dashboard' + this._id,
            'class': 'dashboard position-relative d-none',
        });
        this._component.id = this._component.attr('id');

        // Add Class
        if(this._properties.class.component){
            this._component.addClass(this._properties.class.component);
        }

        // Add a controls area
        this._component.controls = $(document.createElement("div")).attr({
            "class":"d-none"
        }).appendTo(($('#pageTitle').length > 0) ? $('#pageTitle') : this._component);

        // Add Buttons - Edit
        this._component.controls.edit = $(document.createElement("button")).attr({
            "class":"btn mx-1 btn-sm btn-warning",
            "data-action-mode":"view",
        }).html('<i class="bi bi-pencil me-1"></i>'+this._builder.Locale.get('Edit')).appendTo(this._component.controls).click(function(){

            // Update the mode
            self._mode = 'edit';

            // Render the dashboard
            self.render();
        });

        // Add Buttons - Import
        this._component.controls.import = $(document.createElement("button")).attr({
            "class":"btn mx-1 btn-sm btn-primary text-light",
            "data-action-mode":"edit",
        }).html('<i class="bi bi-upload me-1"></i>'+this._builder.Locale.get('Import')).appendTo(this._component.controls).click(function(){
            self.import();
        });

        // Add Buttons - Export
        this._component.controls.export = $(document.createElement("button")).attr({
            "class":"btn mx-1 btn-sm btn-secondary text-light",
            "data-action-mode":"edit",
        }).html('<i class="bi bi-download me-1"></i>'+this._builder.Locale.get('Export')).appendTo(this._component.controls).click(function(){
            self.export();
        });

        // Add Buttons - Save
        this._component.controls.save = $(document.createElement("button")).attr({
            "class":"btn mx-1 btn-sm btn-success text-light",
            "data-action-mode":"edit",
        }).html('<i class="bi bi-save me-1"></i>'+this._builder.Locale.get('Save')).appendTo(this._component.controls).click(function(){

            // Save the dashboard
            self.save(true);

            // Update the mode
            self._mode = 'view';

            // Render the dashboard
            self.render();
        });

        // Create a button group
        this._component.group = $(document.createElement("div")).attr({
            "class": "btn-group w-100 shadow mt-2",
            "data-action-mode":"edit",
        }).addClass("").appendTo(this._component);

        // Create an add button
        this._component.controls.add = $(document.createElement("button")).attr({
            "class":"btn btn-success",
        }).html('<i class="bi bi-plus-lg me-2"></i>'+this._builder.Locale.get("Row")).appendTo(this._component.group).click(function(){

            // Create a modal
            self._builder.Component(
                "modal",
                {
                    onEnter: false,
                    icon: "plus-lg",
                    size: "lg",
                    color: "success",
                    title: self._builder.Locale.get("Add Row"),
                },
                function(modal,component){

                    // Create buttons to add rows with 1 to 4 columns
                    for(let i = 1; i <= 4; i++){

                        // Create a button
                        const btn = $(document.createElement("button")).attr({
                            "class": "mt-0 btn btn-secondary w-100 p-2 d-flex row g-2 row-cols-"+i,
                            "data-cols": i,
                        }).appendTo(component.body);

                        // Check if the button is the first one
                        if(i > 1){ btn.addClass("mt-2"); }

                        // Add columns to the button
                        for(let j = 1; j <= i; j++){

                            // Create a column
                            const col = $(document.createElement("div")).addClass("col mt-0").appendTo(btn);
                            $(document.createElement("div")).addClass("text-bg-primary p-3 rounded").text(j).appendTo(col);
                        }

                        // Add a click event to the button
                        btn.click(function(){

                            // Show the modal spinner
                            modal.spinner(true);

                            // Create a new row
                            self.row(parseInt($(this).attr('data-cols')));

                            // Close the modal
                            modal.hide();
                        });
                    }

                    // Open the modal
                    modal.show();
                },
            );
        });

        // AJAX Call
        API.endpoint('/dashboard/fetch').execute(function(response){
            self.load(response.board);
        });
    }

    row(cols = 1){

        // Set Self
        const self = this;

        // Increment the row count
        this._count++;

        // Create a new row
        const row = $(document.createElement("div")).attr({
            "class": "row position-relative",
            "data-rowId": this._count,
            "data-cols": cols,
        }).insertBefore(this._component.group);

        // Set parameters
        row.id = row.attr('data-rowId');
        row.cols = cols;
        row.count = 0;
        row.columns = {};

        // Create Controls - Top
        row.topControls = $(document.createElement("div")).attr({
            "class":"btn-group position-absolute top-0 start-0 w-100 p-0 border-bottom shadow",
            "data-action-mode":"edit",
        }).appendTo(row);
        row.topControls.spacer = $(document.createElement("div")).attr({
            "class":"w-100",
            "data-action-mode":"edit",
            "style":"height: 50px;",
        }).appendTo(row);

        // Create Controls - Top - Move
        row.topControls.move = $(document.createElement("button")).attr({
            "class":"btn btn-light rounded-bottom-0",
        }).html('<i class="bi bi-arrows-move"></i>').appendTo(row.topControls).click(function(){});

        // Create Controls - Top - Remove
        row.topControls.remove = $(document.createElement("button")).attr({
            "class":"btn btn-danger rounded-bottom-0 flex-shrink-1 flex-grow-0",
        }).html('<i class="bi bi-trash"></i>').appendTo(row.topControls).click(function(){
            if(typeof self._rows[row.id] !== 'undefined'){
                delete self._rows[row.id];
            }
            row.remove();
        });

        // Create Controls - Bottom
        row.bottomControls = $(document.createElement("div")).attr({
            "class":"btn-group position-absolute bottom-0 start-0 w-100 p-0 border-top shadow",
            "data-action-mode":"edit",
        }).appendTo(row);
        row.bottomControls.spacer = $(document.createElement("div")).attr({
            "class":"w-100",
            "data-action-mode":"edit",
            "style":"height: 50px;",
        }).insertBefore(row.bottomControls);

        // Create Controls - Bottom - Add
        row.bottomControls.add = $(document.createElement("button")).attr({
            "class":"btn btn-success rounded-top-0",
        }).html('<i class="bi bi-plus-lg me-2"></i>'+this._builder.Locale.get("Column")).appendTo(row.bottomControls).click(function(){

            // Create a modal
            self._builder.Component(
                "modal",
                {
                    onEnter: false,
                    icon: "plus-lg",
                    size: "lg",
                    color: "success",
                    title: self._builder.Locale.get("Add Column"),
                },
                function(modal,component){

                    // Create buttons to add rows with 1 to 4 columns
                    for(let i = row.cols; i >= 1; i--){

                        // Create a button
                        const btn = $(document.createElement("button")).attr({
                            "class": "mt-0 btn btn-secondary w-100 p-2 d-flex row g-2 row-cols-"+row.cols,
                            "data-size": ((12 / row.cols) * i),
                        }).appendTo(component.body);

                        // Check if the button is the first one
                        if(i < row.cols){
                            btn.addClass("mt-2");
                        }

                        // Create a column for current size
                        const current = $(document.createElement("div")).addClass("col mt-0 col-"+btn.attr('data-size')).appendTo(btn);
                        $(document.createElement("div")).addClass("text-bg-primary p-3 rounded").text(i).appendTo(current);

                        // Add columns to the button
                        for(let j = 1; j <= (row.cols - i); j++){

                            // Create a column
                            const col = $(document.createElement("div")).addClass("col mt-0").appendTo(btn);
                            $(document.createElement("div")).addClass("text-bg-secondary p-3 rounded").text("1").appendTo(col);
                        }

                        // Add a click event to the button
                        btn.click(function(){

                            // Show the modal spinner
                            modal.spinner(true);

                            // Create a new column
                            self.col(row, parseInt($(this).attr('data-size')));

                            // Close the modal
                            modal.hide();
                        });
                    }

                    // Open the modal
                    modal.show();
                },
            );
        });

        // Function to add a column to the row
        row.add = function(size = 12){
            self.col(row, size);
        }

        // Save the row
        this._rows[this._count] = row;

        return this;
    }

    col(row, size = 12){

        // Set Self
        const self = this;

        // Increment the col count
        row.count++;

        // Create a new column
        const col = $(document.createElement("div")).attr({
            "class": "col position-relative",
            "data-colId": row.count,
            "data-size": size,
        }).insertBefore(row.bottomControls.spacer);

        // Set parameters
        col.id = col.attr('data-colId');
        col.size = size;
        col.count = 0;
        col.widgets = {};

        // Set responsive sizes
        switch(size){
            case 3:
                col.addClass("col-xxl-3");
                col.addClass("col-xl-6");
                col.addClass("col-lg-9");
                col.addClass("col-md-12");
                break;
            case 4:
                col.addClass("col-xl-4");
                col.addClass("col-lg-8");
                col.addClass("col-md-12");
                break;
            case 6:
                switch(row.cols){
                    case 4:
                        col.addClass("col-lg-6");
                        col.addClass("col-md-12");
                        break;
                    case 2:
                        col.addClass("col-lg-6");
                        col.addClass("col-md-12");
                        break;
                }
                break;
            case 8:
                col.addClass("col-lg-8");
                col.addClass("col-md-12");
                break;
            case 9:
                col.addClass("col-lg-9");
                col.addClass("col-md-12");
                break;
            case 12:
                col.addClass("col-md-12");
                break;
        }

        // Create Controls - Top
        col.topControls = $(document.createElement("div")).attr({
            "class":"btn-group position-absolute top-0 start-0 w-100 p-0 border-bottom shadow",
            "data-action-mode":"edit",
        }).appendTo(col);
        col.topControls.spacer = $(document.createElement("div")).attr({
            "class":"w-100",
            "data-action-mode":"edit",
            "style":"height: 6px;",
        }).appendTo(col);

        // Create Controls - Top - Move
        col.topControls.move = $(document.createElement("button")).attr({
            "class":"btn btn-light rounded-bottom-0",
        }).html('<i class="bi bi-arrows-move"></i>').appendTo(col.topControls).click(function(){});

        // Create Controls - Top - Remove
        col.topControls.remove = $(document.createElement("button")).attr({
            "class":"btn btn-danger rounded-bottom-0 flex-shrink-1 flex-grow-0",
        }).html('<i class="bi bi-trash"></i>').appendTo(col.topControls).click(function(){
            if(typeof row.columns[col.id] !== 'undefined'){
                delete row.columns[col.id];
            }
            col.remove();
        });

        // Create Controls - Bottom
        col.bottomControls = $(document.createElement("div")).attr({
            "class":"btn-group position-absolute bottom-0 start-0 w-100 p-0 border-top shadow",
            "data-action-mode":"edit",
        }).appendTo(col);
        col.bottomControls.spacer = $(document.createElement("div")).attr({
            "class":"w-100",
            "data-action-mode":"edit",
            "style":"height: 40px;",
        }).insertBefore(col.bottomControls);

        // Create Controls - Bottom - Add
        col.bottomControls.add = $(document.createElement("button")).attr({
            "class":"btn btn-success rounded-top-0",
        }).html('<i class="bi bi-plus-lg me-2"></i>'+this._builder.Locale.get("Widget")).appendTo(col.bottomControls).click(function(){

            // Create the Modal
            self._builder.Component(
                "modal",
                {
                    icon: "plus-lg",
                    title: self._builder.Locale.get("Add Widget"),
                    color: 'success',
                    size: "lg",
                    callback: {
                        load: function(component, modal){

                            // Set the component
                            const parent = component;

                            // Promise to fetch data
                            return new Promise((resolve, reject) => {
                                try {

                                    // Create the Form
                                    self._builder.Utility(
                                        'form',
                                        component.body,
                                        {
                                            callback: {
                                                submit: function(form){

                                                    // Show the modal spinner
                                                    modal.spinner(true);

                                                    // Add a widget
                                                    col.add(form.val().name, form.widget._options);

                                                    // Trigger a render
                                                    self.render();

                                                    // Close the modal
                                                    modal.hide();
                                                },
                                            }
                                        },
                                        function(form,component){

                                            // Add event listener on the modal submit button
                                            parent.dialog.content.footer.submit.click(function(e){
                                                e.preventDefault();
                                                e.stopPropagation();
                                                form.submit();
                                            });

                                            // Build the options
                                            const options = [];
                                            for(const [name, widgetClass] of Object.entries(self.widgets())){
                                                const widget = dashboard.create(name);
                                                if(col.size < widget.min() || col.size > widget.max()){
                                                    continue;
                                                }
                                                options.push({id: name, text: widget.label() + ' - ' + widget.description()});
                                            }

                                            // name
                                            form.add(
                                                'select2',
                                                {
                                                    name: 'name',
                                                    label: self._builder.Locale.get('Widget'),
                                                    placeholder: self._builder.Locale.get('Select widget'),
                                                    options: options,
                                                    class: {
                                                        component: 'bg-gray-200 p-3 py-2 rounded-0',
                                                    },
                                                    callback:{
                                                        onChange: function(input){
                                                            form.widget = dashboard.create(input.val());
                                                            form.widget.insert(component.preview.body.empty());
                                                        },
                                                    },
                                                }
                                            );

                                            component.preview = $(document.createElement("div")).attr({
                                                "class": "bg-gray-200 p-3 py-2 rounded-0",
                                            }).appendTo(component);
                                            component.preview.body = $(document.createElement("div")).attr({
                                                "class": "card card-body widget-preview",
                                            }).appendTo(component.preview);

                                            // Resolve the promise
                                            resolve();
                                        },
                                    );
                                } catch(e) {

                                    // Log the error and reject the promise
                                    console.error('Error:', e);
                                    modal.hide();
                                    reject(e);
                                }
                            });
                        },
                    },
                },
                function(modal,component){

                    // Styling
                    component.body.addClass('p-0');

                    // Show the modal
                    modal.show();
                },
            );
        });

        // Function to add a widget to the column
        col.add = function(name, options = {}){
            self.widget(col, name, options);
        }

        // Save the col
        row.columns[row.count] = col;

        return this;
    }

    widget(col, name, options = {}){

        // Set Self
        const self = this;

        // Check if the widget name is valid
        if(typeof this.widgets()[name] === 'undefined'){
            console.error("Invalid widget name: "+name);
            return;
        }
        const widget = dashboard.create(name, options);

        // Check if the widget can fit in the column
        if( col.size < widget.min() || col.size > widget.max()){
            console.error("Invalid widget size: "+name+" - "+widget.min()+" < "+col.size+" > "+widget.max());
            return;
        }

        // Increment the col count
        col.count++;

        // Set Widget ID
        widget.id(col.count);

        // Insert the widget
        widget.before(col.bottomControls.spacer);

        // Set Removal Callback
        widget.onRemove = function(){
            if(typeof col.widgets[widget.id] !== 'undefined'){
                delete col.widgets[widget.id];
            }
        }

        // Save the widget
        col.widgets[col.count] = widget;

        return this;
    }

    load(board = null){

        // Check if a board was provided
        if(board){

            // Load the dashboard
            for(const rowData of board){
                if(typeof rowData.cols === 'undefined' || rowData.cols < 1 || rowData.cols > 4){
                    continue;
                }
                this.row(rowData.cols);
                const row = this._rows[this._count];
                if(typeof rowData.childrens === 'undefined' || !Array.isArray(rowData.childrens)){
                    continue;
                }
                for(const colData of rowData.childrens){
                    if(typeof colData.size === 'undefined' || colData.size < 1 || colData.size > 12){
                        continue;
                    }
                    row.add(colData.size);
                    const col = row.columns[row.count];
                    if(typeof colData.childrens === 'undefined' || !Array.isArray(colData.childrens)){
                        continue;
                    }
                    for(const widgetData of colData.childrens){
                        if(typeof widgetData.name === 'undefined' || typeof this.widgets()[widgetData.name] === 'undefined'){
                            continue;
                        }
                        col.add(widgetData.name, (typeof widgetData.options === 'object') ? widgetData.options : {});
                    }
                }
            }
        }

        // Render the dashboard
        this.render();
    }

    clear(){

        // Clear the dashboard
        this._component.find('[data-rowId]').remove();
        this._rows = {};
        this._count = 0;

        return this;
    }

    save(toDB = false){

        // Set board array
        const board = [];

        // Iterate over rows
        for(const [rowId, row] of Object.entries(this._rows)){

            // Create row object
            const r = {
                cols: row.cols,
                childrens: [],
            };

            // Iterate over columns
            for(const [colId, col] of Object.entries(row.columns)){

                // Create column object
                const c = {
                    size: col.size,
                    childrens: [],
                };

                // Iterate over widgets
                for(const [widgetId, widget] of Object.entries(col.widgets)){

                    // Add the widget to the column
                    c.childrens.push({
                        name: widget.name(),
                        options: widget._options,
                    });
                }

                // Add the column to the row
                r.childrens.push(c);
            }

            // Add the row to the board
            board.push(r);
        }

        // Check if we need to save to the database
        if(toDB){

            // AJAX Request
            API.endpoint('/dashboard/save').data({"board": JSON.stringify(board)}).execute(function(){
                // Show a toast message
                builder.Toast.add({
                    color: 'success',
                    icon: 'check-circle',
                    title: builder.Locale.get('Success'),
                    body: builder.Locale.get('Dashboard saved successfully.'),
                });
            });
        }

        return board;
    }

    import(){

        // Set Self
        const self = this;

        // Create the Modal
        this._builder.Component(
            "modal",
            {
                icon: "import",
                title: this._builder.Locale.get("Import"),
                color: 'primary',
            },
            function(modal,component){

                // Set the parent
                const parent = component.dialog;

                // Styling
                component.body.addClass('p-0');

                // Create the Form
                self._builder.Utility(
                    'form',
                    component.body,
                    {
                        callback: {
                            submit: function(form){

                                // Show the modal spinner
                                modal.spinner(true);

                                // Run the file promise
                                form.val().file.then(fileData => {

                                    // Retrieve the first file
                                    const file = fileData[0];

                                    // Decode the board
                                    const json = file.content.split(',')[1];
                                    const board = JSON.parse(atob(json));

                                    // Clear the dashboard
                                    self.clear();

                                    // Load the board
                                    self.load(board);

                                    // Close the modal
                                    modal.hide();
                                }).catch(error => {
                                    console.error('Error reading files:', error);
                                });
                            },
                        }
                    },
                    function(form,component){

                        // Add event listener on the modal submit button
                        parent.content.footer.submit.click(function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            form.submit();
                        });

                        // Upload
                        form.add(
                            'file',
                            {
                                name: 'file',
                                placeholder: self._builder.Locale.get('Select file'),
                                class: {
                                    component: 'bg-gray-200 p-3 py-2 rounded-0',
                                },
                            }
                        );

                        // Show the modal
                        modal.show();
                    },
                );
            },
        );
    }

    export(){
        // Export the dashboard as a JSON file
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.save(), null, 4));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", "dashboard.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        return this;
    }

    render(){

        // Set Self
        const self = this;

        // Toggle the visibility of all the data-action-mode elements
        this._component.find('[data-action-mode').hide();
        this._component.find('[data-action-mode="'+this._mode+'"').show();
        this._component.controls.find('[data-action-mode').hide();
        this._component.controls.find('[data-action-mode="'+this._mode+'"').show();

        // Toggle the class edit on the _component
        this._component.toggleClass('edit', this._mode == 'edit');

        // Show the dashboard
        this._component.removeClass('d-none');
        this._component.controls.removeClass('d-none');
        if($('#pageTitle').length > 0) {
            this._component.controls.addClass('d-inline-block');
        }

        // Check dashboard mode
        switch(this._mode){
            case 'edit':
                // Add margins on the first widget of each column
                this._component.find('[data-colId]').each(function(){
                    $(this).find('[data-widgetid]').first().removeClass('m-0');
                });
                break;
            case 'view':
                // Remove margins on the first widget of each column
                this._component.find('[data-colId]').each(function(){
                    $(this).find('[data-widgetid]').first().addClass('m-0');
                });
                break;
        }
    }

    widgets(){

        // Return the widgets
        return dashboard.widgets();
    }
});

// Dashboard Class
class Dashboard extends builder.UtilityClass {

    #widgets = {};

    constructor(builder){

        // Call Parent
        super(builder);
    }

    Widget = class extends this._builder.UtilityClass {

        _options = {};
        _properties = {
            name: null,
            label: null,
            description: null,
            minSize: 1,
            maxSize: 12,
            interval: 10000,
            autoStart: false,
        };
        _data = null;
        _interval = null;
        _callback = null;
        #onRemove = null;

        constructor(builder, options = {}){

            // Call Parent
            super(builder);

            // Init Component
            this._init();

            // Set Options
            this.#options(options);

            // Create Component
            this.create();
        }

        #options(options = {}){

            // Configure Options
            for(const [key, value] of Object.entries(options)){
                if(typeof this._options[key] !== 'undefined'){
                    if(key == 'properties' && typeof value === 'object'){
                        for(const [k, v] of Object.entries(value)){
                            if(typeof this._properties[k] !== 'undefined'){
                                this._properties[k] = v;
                            }
                        }
                    } else {
                        this._options[key] = value;
                    }
                }
            }

            // Return Object
            return this;
        }

        component(){
            return this._component;
        }

        name(){
            return this._properties.name;
        }

        label(){
            return this._properties.label;
        }

        description(){
            return this._properties.description;
        }

        min(){
            return this._properties.minSize;
        }

        max(){
            return this._properties.maxSize;
        }

        create(){

            // Set Self
            const self = this;

            // Create Component
            this._component = $(document.createElement('div')).attr({
                'class': 'widget d-flex flex-row rounded shadow',
            });
            this._component.id = this._component.attr('id');

            // Add the widget to the dashboard
            this._component.gadget = $(document.createElement("div")).attr({
                "class":"gadget flex-grow-1",
            }).prependTo(this._component);

            // Create Controls
            this._component.controls = $(document.createElement("div")).attr({
                "class":"flex-shrink-1 btn-group rounded-start-0 border-start",
                "data-action-mode":"edit",
            }).appendTo(this._component);

            // Create Controls - Move
            this._component.controls.move = $(document.createElement("button")).attr({
                "class":"btn btn-light rounded-start-0",
                "type": "button",
            }).html('<i class="bi bi-arrows-move"></i>').appendTo(this._component.controls).click(function(){});

            // Create Controls - Config
            this._component.controls.config = $(document.createElement("button")).attr({
                "class":"btn btn-secondary rounded-start-0",
                "type": "button",
            }).html('<i class="bi bi-gear"></i>').appendTo(this._component.controls).click(function(){
                self.config();
            });

            // Create Controls - Remove
            this._component.controls.remove = $(document.createElement("button")).attr({
                "class":"btn btn-danger rounded-start-0",
                "type": "button",
            }).html('<i class="bi bi-trash"></i>').appendTo(this._component.controls).click(function(){
                self.remove();
            });

            // Create Component
            this._create();

            // Check if autoStart is enabled
            if(this._properties.autoStart){

                // Start
                this.start();
            }

            // Initial Render
            this._render();
        }

        config(){

            // Set Self
            const self = this;

            // Create the Modal
            this._builder.Component(
                "modal",
                {
                    icon: "gear",
                    title: this._builder.Locale.get("Configure"),
                    color: 'secondary',
                    size: "lg",
                    callback: {
                        load: function(component, modal){

                            // Set the component
                            const parent = component;

                            // Promise to fetch data
                            return new Promise((resolve, reject) => {
                                try {

                                    // Create the Form
                                    self._builder.Utility(
                                        'form',
                                        component.body,
                                        {
                                            callback: {
                                                submit: function(form){

                                                    // Show the modal spinner
                                                    modal.spinner(true);

                                                    // Update the configurations
                                                    self.#options(form.val());

                                                    // Trigger a render
                                                    self.render();

                                                    // Close the modal
                                                    modal.hide();
                                                },
                                            }
                                        },
                                        function(form,component){

                                            // Add event listener on the modal submit button
                                            parent.dialog.content.footer.submit.click(function(e){
                                                e.preventDefault();
                                                e.stopPropagation();
                                                form.submit();
                                            });

                                            // Extend for custom config
                                            self._config(form);

                                            // Resolve the promise
                                            resolve();
                                        },
                                    );
                                } catch(e) {

                                    // Log the error and reject the promise
                                    console.error('Error:', e);
                                    modal.hide();
                                    reject(e);
                                }
                            });
                        },
                    },
                },
                function(modal,component){

                    // Styling
                    component.body.addClass('p-0');

                    // Show the modal
                    modal.show();
                },
            );

            return this;
        }

        onRemove(callback = null){
            if(callback && typeof callback === 'function'){
                this.#onRemove = callback;
            }
            return this;
        }

        insert(selector){
            if(selector instanceof jQuery){
                this._component.appendTo(selector);
            } else if(typeof selector === 'string'){
                $(selector).append(this._component);
            }
            return this;
        }

        before(selector){
            if(selector instanceof jQuery){
                this._component.insertBefore(selector);
            } else if(typeof selector === 'string'){
                $(selector).before(this._component);
            }
            return this;
        }

        id(widgetId = null){
            if(widgetId){
                this._component.attr('data-widgetId', widgetId);
                this._component.id = widgetId;
            }
            return this._component.id;
        }

        remove(){
            this._component.remove();
            if(this.#onRemove && typeof this.#onRemove === 'function'){
                this.#onRemove();
            }
            return this;
        }

        icons(){
            const array = [];
            for(const [key, value] of Object.entries(this._builder.Helper.bootstrapIcons())){
                array.push({id: value, text: value});
            }
            return array;
        }

        colors(){
            const array = [];
            for(const [key, value] of Object.entries(this._builder.Helper.bootstrapTextBg())){
                array.push({id: value, text: value});
            }
            return array;
        }

        render(){
            this._render();
            return this;
        }

        load(data = null){

            // Set Self
            const self = this;

            // Check if data is provided
            if(data !== null){
                this._data = data;
            } else {
                this._load();
            }

            // Trigger a render
            this._render();

            return this;
        }

        start(){

            // Set Self
            const self = this;

            // Check if the interval is already set
            if(this._interval){
                console.warn('Interval is already set, stopping the previous one.');
                clearInterval(this._interval);
            }

            // Initial Load
            this.load();

            // Set the interval to check for changes
            this._interval = setInterval(function(){
                self.load();
            }, this._properties.interval);
        }

        stop(){
            // Check if the interval is set
            if(this._interval){
                clearInterval(this._interval);
                this._interval = null;
            } else {
                console.warn('No interval is currently set.');
            }
        }

        _init(){}

        _create(){}

        _config(form){}

        _load(){}

        _render(){}
    }

    add(name, widget){

        // Check if the widget name already exists
        if(typeof this.#widgets[name] !== 'undefined'){
            console.error("Widget name already exists: "+name);
            return this;
        }

        // Check if the widget is a class
        if(typeof widget !== 'function' || !(widget.prototype instanceof this.Widget)){
            console.error("Invalid widget class: "+name);
            return this;
        }

        // Add the widget to the list
        this.#widgets[name] = widget;

        return this;
    }

    create(name, options = {}){
        if(typeof this.#widgets[name] !== 'undefined'){
            return new this.#widgets[name](this._builder, options);
        }
    }

    widgets(){
        return this.#widgets;
    }
}

// Create Dashboard
const dashboard = new Dashboard(builder);

// Register - Placeholder Widget
// A simple placeholder widget to demonstrate how to create a widget for the dashboard
dashboard.add('placeholder', class extends dashboard.Widget {
    _init(){
        this._properties = {
            name: "placeholder",
            label: "Placeholder",
            description: "This is a placeholder widget",
            minSize: 1,
            maxSize: 12,
            interval: 10000,
            autoStart: false,
        };
        this._options = {
            color: 'light',
            label: "Placeholder",
        };
    }

    _create(){
        this._component.placeholder = $(document.createElement("div")).attr({
            "class":"card p-3 text-center",
        }).appendTo(this._component.gadget);
    }

    _render(){
        this._component.placeholder.attr('class', "card p-3 text-center text-bg-"+this._options.color).text(this._options.label);
    }

    _config(form){

        // label
        form.add(
            'text',
            {
                name: 'label',
                label: this._builder.Locale.get('Label'),
                placeholder: this._builder.Locale.get('Enter label'),
                value: this.label(),
                class: {
                    component: 'bg-gray-200 p-3 py-2 rounded-0',
                },
            }
        );

        // color
        form.add(
            'select2',
            {
                name: 'color',
                label: this._builder.Locale.get('Color'),
                placeholder: this._builder.Locale.get('Select a color'),
                options: this.colors(),
                value: this._options.color,
                class: {
                    component: 'bg-gray-200 p-3 py-2 rounded-0',
                },
                callback:{
                    format: function(option, component){
                        if (!option.id) { return option.text; }
                        return $('<div class="px-3 py-2 animate-flicker-hover text-bg-' +  option.element.value.toLowerCase() + '" style="margin: -.375rem -.75rem!important;">' + option.text + '</div>');;
                    },
                },
            }
        );
    }
});
