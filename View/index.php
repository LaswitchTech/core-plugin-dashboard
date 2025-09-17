<article id="layout"></article>
<script>
    $(document).ready(function(){
        API.endpoint('/dashboard/fetch').execute(function(response){
            Dashboard(response.board || [],$('#layout'),function(dashboard){
                const pageTitle = $('#pageTitle');
                pageTitle.append(dashboard.controls.edit).append(dashboard.controls.save);
            });
        });
    });
</script>
