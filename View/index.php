<!--
  Core Framework - View File

  @license    MIT (https://mit-license.org/)
  @author     Louis Ouellet <louis@laswitchtech.com>
-->
<div class="col-12 p-0" id="layout"></div>
<script>
    $(document).ready(function(){
        $.ajax({
            url: '/endpoint.php/dashboard/fetch',
            type: 'GET',dataType: 'json',
            success: function(response) {
                Dashboard(response.board || [],$('#layout'));
            },
        });
    });
</script>
