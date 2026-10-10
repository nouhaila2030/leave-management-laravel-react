<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\Employee;

class EmployeeSeeder extends Seeder
{
    public function run()
    {
        // 🔥 Désactiver les contraintes de clés étrangères temporairement
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        
        // Supprimer les données des tables liées d'abord
        DB::table('leave_requests')->truncate();
        DB::table('leave_balances')->truncate();
        DB::table('notifications')->truncate();
        
        // Maintenant on peut supprimer les employés
        Employee::truncate();
        
        // 🔄 Réactiver les contraintes
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ✅ Créer l'administrateur avec les identifiants que vous utilisez
        Employee::create([
            'first_name' => 'Admin',
            'last_name' => 'System',
            'email' => 'admin@leave-management.local',
            'phone' => '+212600000001',
            'department' => 'Administration',
            'position' => 'Administrateur Système',
            'employee_id' => 'ADM001',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'is_active' => true,
            'hire_date' => now()->subYears(2),
            'cin' => 'ADM001',
            'address' => 'Maroc'
        ]);

        // ✅ Créer l'employé avec les identifiants que vous utilisez
        Employee::create([
            'first_name' => 'Mohamed',
            'last_name' => 'ALLAOUI',
            'email' => 'employee@leave-management.local',
            'phone' => '+212600000002',
            'department' => 'Ressources Humaines',
            'position' => 'Gestionnaire RH',
            'employee_id' => 'EMP001',
            'password' => Hash::make('password111'),
            'role' => 'employee',
            'is_active' => true,
            'hire_date' => now()->subYear(),
            'cin' => 'EMP001',
            'address' => 'Maroc'
        ]);

       

        $this->command->info('✅ Utilisateurs créés avec succès:');
        $this->command->info('👤 Admin: admin@leave-management.local / password123');
        $this->command->info('👤 Employé: employee@leave-management.local / password111');
        
    }
}
