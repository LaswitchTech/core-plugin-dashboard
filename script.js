const Dashboard = function(board, container, callback = null){

    // Check if board is a string
    if(typeof board === 'string'){

        // Convert the JSON string to an object
        try{

            // Parse the JSON string
            board = JSON.parse(board);
        }catch(e){

            // If the JSON string is invalid, return an empty object
            console.error("Invalid JSON string: "+e);
            return;
        }
    }

    // Retrieve the Dashboard Widgets
    const Widgets = DashboardWidgets();

    // Create a new row
    var dash = $(document.createElement("div")).addClass("dashboard position-relative").appendTo(container);

    // Set parameters
    dash.board = board;
    dash.count = 0;
    dash.rows = {};
    dash.mode = "view";

    // Add a controls area
    dash.controls = $(document.createElement("div")).attr({
        "class":"dashboard-controls position-absolute w-100",
        "style":"top: -40px; left: 24px;"
    }).appendTo(dash);
    dash.controls.edit = $(document.createElement("button")).attr({
        "class":"btn btn-sm btn-warning",
        "data-action-mode":"view",
    }).html('<i class="bi bi-pencil me-1"></i>'+builder.Locale.get('Edit')).appendTo(dash.controls);
    dash.controls.edit.click(function(){

        // Update the dashboard mode
        dash.mode = 'edit';

        // Render the dashboard
        dash.render();
    });
    dash.controls.save = $(document.createElement("button")).attr({
        "class":"btn btn-sm btn-success",
        "data-action-mode":"edit",
    }).html('<i class="bi bi-save me-1"></i>'+builder.Locale.get('Save')).appendTo(dash.controls);
    dash.controls.save.click(function(){

        // Update the dashboard mode
        dash.mode = 'view';

        // Initialize the new dashboard
        dash.board = [];

        // Loop through all rows
        for(const [rowKey, row] of Object.entries(dash.rows)){

            // Initialize the new row
            var newRow = {
                cols: row.cols,
                childrens: [],
            };

            // Loop through all columns
            for(const [colKey, col] of Object.entries(row.columns)){

                // Initialize the new column
                var newColumn = {
                    size: col.size,
                    childrens: [],
                };

                // Loop through all widgets
                for(const [widgetKey, widget] of Object.entries(col.widgets)){

                    // Add the new widget to the column
                    newColumn.childrens.push({name: widget.name, value: widget.value});
                }

                // Add the new column to the row
                newRow.childrens.push(newColumn);
            }

            // Add the new row to the dashboard
            dash.board.push(newRow);
        }

        // AJAX Request
        $.ajax({
            url: '/api/dashboard/save',
            headers: {'X-CSRF-Authorization': CSRF_KEY},
            type: 'POST',dataType: 'json',
            data: {"board": JSON.stringify(dash.board)},
            success: function(response) {},
        });

        // Render the dashboard
        dash.render();
    });

    // Render the dashboard
    dash.render = function(){

        // Check dashboard mode
        switch(dash.mode){
            case 'edit':
                // Toggle the class d-none on all the data-action-mode
                $('[data-action-mode="edit"]').removeClass('d-none');
                $('[data-action-mode="view"]').addClass('d-none');
                dash.addClass('edit');
                // Add margins on the first widget of each column
                dash.find('[data-colId]').each(function(){
                    $(this).find('[data-widgetid]').first().removeClass('m-0');
                });
                break;
            case 'view':
                // Toggle the class d-none on all the data-action-mode
                $('[data-action-mode="edit"]').addClass('d-none');
                $('[data-action-mode="view"]').removeClass('d-none');
                dash.removeClass('edit');
                // Remove margins on the first widget of each column
                dash.find('[data-colId]').each(function(){
                    $(this).find('[data-widgetid]').first().addClass('m-0');
                });
                break;
        }
    }

    // Create a button group
    dash.group = $(document.createElement("div")).addClass("btn-group w-100");
    dash.group.col = $(document.createElement("div")).addClass("col-12").append(dash.group);
    dash.group.row = $(document.createElement("div")).attr({
        "class":"row",
        "data-action-mode":"edit",
    }).append(dash.group.col).appendTo(dash);

    // Create an add button
    dash.controls.add = $(document.createElement("button")).attr({
        "class":"btn btn-success",
    }).html('<i class="bi bi-plus-lg me-2"></i>'+builder.Locale.get("Add Row")).appendTo(dash.group);

    // Add a click event to the button
    dash.controls.add.click(function(){

        // Create a modal
        builder.Component(
            "modal",
            null,
            {
                onEnter: false,
                destroy: true,
                icon: "plus-lg",
                size: "lg",
                title: builder.Locale.get("Add Row"),
            },
            function(modal,component){

                // Save the component
                const componentModal = component;

                // Style the modal
                component.addClass('modal-success');
                component.footer.remove();

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

                        // Create a new row
                        var row = dash.add(parseInt($(this).attr('data-cols')));

                        // Close the modal
                        modal.hide();
                    });
                }

                // Open the modal
                modal.show();
            },
        );
    });

    // Add row function
    dash.add = function(cols = 1, childrens = []){

        // Increment the row count
        dash.count++;

        // Create a new row
        var row = $(document.createElement("div")).attr({
            "class": "row position-relative",
            "data-rowId": dash.count,
        });

        // Set parameters
        row.id = row.attr('data-rowId');
        row.cols = cols;
        row.count = 0;
        row.columns = {};

        // Create Top Controls
        row.topControls = $(document.createElement("div")).attr({
            "class":"btn-group position-absolute top-0 start-0 w-100 p-0",
            "data-action-mode":"edit",
        }).appendTo(row);
        row.topControls.spacer = $(document.createElement("div")).attr({
            "class":"w-100",
            "data-action-mode":"edit",
            "style":"height: 50px;",
        }).appendTo(row);

        // Create Bottom Controls
        row.bottomControls = $(document.createElement("div")).attr({
            "class":"btn-group position-absolute bottom-0 start-0 w-100 p-0",
            "data-action-mode":"edit",
        }).appendTo(row);
        row.bottomControls.spacer = $(document.createElement("div")).attr({
            "class":"w-100",
            "data-action-mode":"edit",
            "style":"height: 50px;",
        }).insertBefore(row.bottomControls);

        // Create a move button
        row.topControls.move = $(document.createElement("button")).attr({
            "class":"btn btn-light rounded-bottom-0",
        }).html('<i class="bi bi-arrows-move"></i>').appendTo(row.topControls);

        // Create a remove button
        row.topControls.remove = $(document.createElement("button")).attr({
            "class":"btn btn-danger rounded-bottom-0 flex-shrink-1 flex-grow-0",
        }).html('<i class="bi bi-trash"></i>').appendTo(row.topControls);

        // Add a click event to the remove button
        row.topControls.remove.click(function(){
            if(typeof dash.rows[row.id] !== 'undefined'){
                delete dash.rows[row.id];
            }
            row.remove();
            dash.render();
        });

        // Create an add button
        row.bottomControls.add = $(document.createElement("button")).attr({
            "class":"btn btn-success rounded-top-0",
        }).html('<i class="bi bi-plus-lg"></i>').appendTo(row.bottomControls);

        // Add a click event to the add button
        row.bottomControls.add.click(function(){

            // Create a modal
            builder.Component(
                "modal",
                null,
                {
                    onEnter: false,
                    destroy: true,
                    icon: "plus-lg",
                    size: "lg",
                    title: builder.Locale.get("Add Column"),
                },
                function(modal,component){

                    // Save the component
                    const componentModal = component;

                    // Style the modal
                    component.header.addClass('text-bg-success');
                    component.footer.remove();

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

                            // Create a new row
                            var col = row.add(parseInt($(this).attr('data-size')));

                            // Close the modal
                            modal.hide();
                        });
                    }

                    // Open the modal
                    modal.show();
                },
            );
        });

        // Add function
        row.add = function(size = 12, childrens = []){

            // Increment the col count
            row.count++;

            // Create a new row
            var col = $(document.createElement("div")).attr({
                "class": "col position-relative",
                "data-colId": row.count,
            });

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

            // Create Top Controls
            col.topControls = $(document.createElement("div")).attr({
                "class":"btn-group position-absolute top-0 start-0 w-100 p-0",
                "data-action-mode":"edit",
            }).appendTo(col);
            col.topControls.spacer = $(document.createElement("div")).attr({
                "class":"w-100",
                "data-action-mode":"edit",
                "style":"height: 6px;",
            }).appendTo(col);

            // Create Bottom Controls
            col.bottomControls = $(document.createElement("div")).attr({
                "class":"btn-group position-absolute bottom-0 start-0 w-100 p-0",
                "data-action-mode":"edit",
            }).appendTo(col);
            col.bottomControls.spacer = $(document.createElement("div")).attr({
                "class":"w-100",
                "data-action-mode":"edit",
                "style":"height: 30px;",
            }).insertBefore(col.bottomControls);

            // Create a move button
            col.topControls.move = $(document.createElement("button")).attr({
                "class":"btn btn-light rounded-bottom-0",
            }).html('<i class="bi bi-arrows-move"></i>').appendTo(col.topControls);

            // Create a remove button
            col.topControls.remove = $(document.createElement("button")).attr({
                "class":"btn btn-danger rounded-bottom-0 flex-shrink-1 flex-grow-0",
            }).html('<i class="bi bi-trash"></i>').appendTo(col.topControls);

            // Add a click event to the remove button
            col.topControls.remove.click(function(){
                if(typeof row.columns[col.id] !== 'undefined'){
                    delete row.columns[col.id];
                }
                col.remove();
                dash.render();
            });

            // Create an add button
            col.bottomControls.add = $(document.createElement("button")).attr({
                "class":"btn btn-success rounded-top-0",
            }).html('<i class="bi bi-plus-lg"></i>').appendTo(col.bottomControls);

            // Add a click event to the add button
            col.bottomControls.add.click(function(){

                // Create a modal
                builder.Component(
                    "modal",
                    null,
                    {
                        onEnter: false,
                        destroy: true,
                        icon: "plus-lg",
                        size: "lg",
                        title: builder.Locale.get("Select Widget"),
                        cancel: false,
                        callback: {
                            submit: function(element,modal){
                                element.form.submit();
                            },
                        },
                    },
                    function(modal,component){

                        // Save the component
                        const componentModal = component;

                        // Style the modal
                        component.addClass('modal-success');
                        component.footer.submit
                            .addClass('btn-success')
                            .removeClass('btn-link')
                            .text(builder.Locale.get('Insert'))
                            .attr('style','border-bottom-left-radius: var(--bs-modal-inner-border-radius) !important;border-bottom-right-radius: var(--bs-modal-inner-border-radius) !important;');
                        component.footer.submit.icon = $(document.createElement('i')).addClass('bi bi-plus-lg me-1').prependTo(component.footer.submit);

                        // Insert Form
                        component.form = builder.Component(
                            "form",
                            component.body,
                            {
                                callback:{
                                    submit: function(form){

                                        // Retrieve the values
                                        const values = form.val();
                                        const widget = Widgets[values.name];

                                        // Add a widget
                                        switch(widget.type){
                                            case 'select':
                                                col.add(values.name, values.value_select);
                                                break;
                                            case 'text':
                                                col.add(values.name, values.value_text);
                                                break;
                                            default:
                                                col.add(values.name, widget.value);
                                                break;
                                        }

                                        // Close the modal
                                        modal.hide();

                                        // Render the dashboard
                                        dash.render();
                                    },
                                },
                            },
                            function(form,component){

                                // Build the options
                                var options = [];
                                for(const [id, widget] of Object.entries(Widgets)){
                                    if(col.size < widget.minSize || col.size > widget.maxSize){
                                        continue;
                                    }
                                    options.push({text: widget.label + ' - ' + widget.description,id: id});
                                }

                                // Create a generate preview function
                                const generatePreview = function(name, value){

                                    // Parse the value
                                    if(typeof value === 'string'){
                                        // replace '{row}' with the row id
                                        value = value.replace(/{row}/g, row.id);
                                        // replace '{col}' with the col id
                                        value = value.replace(/{col}/g, col.id);
                                        // replace '{widget}' with the widget id
                                        value = value.replace(/{widget}/g, (col.count+1));
                                    }

                                    // Create a new dashboard widget
                                    var widget = $(document.createElement("div")).attr({
                                        "class": "widget d-flex flex-row",
                                    });

                                    // Add the gadget to the widget
                                    widget.gadget = $(document.createElement("div")).attr({
                                        "class":"gadget flex-grow-1",
                                    }).html(window[name](value)).prependTo(widget);

                                    // Add the widget to the preview
                                    componentModal.preview._component.body.html(widget);
                                };

                                // Add a widget value select
                                form.add(
                                    {
                                        name: 'value_select',
                                        label: builder.Locale.get('Select Value'),
                                        icon: 'puzzle',
                                        type: 'select',
                                        options: [],
                                        modal: componentModal,
                                    },
                                    function(field){

                                        // Style the field
                                        field.addClass('mt-3');

                                        // Hide the field by default
                                        field.hide();
                                    },
                                );

                                // Add a widget value select
                                form.add(
                                    {
                                        name: 'value_text',
                                        label: builder.Locale.get('Type Value'),
                                        icon: 'puzzle',
                                        type: 'text',
                                    },
                                    function(field){

                                        // Style the field
                                        field.addClass('mt-3');

                                        // Hide the field by default
                                        field.hide();
                                    },
                                );

                                // Add a select2 field
                                form.add(
                                    {
                                        name: 'name',
                                        label: builder.Locale.get('Select Widget'),
                                        icon: 'puzzle',
                                        type: 'select2',
                                        options: options,
                                        modal: componentModal,
                                        callback: {
                                            onChange: function(field){

                                                // Get the selected value
                                                var selected = field.val();
                                                var value = Widgets[selected].value;
                                                field.value = value;

                                                // Hide both value inputs
                                                form._inputs.value_select.hide();
                                                form._inputs.value_text.hide();

                                                // Generate the preview
                                                generatePreview(selected, field.value);

                                                // Show the correct value input
                                                switch(Widgets[selected].type ?? 'none'){
                                                    case 'select':
                                                        // Clear all options
                                                        form._inputs.value_select.input.select.empty();
                                                        // Add the options
                                                        for(const [key, obj] of Object.entries(Widgets[selected].options)){
                                                            form._inputs.value_select.input.select.append(
                                                                $(document.createElement("option")).attr({"value": obj.id}).text(obj.text),
                                                            );
                                                        }
                                                        // Set the value
                                                        form._inputs.value_select.input.select.val(field.value);
                                                        // Set the placeholder
                                                        form._inputs.value_select.input.select.attr('placeholder', Widgets[selected].placeholder);
                                                        // Set an onChange event
                                                        form._inputs.value_select.input.select.off().on('change', function(){
                                                            // Get the selected value
                                                            value = form._inputs.value_select.val();
                                                            // Generate the preview
                                                            generatePreview(selected, value);
                                                        });
                                                        // Show the select
                                                        form._inputs.value_select.show();
                                                        break;
                                                    case 'text':
                                                        // Clear the input
                                                        form._inputs.value_text.val('');
                                                        // Set the value
                                                        form._inputs.value_text.val(field.value);
                                                        // Set the placeholder
                                                        form._inputs.value_text.input.attr('placeholder', Widgets[selected].placeholder);
                                                        // Set an onChange event
                                                        form._inputs.value_text.input.off().on('keyup', function(){
                                                            // Get the selected value
                                                            value = form._inputs.value_text.val();
                                                            // Generate the preview
                                                            generatePreview(selected, value);
                                                        });
                                                        // Show the input
                                                        form._inputs.value_text.show();
                                                        break;
                                                    default:
                                                        break;
                                                }
                                            },
                                        }
                                    },
                                    function(field){

                                        // Prepend the field to the form
                                        field.prependTo(component);
                                    },
                                );

                                // Open the modal
                                modal.show();
                            },
                        );

                        // Add a preview area
                        component.preview = builder.Component(
                            "card",
                            component.body,
                            {
                                class: {
                                    component: "w-100 mt-3",
                                },
                                icon: "eye",
                                title: builder.Locale.get("Preview"),
                                strech: false,
                                hideHeader: false,
                                hideFooter: true,
                                close:false,
                                fullscreen: false,
                                collapse: true,
                                collapsed: false,
                            },
                            function(card,component){

                                // Style the card
                                component.addClass('modal-blue');
                                component.body
                                    .addClass('text-bg-dark')
                                    .attr('style','background-image: none; border-bottom-left-radius: var(--bs-modal-inner-border-radius) !important;border-bottom-right-radius: var(--bs-modal-inner-border-radius) !important;');
                            },
                        );
                    },
                );
            });

            // Add function
            col.add = function(name, value = null){

                // Check if the widget name is valid
                if(typeof Widgets[name] === 'undefined'){
                    console.error("Invalid widget name: "+name);
                    return;
                }

                // Check if the widget can fit in the column
                if( col.size < Widgets[name].minSize || col.size > Widgets[name].maxSize){
                    console.error("Invalid widget size: "+name+" - "+Widgets[name].minSize+" < "+col.size+" > "+Widgets[name].maxSize);
                    return;
                }

                // Increment the col count
                col.count++;

                // Create a new row
                var widget = $(document.createElement("div")).attr({
                    "class": "widget d-flex flex-row",
                    "data-widgetId": col.count,
                }).appendTo(col);

                // Set parameters
                widget.id = widget.attr('data-widgetId');
                widget.name = name;
                if(typeof value === 'string'){
                    // replace '{row}' with the row id
                    value = value.replace(/{row}/g, row.id);
                    // replace '{col}' with the col id
                    value = value.replace(/{col}/g, col.id);
                    // replace '{widget}' with the widget id
                    value = value.replace(/{widget}/g, widget.id);
                }
                widget.value = value;

                // Retrieve the widget
                var element = window[name](value);

                // Add the widget to the dashboard
                widget.gadget = $(document.createElement("div")).attr({
                    "class":"gadget flex-grow-1",
                }).html('').append(element).prependTo(widget);

                // Add controls to the widget
                widget.controls = $(document.createElement("div")).attr({
                    "class":"flex-shrink-1 btn-group rounded-start-0",
                    "data-action-mode":"edit",
                }).appendTo(widget);

                // Add a remove button to the widget
                widget.controls.remove = $(document.createElement("button")).attr({
                    "class":"btn btn-danger rounded-start-0",
                }).html('<i class="bi bi-trash"></i>').appendTo(widget.controls);

                // Add a click event to the remove button
                widget.controls.remove.click(function(){
                    if(typeof col.widgets[widget.id] !== 'undefined'){
                        delete col.widgets[widget.id];
                    }
                    widget.remove();
                    dash.render();
                });

                // Insert the widget
                widget.insertBefore(col.bottomControls.spacer);

                // Render the dashboard
                dash.render();

                // Save the col
                col.widgets[col.count] = widget;

                // Return the col
                return widget;
            }

            // Insert the col
            col.insertBefore(row.bottomControls.spacer);

            // Add all childrens as columns
            for(const [key, obj] of Object.entries(childrens)){

                // Create a new column
                col.add(obj.name, obj.value);
            }

            // Render the dashboard
            dash.render();

            // Save the col
            row.columns[row.count] = col;

            // Return the col
            return col;
        }

        // Insert the row
        row.insertBefore(dash.group.row);

        // Add all childrens as columns
        for(const [key, column] of Object.entries(childrens)){

            // Create a new column
            row.add(column.size, column.childrens);
        }

        // Render the dashboard
        dash.render();

        // Save the row
        dash.rows[dash.count] = row;

        // Return the row
        return row;
    }

    // Render the dashboard
    dash.render();

    // Generate the dashboard
    for(const [key, object] of Object.entries(board)){

        // Create a new row
        dash.add(object.cols, object.childrens);
    }

    // Check if the callback is a function
    if(typeof callback === 'function'){
        // Call the callback function
        callback(dash);
    }

    // Return the dashboard
    return dash;
}
const DashboardWidgets = function(){
    var widgets = {};
    const dashboardFunctions = Object.keys(window).filter(k => typeof window[k] === 'function' && k.startsWith('dashboard_widget_'));
    for(const [key, name] of Object.entries(dashboardFunctions)){
        // Check if the meta function exists
        if(typeof window[name.replace('dashboard_widget_', 'dashboard_meta_')] === 'function'){
            // Get the meta function
            const metaFunction = window[name.replace('dashboard_widget_', 'dashboard_meta_')];
            // Get the metadata
            var metadata = metaFunction();
            // Set invalid to false
            var invalid = false;
            // Set default values
            metadata.placeholder = metadata.type == "select" ? "Select an option" : (metadata.type == "text" ? "Type a Value" : null);
            metadata.value = metadata.value ?? null;
            metadata.options = metadata.options ?? [];
            metadata.minSize = metadata.minSize ?? 1;
            metadata.maxSize = metadata.maxSize ?? 12;
            // Check if all the required fields are present
            for(const [k, required] of Object.entries(['label', 'description', 'placeholder', 'type', 'value', 'options', 'minSize', 'maxSize'])){
                if(typeof metadata[required] === 'undefined'){
                    console.error("Invalid widget["+name+"] metadata: "+required);
                    invalid = true;
                    break;
                }
            }
            if(invalid){
                continue;
            }
            // Add the widget to the list
            widgets[name] = metadata;
        }
    }
    return widgets;
}

function dashboard_widget_placeholder(value = null){
    return '<div class="card p-3 text-center">'+value+'</div>';
}

function dashboard_meta_placeholder(key = null){
    const metadata = {
        label: "Placeholder",
        description: "This is a placeholder widget",
        placeholder: "Select an option",
        type: "select",
        value: "Placeholder",
        options: [
            {text: "Placeholder", id: "Placeholder"},
            {text: "Debug", id: "{row}:{col}:{widget}"},
        ],
    };
    return metadata[key] ? metadata[key] : metadata;
}
