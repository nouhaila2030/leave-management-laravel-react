<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            LeaveTypeSeeder::class,  // D'abord les types de congés
            EmployeeSeeder::class,   // Ensuite les employés
        ]);
        
        $this->command->info('🎉 Base de données initialisée avec succès!');
    }
}
