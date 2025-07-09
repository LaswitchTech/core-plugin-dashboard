<?php

// Import additionnal class into the global namespace
use \LaswitchTech\Core\Abstracts\Model;

class DashboardModel extends Model {

    /**
     * Retrieve a Dashboard
     *
     * @return array
     */
    public function get(): array
    {
        // Import Global Variables
        global $AUTH;

        // Check if the user is logged in
        if(!$AUTH->isAuthenticated()){
            return [];
        }

        // Create the Query
        $Query = $this->Database->query()
            ->table('dashboards')
            ->select('*')
            ->join('owner', 'users', 'username')
            ->join('user', 'users', 'id')
            ->join('organization', 'organizations', 'id')
            ->filter()
            ->where('id', 9999, '<>')
            ->where('user', $AUTH->user()->id)
            ->limit(1);

        // Retrieve the Results
        $result = $Query->result();

        // Decode JSON Fields
        foreach($result as $key => $record){

            // Decode JSON Fields
            $result[$key]['board'] = json_decode($record['board'] ?? '[]', true);
        }

        // Return the Results
        return $result[array_key_first($result)] ?? [];
    }

    /**
     * Create a new dashboard and return the id
     *
     * @param array $data
     * @return int
     */
    public function create(array $data): int
    {
        // Create the Query
        $Query = $this->Database->query()
            ->table('dashboards')
            ->insert($data);

        // Execute the Query
        $affectedRows = $Query->execute();

        // Execute the Query
        return $Query->lastId();
    }

    /**
     * Update a dashboard
     *
     * @param int $id
     * @param array $data
     * @return int
     */
    public function update(int $id, array $data): int
    {
        // Create the Query
        $Query = $this->Database->query()
            ->table('dashboards')
            ->update($data)
            ->where('id', $id);

        // Execute the Query
        return $Query->execute();
    }
}
