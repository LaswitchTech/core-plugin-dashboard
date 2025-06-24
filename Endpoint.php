<?php

/**
 * Core Framework - DashboardEndpoint
 *
 * @license    MIT (https://mit-license.org/)
 * @author     Louis Ouellet <louis@laswitchtech.com>
 */

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Abstracts\Endpoint;

class DashboardEndpoint extends Endpoint {

    /**
     * Constructor
     */
    public function __construct()
    {

        // Call Parent Constructor
        parent::__construct();

        // Retrieve the namespace
        $namespace = $this->Request->getNamespace();

        // Set Global access
        $this->Public = false;

        // Set Level
        switch($namespace){
            case "/dashboard/fetch":
                $this->Level = 1;
                break;
            case "/dashboard/save":
                $this->Level = 3;
                break;
        }
    }

    /**
     * Retrieve a Dashboard
     */
    public function fetchAction(): array
    {
        $message = ["status" => 200, "message" => "OK", "data" => $this->Model->Dashboard->get()];
        return $message;
    }

    /**
     * Create a Dashboard
     */
    public function saveAction(): array
    {
        // Import Global Variables
        global $CSRF;

        // Set the default message
        $message = ["status" => 200, "message" => "OK", "data" => []];

        // Check the request method
        if($this->Request->getMethod() == "POST"){
            $message["data"]["CSRF"] = [
                "token" => $CSRF->token(),
                "key" => $CSRF->key()
            ];
        }

        // Check if the task is accessible
        if($message['status'] == 200){

            // Check the request method
            if($this->Request->getMethod() == "POST"){

                // Retrieve the parameters
                $board = $this->Request->getParams('POST','board') ?? null;

                // Check if the board has been set
                if($board){

                    // Retrieve the dashboard
                    $dashboard = $this->Model->Dashboard->get();

                    // Check if the dashboard already exist
                    if(!array_key_exists('id',$dashboard)){

                        // Create the dashboard
                        $dashboard = [
                            'owner' => $this->Auth->user()->username,
                            'user' => $this->Auth->user()->id,
                            'organization' => $this->Auth->user()->organization()->id,
                            'board' => $board,
                        ];

                        // Create the dashboard
                        $this->Model->Dashboard->create($dashboard);
                    } else {

                        // Update the dashboard
                        $this->Model->Dashboard->update($dashboard['id'], ["board" => $board]);
                    }

                    // Retrieve the final dashboard
                    $message['data'] = $this->Model->Dashboard->get();

                    // Check if the dashboard has been created/updated
                    if(empty($message['data'])){
                        $message = ["status" => 500, "message" => "Internal Server Error", "data" => "An error occurred while creating the dashboard."];
                    }
                } else {
                    $message = ["status" => 400, "message" => "Bad Request", "data" => "Missing required parameters."];
                }
            } else {
                $message = ["status" => 405, "message" => "Method Not Allowed", "data" => "The method is not allowed for the requested URL."];
            }
        }

        return $message;
    }
}
