<div class="col-12 p-0" id="layout"></div>
<script>
    $(document).ready(function(){
        $.ajax({
            url: '/api/dashboard/fetch',
            type: 'GET',dataType: 'json',
            success: function(response) {
                Dashboard(response.board || [],$('#layout'),function(dashboard){
                    const pageTitle = $('#pageTitle');
                    pageTitle.append(dashboard.controls.edit).append(dashboard.controls.save);
                });
            },
        });
    });
</script>
